import twilio from "twilio";

function readArg(name, fallback = "") {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function printHelp() {
  console.log(`
Simulate a signed inbound Twilio SMS webhook against your local app.

Usage:
  node --env-file=.env.local scripts/simulate-inbound.mjs --from +16195551234 --body "I need roof repair ASAP"

Options:
  --url   App URL. Defaults to http://localhost:3000
  --from  Homeowner phone number. Must match an active test lead.
  --body  Inbound SMS body to simulate.
  --sid   Optional Twilio MessageSid. Defaults to a generated test SID.

Before running:
  1. Start the app with npm run dev.
  2. Submit a test lead using the same --from phone number.
`);
}

function makeTestSid() {
  const suffix = Math.random().toString(16).slice(2).padEnd(32, "0").slice(0, 32);
  return `SM${suffix}`;
}

const appUrl = readArg("--url", "http://localhost:3000").replace(/\/$/, "");
const from = readArg("--from");
const body = readArg("--body");
const messageSid = readArg("--sid", makeTestSid());
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "AC00000000000000000000000000000000";
const to = process.env.TWILIO_PHONE_NUMBER ?? "+15550000000";

if (process.argv.includes("--help")) {
  printHelp();
  process.exit(0);
}

if (!from || !body) {
  printHelp();
  process.exit(1);
}

if (!authToken) {
  console.error("Missing TWILIO_AUTH_TOKEN. Run with: node --env-file=.env.local ...");
  process.exit(1);
}

const webhookUrl = `${appUrl}/api/webhooks/twilio`;
const params = {
  AccountSid: accountSid,
  ApiVersion: "2010-04-01",
  Body: body,
  From: from,
  MessageSid: messageSid,
  NumMedia: "0",
  SmsMessageSid: messageSid,
  SmsSid: messageSid,
  SmsStatus: "received",
  To: to,
};

const signature = twilio.getExpectedTwilioSignature(authToken, webhookUrl, params);
const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Twilio-Signature": signature,
  },
  body: new URLSearchParams(params),
});

const responseText = await response.text();

console.log(`POST ${webhookUrl}`);
console.log(`Status: ${response.status}`);
console.log(`MessageSid: ${messageSid}`);
console.log(responseText || "(empty response)");

if (!response.ok) {
  process.exit(1);
}
