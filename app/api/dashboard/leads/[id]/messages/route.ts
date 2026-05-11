import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSmsOptedOut } from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";
import { createRequestLogger } from "@/lib/logger";

type ManualReplyBody = {
  body?: unknown;
};

function sanitizeReply(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

async function getOwnedLead(id: string, userId: string) {
  const supabase = getAdminClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id, business_id, phone, status, businesses!inner(owner_id)")
    .eq("id", id)
    .single();

  const business = Array.isArray(lead?.businesses)
    ? lead?.businesses[0]
    : lead?.businesses;

  if (!lead || business?.owner_id !== userId) return null;

  const leadWithoutBusiness = { ...lead };
  delete (leadWithoutBusiness as { businesses?: unknown }).businesses;
  return leadWithoutBusiness;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const logger = createRequestLogger("dashboard_manual_reply");
  const { userId } = await auth();

  if (!userId) {
    logger.warn("manual_reply.unauthorized");
    return NextResponse.json(
      { error: "Unauthorized", requestId: logger.requestId },
      { status: 401, headers: { "x-request-id": logger.requestId } }
    );
  }

  const { id } = await params;
  const lead = await getOwnedLead(id, userId);

  if (!lead) {
    logger.warn("manual_reply.lead_not_found", { leadId: id });
    return NextResponse.json(
      { error: "Lead not found", requestId: logger.requestId },
      { status: 404, headers: { "x-request-id": logger.requestId } }
    );
  }

  const body = (await req.json().catch(() => null)) as ManualReplyBody | null;
  const reply = sanitizeReply(body?.body);

  if (reply.length < 2) {
    return NextResponse.json(
      { error: "Reply must be at least 2 characters", requestId: logger.requestId },
      { status: 400, headers: { "x-request-id": logger.requestId } }
    );
  }

  if (!lead.phone) {
    return NextResponse.json(
      { error: "Lead has no phone number", requestId: logger.requestId },
      { status: 400, headers: { "x-request-id": logger.requestId } }
    );
  }

  const supabase = getAdminClient();

  if (await isSmsOptedOut(supabase, lead.phone)) {
    logger.warn("manual_reply.opted_out", { leadId: id });
    return NextResponse.json(
      { error: "This phone number has opted out of SMS", requestId: logger.requestId },
      { status: 409, headers: { "x-request-id": logger.requestId } }
    );
  }

  try {
    await sendSMS(lead.phone, reply);
  } catch (error) {
    logger.error("manual_reply.sms_failed", error, { leadId: id });
    return NextResponse.json(
      { error: "Failed to send SMS", requestId: logger.requestId },
      { status: 502, headers: { "x-request-id": logger.requestId } }
    );
  }

  const now = new Date().toISOString();

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      lead_id: id,
      role: "owner",
      body: reply,
    })
    .select("id, role, body, sent_at")
    .single();

  if (messageError) {
    logger.error("manual_reply.message_insert_failed", messageError, {
      leadId: id,
    });
    return NextResponse.json(
      { error: "SMS sent, but message could not be saved", requestId: logger.requestId },
      { status: 500, headers: { "x-request-id": logger.requestId } }
    );
  }

  await supabase
    .from("leads")
    .update({
      status: lead.status === "new" ? "contacted" : lead.status,
      needs_human_review: false,
      handoff_reason: null,
      owner_takeover_at: now,
      last_message_at: now,
    })
    .eq("id", id);

  logger.info("manual_reply.sent", { leadId: id });
  return NextResponse.json(
    { message },
    { headers: { "x-request-id": logger.requestId } }
  );
}
