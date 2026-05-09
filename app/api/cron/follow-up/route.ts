import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Called by Vercel Cron every 10 minutes.
// Finds leads with no reply after 30 min → sends one follow-up → marks unresponsive if still no reply after 60 min.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const sixtyMinAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  // 1. Mark as unresponsive: follow-up was sent 30+ min ago and no reply since
  const { data: toMarkUnresponsive } = await supabase
    .from("leads")
    .select("id")
    .eq("status", "new")
    .eq("follow_up_sent", true)
    .lt("created_at", sixtyMinAgo);

  if (toMarkUnresponsive && toMarkUnresponsive.length > 0) {
    const ids = toMarkUnresponsive.map((l) => l.id);
    await supabase.from("leads").update({ status: "unresponsive" }).in("id", ids);
  }

  // 2. Send follow-up: no response 30+ min after creation, follow-up not yet sent
  const { data: toFollowUp } = await supabase
    .from("leads")
    .select("id, phone, name, business_id")
    .eq("status", "new")
    .eq("follow_up_sent", false)
    .lt("created_at", thirtyMinAgo);

  if (!toFollowUp || toFollowUp.length === 0) {
    return NextResponse.json({ sent: 0, markedUnresponsive: toMarkUnresponsive?.length ?? 0 });
  }

  let sent = 0;

  for (const lead of toFollowUp) {
    // Check if the lead has replied at all (has any user messages)
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead.id)
      .eq("role", "user");

    if ((count ?? 0) > 0) {
      // They replied — conversation is active, don't send follow-up
      await supabase.from("leads").update({ follow_up_sent: true }).eq("id", lead.id);
      continue;
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", lead.business_id)
      .single();

    const businessName = business?.name ?? "us";
    const firstName = lead.name?.split(" ")[0] ?? "there";
    const followUpMsg = `Hi ${firstName}, just following up from ${businessName}! We'd love to help — what can we assist you with today?`;

    try {
      await sendSMS(lead.phone, followUpMsg);
      await supabase.from("messages").insert({ lead_id: lead.id, role: "assistant", body: followUpMsg });
      await supabase.from("leads").update({ follow_up_sent: true }).eq("id", lead.id);
      sent++;
    } catch (err) {
      console.error(`Follow-up SMS failed for lead ${lead.id}:`, err);
    }
  }

  return NextResponse.json({ sent, markedUnresponsive: toMarkUnresponsive?.length ?? 0 });
}
