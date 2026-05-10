import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createRequestLogger } from "@/lib/logger";

const STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "appointment_set",
  "won",
  "lost",
  "junk",
  "unresponsive",
]);

type StatusPatch = {
  status?: unknown;
};

async function getOwnedLead(id: string, userId: string) {
  const supabase = getAdminClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*, businesses!inner(owner_id)")
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getAdminClient();
  const lead = await getOwnedLead(id, userId);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("lead_id", id)
    .order("sent_at", { ascending: true });

  return NextResponse.json({ lead, messages: messages ?? [] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as StatusPatch | null;
  const status = typeof body?.status === "string" ? body.status : "";

  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { id } = await params;
  const lead = await getOwnedLead(id, userId);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const logger = createRequestLogger("dashboard_lead_delete");
  const { userId } = await auth();
  if (!userId) {
    logger.warn("lead_delete.unauthorized");
    return NextResponse.json(
      { error: "Unauthorized", requestId: logger.requestId },
      { status: 401, headers: { "x-request-id": logger.requestId } }
    );
  }

  const { id } = await params;
  const lead = await getOwnedLead(id, userId);

  if (!lead) {
    logger.warn("lead_delete.not_found", { leadId: id });
    return NextResponse.json(
      { error: "Lead not found", requestId: logger.requestId },
      { status: 404, headers: { "x-request-id": logger.requestId } }
    );
  }

  const supabase = getAdminClient();

  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("lead_id", id);

  if (messagesError) {
    logger.error("lead_delete.messages_failed", messagesError, { leadId: id });
    return NextResponse.json(
      {
        error: "Failed to delete lead messages",
        requestId: logger.requestId,
      },
      { status: 500, headers: { "x-request-id": logger.requestId } }
    );
  }

  const { error: leadError } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (leadError) {
    logger.error("lead_delete.lead_failed", leadError, { leadId: id });
    return NextResponse.json(
      { error: "Failed to delete lead", requestId: logger.requestId },
      { status: 500, headers: { "x-request-id": logger.requestId } }
    );
  }

  logger.info("lead_delete.completed", { leadId: id });
  return NextResponse.json(
    { success: true },
    { headers: { "x-request-id": logger.requestId } }
  );
}
