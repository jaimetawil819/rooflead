import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type OnboardingBody = {
  name?: unknown;
  notificationPhone?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, notification_phone")
    .eq("owner_id", userId)
    .single();

  return NextResponse.json({ business });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as OnboardingBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = cleanText(body.name, 120);
  const notificationPhone = cleanText(body.notificationPhone, 30);

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .upsert(
      { owner_id: userId, name, notification_phone: notificationPhone || null },
      { onConflict: "owner_id" }
    )
    .select("id, name, notification_phone")
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
  }

  const { data: existingWidget } = await supabase
    .from("form_widgets")
    .select("widget_key")
    .eq("business_id", business.id)
    .single();

  if (existingWidget) {
    return NextResponse.json({ business, widgetKey: existingWidget.widget_key });
  }

  const { data: newWidget, error: widgetError } = await supabase
    .from("form_widgets")
    .insert({ business_id: business.id })
    .select("widget_key")
    .single();

  if (widgetError || !newWidget) {
    return NextResponse.json({ error: "Failed to create form widget" }, { status: 500 });
  }

  return NextResponse.json({ business, widgetKey: newWidget.widget_key });
}

export async function PATCH() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("businesses")
    .update({ onboarding_complete: true })
    .eq("owner_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to finish onboarding" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
