import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSmsOptedOut } from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const supabase = getAdminClient();
  const { widgetKey } = await params;
  const { name, phone, address, serviceType } = await req.json();

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("business_id, intake_question, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

  const businessName = (widget.businesses as any)?.name ?? "the team";
  const intakeQuestion = widget.intake_question ?? "What type of roofing issue are you dealing with?";

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

  // Send greeting SMS to the lead unless this phone has opted out.
  if (phone) {
    const optedOut = await isSmsOptedOut(supabase, phone);

    if (optedOut) {
      await supabase
        .from("leads")
        .update({ sms_opted_out_at: new Date().toISOString() })
        .eq("id", lead.id);
    } else {
      const greeting = `Hi ${name ?? "there"}! Thanks for reaching out to ${businessName}. I have a few quick questions to make sure we can help you. ${intakeQuestion}`;
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
  }

  return NextResponse.json({ success: true, leadId: lead.id });
}
