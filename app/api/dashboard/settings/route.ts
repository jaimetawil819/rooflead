import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type BusinessPatch = {
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
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, notification_phone")
    .eq("owner_id", userId)
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { data: widget } = await supabase
    .from("form_widgets")
    .select("id, widget_key, services, intake_question")
    .eq("business_id", business.id)
    .single();

  return NextResponse.json({ business, widget });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as BusinessPatch | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = cleanText(body.name, 120);
  const notificationPhone = cleanText(body.notificationPhone, 30);

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("businesses")
    .update({ name, notification_phone: notificationPhone || null })
    .eq("owner_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
