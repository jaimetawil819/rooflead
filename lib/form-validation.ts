import { normalizePhoneNumber } from "@/lib/phone";

const MAX_BODY_BYTES = 5_000;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 250;
const MAX_SERVICE_TYPE_LENGTH = 50;

export type LeadFormInput = {
  name: string;
  phone: string;
  address: string | null;
  serviceType: string | null;
};

type ValidationResult =
  | { ok: true; data: LeadFormInput }
  | { ok: false; error: string; status: number };

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function parseLeadFormBody(rawBody: string): ValidationResult {
  if (rawBody.length > MAX_BODY_BYTES) {
    return { ok: false, error: "Request body too large", status: 413 };
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Invalid JSON body", status: 400 };
  }

  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid request body", status: 400 };
  }

  const record = payload as Record<string, unknown>;
  const name = sanitizeText(record.name, MAX_NAME_LENGTH);
  const rawPhone = sanitizeText(record.phone, MAX_PHONE_LENGTH);
  const address = sanitizeText(record.address, MAX_ADDRESS_LENGTH);
  const serviceType = sanitizeText(record.serviceType, MAX_SERVICE_TYPE_LENGTH);
  const phone = normalizePhoneNumber(rawPhone);

  if (!name) {
    return { ok: false, error: "Name is required", status: 400 };
  }

  if (!rawPhone) {
    return { ok: false, error: "Phone is required", status: 400 };
  }

  if (!phone || !phone.startsWith("+") || phone.replace(/\D/g, "").length < 10) {
    return { ok: false, error: "Phone must be a valid US number", status: 400 };
  }

  return {
    ok: true,
    data: {
      name,
      phone,
      address: address || null,
      serviceType: serviceType || null,
    },
  };
}
