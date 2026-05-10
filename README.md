# RoofLead

RoofLead is an AI-powered lead intake and qualification SaaS for roofing companies.

Homeowner submits a form -> RoofLead starts an SMS intake flow -> AI qualifies the lead -> dashboard shows the conversation, urgency, score, summary, and next action.

## Current Stack

- Next.js 16 App Router
- TypeScript
- Supabase Postgres
- Clerk authentication
- Twilio SMS
- Anthropic Claude
- Stripe Checkout, webhooks, and billing portal
- Vercel hosting
- Tailwind/shadcn UI

## Local Development

Install dependencies:

```powershell
npm install
```

Create `.env.local` from `.env.example`, then run:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Common Commands

```powershell
npm run dev
npm run lint
npm run build
npx.cmd tsc --noEmit
```

## Manual Inbound SMS Simulation

Use this while Twilio A2P approval is pending.

1. Start the app:

```powershell
npm run dev
```

2. Submit a test lead with a phone number.

3. Simulate a signed inbound Twilio webhook:

```powershell
npm run simulate:inbound -- --from +16195551234 --body "I need roof repair ASAP"
```

Use the same phone number as the test lead.

More detail: `docs/MANUAL_TESTING.md`.

## Important Docs

- `docs/PROJECT_AUDIT.md` - current architecture/product audit
- `docs/IMPLEMENTATION_PLAN.md` - active execution checklist
- `docs/IMPLEMENTATION_LOG.md` - running change log
- `docs/SECRET_ROTATION_CHECKLIST.md` - pre-pilot secret rotation checklist
- `supabase/migrations/README.md` - database migration order

## Security Notes

- Do not commit `.env.local` or any real secrets.
- Service-role Supabase access belongs only in server code.
- Twilio webhook validation is enabled by default. Do not set `TWILIO_VALIDATE_REQUESTS=false` in production.
- Dashboard/private data access goes through protected API routes and server-side ownership checks.

## Current Phase

Phase 1: reliability and backend correctness.

Completed in Phase 1:

- Stripe lifecycle handling and billing portal
- Stripe webhook idempotency
- Twilio message idempotency
- Form duplicate guard
- Structured lead extraction
- AI reliability guardrails
- Manual inbound SMS simulator
- Async Twilio webhook processing
- Prompt injection mitigation
- Mid-conversation timeout

Recommended next slice:

- Structured logging
