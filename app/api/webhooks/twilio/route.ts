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
import { createRequestLogger } from "@/lib/logger";
import { appBaseUrl } from "@/lib/site";

export const maxDuration = 30;

type ProcessLeadConversationInput = {
  leadId: string;
  businessId: string;
  leadName: string | null;
  from: string;
  logger: ReturnType<typeof createRequestLogger>;
};

type ActiveLead = {
  id: string;
  business_id: string;
  status: string;
  name: string | null;
  owner_takeover_at: string | null;
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

function emptyTwimlResponse(requestId?: string) {
  return new NextResponse("<Response></Response>", {
    headers: {
      "Content-Type": "text/xml",
      ...(requestId ? { "x-request-id": requestId } : {}),
    },
  });
}

async function processLeadConversation({
  leadId,
  businessId,
  leadName,
  from,
  logger,
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

    const { reply, isComplete, needsHumanReview, handoffReason } =
      await generateConversationReply(
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

    await supabase
      .from("leads")
      .update({
        last_message_at: new Date().toISOString(),
        ...(needsHumanReview
          ? {
              needs_human_review: true,
              handoff_reason: handoffReason,
              status: "contacted",
            }
          : {}),
      })
      .eq("id", leadId);

    try {
      await sendSMS(from, reply);
    } catch (err) {
      logger.error("twilio.reply_sms_failed", err, { leadId, businessId });
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
        needs_human_review: false,
        handoff_reason: null,
      })
      .eq("id", leadId);

    if (
      business?.notification_phone &&
      !(await isSmsOptedOut(supabase, business.notification_phone))
    ) {
      const leadLabel = leadName ?? "New lead";
      const notifMsg = `${score.toUpperCase()} lead - ${leadLabel}\n${summary}\nCall: ${from}\nView: ${appBaseUrl}/dashboard/leads/${leadId}`;
      await sendSMS(business.notification_phone, notifMsg);
    }

    logger.info("twilio.conversation_processed", {
      leadId,
      businessId,
      isComplete,
    });
  } catch (err) {
    await supabase
      .from("leads")
      .update({
        needs_human_review: true,
        handoff_reason: "Conversation processing failed.",
      })
      .eq("id", leadId);

    logger.error("twilio.conversation_processing_failed", err, {
      leadId,
      businessId,
    });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getAdminClient();
  const logger = createRequestLogger("twilio_webhook");
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
      logger.warn("twilio.signature_invalid");
      return new NextResponse("Forbidden", {
        status: 403,
        headers: { "x-request-id": logger.requestId },
      });
    }
  }

  const from = params.From;
  const text = params.Body?.trim();
  const messageSid = params.MessageSid;

  if (!from || !text) {
    logger.warn("twilio.bad_request");
    return new NextResponse("Bad request", {
      status: 400,
      headers: { "x-request-id": logger.requestId },
    });
  }

  if (await hasProcessedTwilioMessage(messageSid)) {
    logger.info("twilio.duplicate_message", { messageSid });
    return emptyTwimlResponse(logger.requestId);
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

    logger.info("twilio.opt_out_recorded", {
      leadCount: optedOutLeadIds.length,
    });

    return new NextResponse(
      "<Response><Message>You have been unsubscribed and will receive no further messages.</Message></Response>",
      {
        headers: {
          "Content-Type": "text/xml",
          "x-request-id": logger.requestId,
        },
      }
    );
  }

  if (await isSmsOptedOut(supabase, from)) {
    logger.info("twilio.opted_out_message_skipped");
    return emptyTwimlResponse(logger.requestId);
  }

  // Find the most recent active lead for this phone number.
  // Excludes completed/closed leads so a returning homeowner doesn't
  // corrupt a finished conversation from another business.
  const { data: activeLead } = await supabase
    .from("leads")
    .select("id, business_id, status, name, owner_takeover_at")
    .in("phone", phoneCandidates)
    .not("status", "in", '("qualified","unresponsive","won","lost","junk")')
    .order("created_at", { ascending: false })
    .limit(1)
    .single<ActiveLead>();

  const { data: ownerTakeoverLead } = activeLead
    ? { data: null }
    : await supabase
        .from("leads")
        .select("id, business_id, status, name, owner_takeover_at")
        .in("phone", phoneCandidates)
        .not("owner_takeover_at", "is", null)
        .not("status", "in", '("unresponsive","won","lost","junk")')
        .order("created_at", { ascending: false })
        .limit(1)
        .single<ActiveLead>();

  const lead = activeLead ?? ownerTakeoverLead;

  if (!lead) {
    logger.info("twilio.no_active_lead");
    return emptyTwimlResponse(logger.requestId);
  }

  const { error: inboundMessageError } = await supabase.from("messages").insert({
    lead_id: lead.id,
    role: "user",
    body: text,
    twilio_message_sid: messageSid ?? null,
  });

  if (inboundMessageError?.code === "23505") {
    logger.info("twilio.duplicate_message_insert", { messageSid });
    return emptyTwimlResponse(logger.requestId);
  }

  if (inboundMessageError) {
    logger.error("twilio.inbound_message_insert_failed", inboundMessageError, {
      leadId: lead.id,
      businessId: lead.business_id,
    });
    return new NextResponse("Message insert failed", {
      status: 500,
      headers: { "x-request-id": logger.requestId },
    });
  }

  await supabase
    .from("leads")
    .update(
      lead.owner_takeover_at
        ? {
            last_message_at: new Date().toISOString(),
            needs_human_review: true,
            handoff_reason: "Homeowner replied after owner takeover.",
          }
        : { last_message_at: new Date().toISOString() }
    )
    .eq("id", lead.id);

  if (lead.owner_takeover_at) {
    logger.info("twilio.owner_takeover_reply_recorded", {
      leadId: lead.id,
      businessId: lead.business_id,
      messageSid,
    });

    return emptyTwimlResponse(logger.requestId);
  }

  after(async () => {
    await processLeadConversation({
      leadId: lead.id,
      businessId: lead.business_id,
      leadName: lead.name,
      from,
      logger,
    });
  });

  logger.info("twilio.inbound_message_accepted", {
    leadId: lead.id,
    businessId: lead.business_id,
    messageSid,
  });

  return emptyTwimlResponse(logger.requestId);
}
