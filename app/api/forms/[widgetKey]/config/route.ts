import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type WidgetBusiness = { name: string | null };
type WidgetConfigRow = {
  services: { label: string; value: string }[] | null;
  intake_question: string | null;
  businesses: WidgetBusiness | WidgetBusiness[] | null;
};

function getBusinessName(businesses: WidgetConfigRow["businesses"]) {
  if (Array.isArray(businesses)) {
    return businesses[0]?.name ?? "";
  }

  return businesses?.name ?? "";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  const supabase = getAdminClient();
  const { widgetKey } = await params;

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("services, intake_question, businesses(name)")
    .eq("widget_key", widgetKey)
    .single();

  if (!widget) {
    return NextResponse.json({ error: "Invalid widget key" }, { status: 404 });
  }

  const typedWidget = widget as WidgetConfigRow;
  const businessName = getBusinessName(typedWidget.businesses);

  const res = NextResponse.json({
    businessName,
    services: typedWidget.services ?? [],
    intakeQuestion: typedWidget.intake_question ?? "",
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
