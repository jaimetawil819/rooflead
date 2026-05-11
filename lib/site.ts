const DEFAULT_APP_URL = "https://rooflead-mu.vercel.app";

function cleanUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : "";
}

export const siteName = "RoofLead";

export const siteDescription =
  "AI SMS lead intake for roofing companies that need faster first response.";

export const appBaseUrl =
  cleanUrl(process.env.NEXT_PUBLIC_APP_URL) || DEFAULT_APP_URL;

export const appHost = appBaseUrl.replace(/^https?:\/\//, "");
