import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = Object.fromEntries(new URLSearchParams(body));

  const from = params.From;
  const text = params.Body;

  if (!from || !text) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Handle STOP immediately
  if (text.trim().toUpperCase() === "STOP") {
    return new NextResponse(
      "<Response><Message>You have been unsubscribed.</Message></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  // Find the lead by phone number
  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", from)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lead) {
    await supabase.from("messages").insert({
      lead_id: lead.id,
      role: "user",
      body: text,
    });
  }

  // Empty response — AI will handle replies in Phase 6
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}