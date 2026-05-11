import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type BusinessPatch = {
  name?: unknown;
  notificationPhone?: unknown;
  averageJobValue?: unknown;
  schedulingEnabled?: unknown;
  schedulingTimezone?: unknown;
  schedulingAvailableDays?: unknown;
  schedulingStartTime?: unknown;
  schedulingEndTime?: unknown;
  inspectionDurationMinutes?: unknown;
  schedulingBufferMinutes?: unknown;
};

const DEFAULT_AVAILABLE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];
const VALID_DAYS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseAverageJobValueCents(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/[$,]/g, ""))
        : Number.NaN;

  if (!Number.isFinite(numericValue)) return 800000;

  const dollars = Math.max(0, Math.min(1000000, numericValue));
  return Math.round(dollars * 100);
}

function parseAvailableDays(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_AVAILABLE_DAYS;

  const days = value
    .filter((day): day is string => typeof day === "string")
    .map((day) => day.toLowerCase())
    .filter((day) => VALID_DAYS.has(day));

  const uniqueDays = [...new Set(days)].slice(0, 7);
  return uniqueDays.length > 0 ? uniqueDays : DEFAULT_AVAILABLE_DAYS;
}

function parseTime(value: unknown, fallback: string) {
  const time = cleanText(value, 5);
  return /^\d{2}:\d{2}$/.test(time) ? time : fallback;
}

function parseBoundedMinutes(value: unknown, fallback: number, min: number, max: number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) return fallback;

  return Math.max(min, Math.min(max, Math.round(numericValue)));
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, notification_phone, average_job_value_cents, scheduling_enabled, scheduling_timezone, scheduling_available_days, scheduling_start_time, scheduling_end_time, inspection_duration_minutes, scheduling_buffer_minutes")
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
  const averageJobValueCents = parseAverageJobValueCents(body.averageJobValue);
  const schedulingEnabled =
    typeof body.schedulingEnabled === "boolean" ? body.schedulingEnabled : true;
  const schedulingTimezone =
    cleanText(body.schedulingTimezone, 80) || "America/Los_Angeles";
  const schedulingAvailableDays = parseAvailableDays(body.schedulingAvailableDays);
  const schedulingStartTime = parseTime(body.schedulingStartTime, "08:00");
  const schedulingEndTime = parseTime(body.schedulingEndTime, "17:00");
  const inspectionDurationMinutes = parseBoundedMinutes(
    body.inspectionDurationMinutes,
    60,
    15,
    240
  );
  const schedulingBufferMinutes = parseBoundedMinutes(
    body.schedulingBufferMinutes,
    15,
    0,
    120
  );

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      notification_phone: notificationPhone || null,
      average_job_value_cents: averageJobValueCents,
      scheduling_enabled: schedulingEnabled,
      scheduling_timezone: schedulingTimezone,
      scheduling_available_days: schedulingAvailableDays,
      scheduling_start_time: schedulingStartTime,
      scheduling_end_time: schedulingEndTime,
      inspection_duration_minutes: inspectionDurationMinutes,
      scheduling_buffer_minutes: schedulingBufferMinutes,
    })
    .eq("owner_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
