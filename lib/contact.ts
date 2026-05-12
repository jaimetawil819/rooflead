const DEFAULT_SUPPORT_EMAIL = "jaime@roofleadapp.com";

function cleanValue(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function createMailtoHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export const supportEmail =
  cleanValue(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || DEFAULT_SUPPORT_EMAIL;

export const supportMailtoHref = createMailtoHref(
  supportEmail,
  "RoofLead support"
);

const pilotSetupEmail =
  cleanValue(process.env.NEXT_PUBLIC_PILOT_SETUP_EMAIL) || supportEmail;

export const pilotSetupHref =
  cleanValue(process.env.NEXT_PUBLIC_PILOT_SETUP_URL) ||
  createMailtoHref(pilotSetupEmail, "RoofLead pilot setup");
