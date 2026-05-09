import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateConversationReply, generateLeadSummary } from "@/lib/ai";
import { sendSMS } from "@/lib/twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const from = params.From;
  const text = params.Body?.trim();

  if (!from || !text) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Handle STOP immediately
  if (text.toUpperCase() === "STOP") {
    return new NextResponse(
      "<Response><Message>You have been unsubscribed and will receive no further messages.</Message></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  // Find the lead by phone number
  const { data: lead } = await supabase
    .from("leads")
    .select("id, business_id, status")
    .eq("phone", from)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!lead) {
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Save the inbound message
  await supabase.from("messages").insert({
    lead_id: lead.id,
    role: "user",
    body: text,
  });

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

  // Get business name
  const { data: business } = await supabase
    .from("businesses")
    .select("name, notification_phone")
    .eq("id", lead.business_id)
    .single();

  const businessName = business?.name ?? "the team";

  // Generate AI reply
  const reply = await generateConversationReply(businessName, history);

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

  // Check if conversation is complete
  const isComplete = reply.includes("I have everything I need");

  if (isComplete) {
    // Generate lead summary
    const allMessages = [...history, { role: "assistant", content: reply }];
    try {
      const { summary, score } = await generateLeadSummary(allMessages);
      await supabase
        .from("leads")
        .update({ summary, lead_score: score, status: "qualified" })
        .eq("id", lead.id);

      // Notify the business owner
      if (business?.notification_phone) {
        await sendSMS(
          business.notification_phone,
          `New qualified lead: ${from}. Score: ${score.toUpperCase()}. Summary: ${summary} View: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}`
        );
      }
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  }

  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}