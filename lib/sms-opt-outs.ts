import type { SupabaseClient } from "@supabase/supabase-js";
import { getPhoneLookupCandidates, normalizePhoneNumber } from "@/lib/phone";

const SMS_OPT_OUT_KEYWORDS = new Set([
  "STOP",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
]);

export function isSmsOptOutKeyword(message: string) {
  return SMS_OPT_OUT_KEYWORDS.has(message.trim().toUpperCase());
}

export async function isSmsOptedOut(
  supabase: SupabaseClient,
  phone: string | null | undefined
) {
  const candidates = getPhoneLookupCandidates(phone);
  if (candidates.length === 0) return false;

  const { data, error } = await supabase
    .from("sms_opt_outs")
    .select("id")
    .in("phone", candidates)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("SMS opt-out lookup failed:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function recordSmsOptOut(
  supabase: SupabaseClient,
  phone: string,
  keyword: string,
  source = "twilio"
) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;

  const now = new Date().toISOString();
  const { error } = await supabase.from("sms_opt_outs").upsert(
    {
      phone: normalizedPhone,
      keyword: keyword.trim().toUpperCase(),
      source,
      updated_at: now,
    },
    { onConflict: "phone" }
  );

  if (error) {
    console.error("SMS opt-out record failed:", error.message);
  }

  return normalizedPhone;
}
