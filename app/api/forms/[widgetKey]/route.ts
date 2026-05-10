import { NextRequest, NextResponse } from "next/server";
import { parseLeadFormBody } from "@/lib/form-validation";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/supabase/admin";
import { isSmsOptedOut } from "@/lib/sms-opt-outs";
import { sendSMS } from "@/lib/twilio";

type WidgetBusiness = { name: string | null };
type WidgetRow = {
  business_id: string;
  intake_question: string | null;
  businesses: WidgetBusiness | WidgetBusiness[] | null;
};

function getBusinessName(businesses: WidgetRow["businesses"]) {
  if (Array.isArray(businesses)) {
    return businesses[0]?.name ?? "the team";
  }

  return businesses?.name ?? "the team";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const supabase = getAdminClient();
  const { widgetKey } = await params;

  const clientIp = getClientIp(req.headers);
  const rateLimit = checkRateLimit(`lead-form:${widgetKey}:${clientIp}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const validation = parseLeadFormBody(await req.text());

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  const { name, phone, address, serviceType } = validation.data;

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("business_id, intake_question, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

  const typedWidget = widget as WidgetRow;
  const businessName = getBusinessName(typedWidget.businesses);
  const intakeQuestion = widget.intake_question ?? "What type of roofing issue are you dealing with?";
  const duplicateWindowStart = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: recentLead } = await supabase
    .from("leads")
    .select("id")
    .eq("business_id", typedWidget.business_id)
    .eq("phone", phone)
    .gte("created_at", duplicateWindowStart)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentLead) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      leadId: recentLead.id,
    });
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      business_id: typedWidget.business_id,
      name,
      phone,
      address,
      service_type: serviceType,
      status: "new",
      last_message_at: new Date().toISOString(),
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

      // Save greeting to messages table.
      await supabase.from("messages").insert({
        lead_id: lead.id,
        role: "assistant",
        body: greeting,
      });

      await supabase
        .from("leads")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", lead.id);
    }
  }

  return NextResponse.json({ success: true, leadId: lead.id });
}
