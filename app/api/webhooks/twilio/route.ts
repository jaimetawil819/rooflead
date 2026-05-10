import { after, NextRequest, NextResponse } from "next/server";
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

export const maxDuration = 30;

type ProcessLeadConversationInput = {
  leadId: string;
  businessId: string;
  leadName: string | null;
  from: string;
};

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

async function processLeadConversation({
  leadId,
  businessId,
  leadName,
  from,
}: ProcessLeadConversationInput) {
  const supabase = getAdminClient();

  try {
    const { data: messages } = await supabase
      .from("messages")
      .select("role, body")
      .eq("lead_id", leadId)
      .order("sent_at", { ascending: true });

    const history = (messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.body,
    }));

    const [{ data: business }, { data: widget }] = await Promise.all([
      supabase
        .from("businesses")
        .select("name, notification_phone")
        .eq("id", businessId)
        .single(),
      supabase
        .from("form_widgets")
        .select("services, intake_question")
        .eq("business_id", businessId)
        .single(),
    ]);

    const businessName = business?.name ?? "the team";
    const services = widget?.services ?? [];
    const intakeQuestion =
      widget?.intake_question ?? "What type of roofing issue are you dealing with?";

    const { reply, isComplete } = await generateConversationReply(
      businessName,
      history,
      services,
      intakeQuestion
    );

    await supabase.from("messages").insert({
      lead_id: leadId,
      role: "assistant",
      body: reply,
    });

    try {
      await sendSMS(from, reply);
    } catch (err) {
      console.error("SMS send failed:", err);
    }

    if (!isComplete) return;

    const allMessages = [...history, { role: "assistant", content: reply }];
    const {
      summary,
      score,
      urgency,
      timeline,
      isHomeowner,
      qualificationReason,
    } = await generateLeadSummary(allMessages);
    const nextStatus =
      score === "unqualified" || isHomeowner === false ? "junk" : "qualified";

    await supabase
      .from("leads")
      .update({
        summary,
        lead_score: score,
        urgency,
        timeline,
        is_homeowner: isHomeowner,
        qualification_reason: qualificationReason,
        status: nextStatus,
      })
      .eq("id", leadId);

    if (
      business?.notification_phone &&
      !(await isSmsOptedOut(supabase, business.notification_phone))
    ) {
      const leadLabel = leadName ?? "New lead";
      const notifMsg = `${score.toUpperCase()} lead - ${leadLabel}\n${summary}\nCall: ${from}\nView: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${leadId}`;
      await sendSMS(business.notification_phone, notifMsg);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Inbound lead processing failed for lead ${leadId}: ${message}`);
  }
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

  after(async () => {
    await processLeadConversation({
      leadId: lead.id,
      businessId: lead.business_id,
      leadName: lead.name,
      from,
    });
  });

  return emptyTwimlResponse();
}
