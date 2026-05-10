# Implementation Plan - RoofLead

**Created:** 2026-05-09
**Last updated:** 2026-05-10
**Tracker:** `docs/IMPLEMENTATION_LOG.md`

This is the execution checklist. Work one slice at a time, verify, commit, then move on.

---

## Status summary

Phase 0 is complete. Phase 1 is in progress and has already closed several reliability gaps:

- Stripe lifecycle + billing portal
- Stripe webhook idempotency
- Twilio inbound message idempotency
- Form duplicate guard
- Structured lead extraction
- AI fallback/length guardrails
- Local inbound SMS simulator
- Summary parser hardening
- Renter/unqualified status handling

---

## Phase 0 - Safety and security

**Status:** Complete, with provider-side manual checks still required before real customer usage.

Completed:
- `.env*` ignored and `.env.example` created.
- Shared Supabase admin client added.
- API routes use server-side service-role client where needed.
- Next.js 16 `proxy.ts` is deny-by-default.
- Public routes limited to marketing/auth/legal/forms/webhooks/cron/test form.
- Twilio webhook signature validation added.
- STOP/UNSUBSCRIBE/CANCEL/END/QUIT opt-outs persist.
- Form endpoint validates name/phone, caps input sizes, normalizes phone, rejects >5KB body.
- In-memory form rate-limit scaffold added behind env flags.
- Supabase migrations added.
- RLS hardened by `0003_secure_rls.sql`.
- Dashboard private data moved behind protected API routes.
- AI completion moved to Anthropic tool use.
- Secret rotation checklist created.

Manual checks:
- Ensure `TWILIO_VALIDATE_REQUESTS` is not `false` in Vercel production.
- Keep rotated provider secrets in Vercel and `.env.local`.
- Run production smoke tests after each deploy.

---

## Phase 1 - Reliability and backend correctness

### 1A - Stripe lifecycle and portal - Complete

Files:
- `app/api/webhooks/stripe/route.ts`
- `app/api/billing/portal/route.ts`
- `app/dashboard/settings/page.tsx`
- `supabase/migrations/0004_stripe_billing_hardening.sql`

Implemented:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `stripe_events` idempotency
- Stripe customer billing portal

Verify:
- Checkout unlocks dashboard.
- Manage Billing opens Stripe portal.
- Duplicate webhook event does not reprocess.
- Subscription update/cancel/payment-failed events update `businesses.subscription_status`.

### 1B - Twilio and form idempotency - Complete

Files:
- `app/api/webhooks/twilio/route.ts`
- `app/api/forms/[widgetKey]/route.ts`
- `supabase/migrations/0005_twilio_message_idempotency.sql`

Implemented:
- `messages.twilio_message_sid`
- Unique partial index for non-null Twilio SIDs
- Duplicate Twilio SID skip before AI/SMS work
- Same business + same phone within 5 minutes returns existing lead

Verify:
- Reuse the same simulator `--sid` twice; only one user message/AI reply appears.
- Submit the same form twice quickly; only one lead is created.

### 1C - Structured lead extraction - Complete

Files:
- `lib/ai.ts`
- `app/api/webhooks/twilio/route.ts`
- `app/dashboard/leads/[id]/page.tsx`
- `supabase/migrations/0006_structured_lead_extraction.sql`

Implemented fields:
- `urgency`
- `timeline`
- `is_homeowner`
- `qualification_reason`

Implemented behavior:
- Completed conversations persist structured fields.
- Lead detail displays structured fields and score reason.
- Renter/unqualified completed leads become `junk`, not `qualified`.
- Parser tolerates JSON wrapped in markdown/code-fence/prefix text.

Verify:
- Use `npm run simulate:inbound` to complete a test conversation.
- Confirm summary is readable and fields are populated.
- Confirm renter lead becomes `junk`.

### 1D - AI reliability guardrails - Complete

Files:
- `lib/ai.ts`

Implemented:
- Blank AI reply fallback
- Anthropic conversation error fallback
- Anthropic summary error fallback
- 20-message conversation cap with handoff reply
- Safer logs without full transcript output

Verify:
- Typecheck/lint/build pass.
- After A2P approval, run live SMS test to confirm normal completion still works.

### 1E - Manual inbound SMS simulator - Complete

Files:
- `scripts/simulate-inbound.mjs`
- `docs/MANUAL_TESTING.md`
- `package.json`

Command:

```powershell
npm run simulate:inbound -- --from +16195551234 --body "I need roof repair ASAP"
```

Purpose:
- Test the real signed Twilio webhook locally before A2P approval.
- Exercise AI replies, DB writes, structured extraction, and duplicate `MessageSid` behavior.

### 1F - Async Twilio webhook processing - Next recommended

Problem:
- Current webhook still waits for Anthropic and outbound SMS before returning.
- Slow provider calls can trigger Twilio retries.

Likely files:
- `app/api/webhooks/twilio/route.ts`
- New protected internal route or job processor
- Possibly a `message_jobs` / `inbound_events` table if using DB-backed queue

Goal:
- Validate Twilio signature and persist inbound event quickly.
- Return TwiML fast.
- Process AI reply in background or via internal async route.

### 1G - Prompt injection mitigation - Pending

Problem:
- Business name, service list, and intake question are interpolated into the system prompt.

Goal:
- Treat configurable business strings as untrusted context, not instructions.
- Add delimiters and prompt rules.

### 1H - Mid-conversation timeout - Pending

Problem:
- Leads that stop replying can remain `new`.

Goal:
- Track `last_message_at`.
- Cron marks stale conversations as `unresponsive` or summarizes partial info after a timeout.

### 1I - Structured logging - Pending

Problem:
- Debugging production failures will be difficult.

Goal:
- Add request IDs and safe logs.
- Avoid logging full PII transcripts.
- Optional later: Sentry.

---

## Phase 2 - Product improvements

Do not start until at least one pilot workflow is stable.

- Human handoff / owner takeover
- Manual owner SMS reply from dashboard
- Scheduling/inspection booking
- ROI metrics
- Email fallback
- Twilio number per business
- Lead list pagination
- Search/filter improvements
- CRM/Zapier/webhook export

---

## Phase 3 - Scale and polish

- Custom domain
- Production Clerk instance
- Stripe live mode
- Better onboarding
- Multiple notification phones
- Photo/MMS intake
- Realtime dashboard updates
- Consolidate old off-repo planning docs

---

## Current next action

Recommended next engineering slice: **1F - Async Twilio webhook processing**.

Reason: it is the biggest remaining backend reliability risk. The simulator now gives us a way to test most of the webhook logic without waiting for A2P approval.
