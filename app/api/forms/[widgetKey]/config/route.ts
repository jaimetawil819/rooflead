import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const { widgetKey } = await params;

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("services, intake_question, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

  const businessName = (widget.businesses as any)?.name ?? "";

  const res = NextResponse.json({
    businessName,
    services: widget.services ?? [],
    intakeQuestion: widget.intake_question ?? "",
  });

  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

  return res;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
