import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    .select("business_id")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

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

  return NextResponse.json({ success: true, leadId: lead.id });
}