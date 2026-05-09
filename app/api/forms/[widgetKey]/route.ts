import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/twilio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const { widgetKey } = await params;
  const { name, phone, address, serviceType } = await req.json();

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("business_id, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

  const businessName = (widget.businesses as any)?.name ?? "the team";

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      business_id: widget.business_id,
      name,
      phone,
      address,
      service_type: serviceType,
      status: "new",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }

    // Send greeting SMS to the lead
    if (phone) {
        const greeting = `Hi ${name ?? "there"}! Thanks for reaching out to ${businessName}. I have a few quick questions to make sure we can help you. What type of roofing issue are you dealing with? (repair, replacement, storm damage, or inspection)`;
        try {
          await sendSMS(phone, greeting);
        } catch (err) {
          console.error("SMS failed:", err);
        }
    
        // Save greeting to messages table
        await supabase.from("messages").insert({
          lead_id: lead.id,
          role: "assistant",
          body: greeting,
        });
      }

  return NextResponse.json({ success: true, leadId: lead.id });
}