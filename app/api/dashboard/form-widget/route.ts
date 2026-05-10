import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type ServiceInput = {
  label?: unknown;
  value?: unknown;
};

type FormWidgetPatch = {
  widgetId?: unknown;
  services?: unknown;
  intakeQuestion?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function normalizeServices(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 20)
    .map((service: ServiceInput) => {
      const label = cleanText(service?.label, 80);
      const rawValue = cleanText(service?.value, 80);
      const normalizedValue =
        rawValue || label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

      return label ? { label, value: normalizedValue } : null;
    })
    .filter(Boolean);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as FormWidgetPatch | null;
  if (!body || typeof body.widgetId !== "string") {
    return NextResponse.json({ error: "Invalid form widget request" }, { status: 400 });
  }

  const services = normalizeServices(body.services);
  const intakeQuestion = cleanText(body.intakeQuestion, 250);
  const supabase = getAdminClient();

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("id, businesses!inner(owner_id)")
    .eq("id", body.widgetId)
    .single();

  const business = Array.isArray(widget?.businesses)
    ? widget?.businesses[0]
    : widget?.businesses;

  if (!widget || business?.owner_id !== userId) {
    return NextResponse.json({ error: "Form widget not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("form_widgets")
    .update({
      services,
      intake_question: intakeQuestion || "What type of roofing issue are you dealing with?",
    })
    .eq("id", body.widgetId);

  if (error) {
    return NextResponse.json({ error: "Failed to update form widget" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
