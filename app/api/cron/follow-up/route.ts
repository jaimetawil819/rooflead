import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSmsOptedOut } from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";

const FOLLOW_UP_DELAY_MINUTES = 30;
const UNRESPONSIVE_AFTER_FOLLOW_UP_MINUTES = 60;
const STALE_CONVERSATION_MINUTES = 120;

type FollowUpLead = {
  id: string;
  phone: string | null;
  name: string | null;
  business_id: string;
};

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

async function hasUserMessages(supabase: ReturnType<typeof getAdminClient>, leadId: string) {
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId)
    .eq("role", "user");

  return (count ?? 0) > 0;
}

// Called by cron. Sends one follow-up to untouched leads, then marks stale
// conversations unresponsive when the homeowner stops replying.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();

  const followUpCutoff = minutesAgo(FOLLOW_UP_DELAY_MINUTES);
  const followUpUnresponsiveCutoff = minutesAgo(
    UNRESPONSIVE_AFTER_FOLLOW_UP_MINUTES
  );
  const staleConversationCutoff = minutesAgo(STALE_CONVERSATION_MINUTES);

  let markedUnresponsive = 0;
  let markedStaleConversations = 0;

  const { data: toMarkUnresponsive } = await supabase
    .from("leads")
    .select("id")
    .eq("status", "new")
    .eq("follow_up_sent", true)
    .lt("last_message_at", followUpUnresponsiveCutoff);

  if (toMarkUnresponsive && toMarkUnresponsive.length > 0) {
    const ids = toMarkUnresponsive.map((lead) => lead.id);
    await supabase
      .from("leads")
      .update({ status: "unresponsive" })
      .in("id", ids);
    markedUnresponsive = ids.length;
  }

  const { data: staleCandidates } = await supabase
    .from("leads")
    .select("id")
    .eq("status", "new")
    .eq("follow_up_sent", false)
    .lt("last_message_at", staleConversationCutoff);

  for (const lead of staleCandidates ?? []) {
    if (await hasUserMessages(supabase, lead.id)) {
      await supabase
        .from("leads")
        .update({ status: "unresponsive" })
        .eq("id", lead.id);
      markedStaleConversations++;
    }
  }

  const { data: toFollowUp } = await supabase
    .from("leads")
    .select("id, phone, name, business_id")
    .eq("status", "new")
    .eq("follow_up_sent", false)
    .lt("last_message_at", followUpCutoff);

  let sent = 0;
  let skippedOptOuts = 0;
  let skippedActiveConversations = 0;

  for (const lead of (toFollowUp ?? []) as FollowUpLead[]) {
    if (!lead.phone) continue;

    if (await hasUserMessages(supabase, lead.id)) {
      skippedActiveConversations++;
      continue;
    }

    if (await isSmsOptedOut(supabase, lead.phone)) {
      await supabase
        .from("leads")
        .update({
          follow_up_sent: true,
          sms_opted_out_at: new Date().toISOString(),
        })
        .eq("id", lead.id);
      skippedOptOuts++;
      continue;
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", lead.business_id)
      .single();

    const businessName = business?.name ?? "us";
    const firstName = lead.name?.split(" ")[0] ?? "there";
    const followUpMsg = `Hi ${firstName}, just following up from ${businessName}! We'd love to help - what can we assist you with today?`;

    try {
      await sendSMS(lead.phone, followUpMsg);
      await supabase.from("messages").insert({
        lead_id: lead.id,
        role: "assistant",
        body: followUpMsg,
      });
      await supabase
        .from("leads")
        .update({
          follow_up_sent: true,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", lead.id);
      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Follow-up SMS failed for lead ${lead.id}: ${message}`);
    }
  }

  return NextResponse.json({
    sent,
    skippedOptOuts,
    skippedActiveConversations,
    markedUnresponsive,
    markedStaleConversations,
  });
}
