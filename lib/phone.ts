export function normalizePhoneNumber(phone: string | null | undefined) {
  if (!phone) return null;

  const trimmed = phone.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

export function getPhoneLookupCandidates(phone: string | null | undefined) {
  if (!phone) return [];

  const trimmed = phone.trim();
  const normalized = normalizePhoneNumber(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  const candidates = [trimmed, normalized];

  if (digits) {
    candidates.push(digits);

    if (digits.length === 10) {
      candidates.push(`1${digits}`, `+1${digits}`);
    }

    if (digits.length === 11 && digits.startsWith("1")) {
      candidates.push(digits.slice(1), `+${digits}`);
    }
  }

  return Array.from(new Set(candidates.filter(Boolean))) as string[];
}
