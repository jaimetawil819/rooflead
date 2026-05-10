import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateConversationReply, generateLeadSummary } from "@/lib/ai";
import { getPhoneLookupCandidates } from "@/lib/phone";
import {
  isSmsOptedOut,
  isSmsOptOutKeyword,
  recordSmsOptOut,
} from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";

function getTwilioValidationUrl(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const protocol =
    req.headers.get("x-forwarded-proto") ??
    requestUrl.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    requestUrl.host;

  return `${protocol}://${host}${requestUrl.pathname}${requestUrl.search}`;
}

function shouldValidateTwilioRequest() {
  return process.env.TWILIO_VALIDATE_REQUESTS !== "false";
}

async function hasProcessedTwilioMessage(messageSid: string | undefined) {
  if (!messageSid) return false;

  const supabase = getAdminClient();
  const { data } = await supabase
    .from("messages")
    .select("id")
    .eq("twilio_message_sid", messageSid)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

function emptyTwimlResponse() {
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(req: NextRequest) {
  const supabase = getAdminClient();
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  // Twilio signs the exact public URL and POST params. Validate after reading
  // the raw form body, before trusting From/Body or touching lead data.
  if (shouldValidateTwilioRequest()) {
    const signature = req.headers.get("x-twilio-signature");
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const validationUrl = getTwilioValidationUrl(req);

    if (
      !signature ||
      !authToken ||
      !twilio.validateRequest(authToken, signature, validationUrl, params)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const from = params.From;
  const text = params.Body?.trim();
  const messageSid = params.MessageSid;

  if (!from || !text) {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (await hasProcessedTwilioMessage(messageSid)) {
    return emptyTwimlResponse();
  }

  const phoneCandidates = getPhoneLookupCandidates(from);

  // Handle carrier-recognized opt-out keywords before any AI response.
  if (isSmsOptOutKeyword(text)) {
    await recordSmsOptOut(supabase, from, text);

    const { data: optedOutLeads } = await supabase
      .from("leads")
      .select("id")
      .in("phone", phoneCandidates)
      .not("status", "in", '("qualified","unresponsive","won","lost","junk")');

    const optedOutLeadIds = optedOutLeads?.map((lead) => lead.id) ?? [];

    if (optedOutLeadIds.length > 0) {
      await supabase.from("messages").insert(
        optedOutLeadIds.map((leadId, index) => ({
          lead_id: leadId,
          role: "user",
          body: text,
          twilio_message_sid: index === 0 ? messageSid : null,
        }))
      );

      await supabase
        .from("leads")
        .update({
          status: "unresponsive",
          follow_up_sent: true,
          sms_opted_out_at: new Date().toISOString(),
        })
        .in("id", optedOutLeadIds);
    }

    return new NextResponse(
      "<Response><Message>You have been unsubscribed and will receive no further messages.</Message></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  if (await isSmsOptedOut(supabase, from)) {
    return emptyTwimlResponse();
  }

  // Find the most recent active lead for this phone number.
  // Excludes completed/closed leads so a returning homeowner doesn't
  // corrupt a finished conversation from another business.
  const { data: lead } = await supabase
    .from("leads")
    .select("id, business_id, status, name")
    .in("phone", phoneCandidates)
    .not("status", "in", '("qualified","unresponsive","won","lost","junk")')
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!lead) {
    return emptyTwimlResponse();
  }

  // Save the inbound message
  const { error: inboundMessageError } = await supabase.from("messages").insert({
    lead_id: lead.id,
    role: "user",
    body: text,
    twilio_message_sid: messageSid ?? null,
  });

  if (inboundMessageError?.code === "23505") {
    return emptyTwimlResponse();
  }

  if (inboundMessageError) {
    console.error("Inbound message insert failed:", inboundMessageError.message);
    return new NextResponse("Message insert failed", { status: 500 });
  }

  // Load full message history
  const { data: messages } = await supabase
    .from("messages")
    .select("role, body")
    .eq("lead_id", lead.id)
    .order("sent_at", { ascending: true });

  const history = (messages ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.body,
  }));

  // Get business name and widget config
  const [{ data: business }, { data: widget }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, notification_phone")
      .eq("id", lead.business_id)
      .single(),
    supabase
      .from("form_widgets")
      .select("services, intake_question")
      .eq("business_id", lead.business_id)
      .single(),
  ]);

  const businessName = business?.name ?? "the team";
  const services = widget?.services ?? [];
  const intakeQuestion = widget?.intake_question ?? "What type of roofing issue are you dealing with?";

  // Generate AI reply
  const { reply, isComplete } = await generateConversationReply(
    businessName,
    history,
    services,
    intakeQuestion
  );

  // Save AI reply
  await supabase.from("messages").insert({
    lead_id: lead.id,
    role: "assistant",
    body: reply,
  });

  // Send AI reply via SMS
  try {
    await sendSMS(from, reply);
  } catch (err) {
    console.error("SMS send failed:", err);
  }

  if (isComplete) {
    // Generate lead summary
    const allMessages = [...history, { role: "assistant", content: reply }];
    try {
      const {
        summary,
        score,
        urgency,
        timeline,
        isHomeowner,
        qualificationReason,
      } = await generateLeadSummary(allMessages);
      await supabase
        .from("leads")
        .update({
          summary,
          lead_score: score,
          urgency,
          timeline,
          is_homeowner: isHomeowner,
          qualification_reason: qualificationReason,
          status: "qualified",
        })
        .eq("id", lead.id);

      // Notify the business owner
      if (
        business?.notification_phone &&
        !(await isSmsOptedOut(supabase, business.notification_phone))
      ) {
        const scoreEmoji = score === "hot" ? "🔥" : score === "warm" ? "✅" : score === "cold" ? "❄️" : "⚠️";
        const leadName = lead.name ?? "New lead";
        const notifMsg = `${scoreEmoji} ${score.toUpperCase()} lead — ${leadName}\n${summary}\nCall: ${from}\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}`;
        await sendSMS(business.notification_phone, notifMsg);
      }
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  }

  return emptyTwimlResponse();
}
