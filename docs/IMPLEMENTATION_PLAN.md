# Implementation Plan — RoofLead

**Plan created:** 2026-05-09
**Source audit:** `docs/PROJECT_AUDIT.md`
**Tracker:** `docs/IMPLEMENTATION_LOG.md`

This document is the executable checklist. Work top-down. Do not skip Phase 0 to reach Phase 2 features.

**Risk legend:**
- 🟢 **Low** — additive change, no migration, easy rollback
- 🟡 **Medium** — touches a hot path, schema change, or external dashboard
- 🔴 **High** — affects production data, auth surface, or money flow

**Change-type legend:**
- `code` — TypeScript / TSX files
- `sql` — Supabase migration
- `dashboard` — Manual configuration in Supabase / Stripe / Twilio / Vercel UI
- `manual` — Action user must perform (rotate secret, run command, etc.)

---

## Phase 0 — Safety & Security (must complete before pilot customer)

### 0A — Repo safety & structure 🟢

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| Verify `.gitignore` ignores `.env*` | code | `.gitignore` | `git check-ignore .env.local` returns the path |
| Add `.env.example` from variable names used in code | code | new `.env.example` | `npm run build` still succeeds; file shows every name without secret values |
| Create `lib/supabase/admin.ts` shared service-role client | code | new `lib/supabase/admin.ts` | Import from one route, build passes |
| Replace duplicated admin client instantiation in API routes | code | `app/api/forms/[widgetKey]/route.ts`, `app/api/forms/[widgetKey]/config/route.ts`, `app/api/webhooks/twilio/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/billing/checkout/route.ts`, `app/api/cron/follow-up/route.ts` | Build passes; webhook + form endpoints behave identically |

### 0B — Clerk middleware 🟡 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Add `clerkMiddleware` with deny-by-default public-route list | code | `proxy.ts` (Next.js 16 uses proxy.ts, not middleware.ts) | Build ✓; `ƒ Proxy (Middleware)` in route table |
| ✅ Define public routes (`/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/api/forms/*`, `/api/webhooks/*`, `/api/cron/*`, `/test-form/*`) | code | `proxy.ts` matcher | All routes compile |
| Confirm `/dashboard` redirects when logged out | manual | browser test | Redirect to `/sign-in` |
| Confirm Stripe / Twilio / form webhooks still receive POSTs | manual | curl or deploy test | 200 / signature-validated rejection (not redirect) |

### 0C — Twilio webhook signature validation 🔴 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Add `twilio.validateRequest()` check in webhook handler | code | `app/api/webhooks/twilio/route.ts` | Build passes; real SMS test pending after deploy |
| ✅ Reconstruct full URL including query string per Twilio spec | code | same | URL built from forwarded headers + path/search |
| ✅ Reject with 403 on signature mismatch | code | same | Spoofed POST returns 403 locally |
| ✅ Optional dev bypass via `TWILIO_VALIDATE_REQUESTS=false` env var | code | `.env.example`, same route | Documented; leave unset in production |

### 0D — STOP opt-out persistence 🔴 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Migration: create `sms_opt_outs` table | sql | new `supabase/migrations/0002_sms_opt_outs.sql` | Applied in Supabase SQL Editor |
| ✅ Update Twilio webhook to insert opt-out + update lead on STOP/UNSUBSCRIBE/CANCEL/END/QUIT | code | `app/api/webhooks/twilio/route.ts` | Typecheck/build pass; real SMS STOP test pending after deploy |
| ✅ Update follow-up cron to skip opted-out phones | code | `app/api/cron/follow-up/route.ts` | Typecheck/build pass |
| ✅ Update form-greeting send to skip opted-out phones | code | `app/api/forms/[widgetKey]/route.ts` | Typecheck/build pass |

### 0E — Schema / migrations 🟡 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Create `supabase/migrations/` directory | code | existing dir | Folder exists |
| ✅ Capture current schema as `0001_initial_baseline.sql` | manual + sql | User ran Supabase CLI dump from remote project | File committed; schema reproducible |
| ✅ Add `0002_sms_opt_outs.sql` (Phase 0D) | sql | `supabase/migrations/0002_sms_opt_outs.sql` | Migration applied in Supabase SQL Editor |
| ✅ Add a brief `supabase/migrations/README.md` describing apply order | code | new file | Explains apply order, baseline capture, and SQL Editor workflow |

### 0F — Form endpoint hardening 🟡 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Validate required fields (name, phone) | code | `app/api/forms/[widgetKey]/route.ts`, `lib/form-validation.ts` | Empty payload returns 400 |
| ✅ Length caps (name ≤ 100, phone ≤ 20, address ≤ 250, serviceType ≤ 50) | code | `lib/form-validation.ts` | Oversized field values are trimmed/capped; body >5KB rejected |
| ✅ Strip control chars from text inputs | code | `lib/form-validation.ts` | Control chars normalized to spaces before insert |
| ✅ Normalize phone to E.164 | code | `lib/phone.ts`, form route | `(619) 555-1234` stores/sends as `+16195551234` |
| ✅ Scaffold rate limiter behind `RATE_LIMIT_ENABLED` env flag | code | `lib/rate-limit.ts`, form route, `.env.example` | When enabled, repeat request returns 429; when disabled, no-op |
| ✅ Document limiter setup/limits in `IMPLEMENTATION_LOG.md` | code | log entry | Notes that current limiter is in-memory MVP guard, not production abuse prevention |

### 0G — Conversation completion via tool use 🟡 ✅

| Step | Type | Files / Action | Verify |
|------|------|---------------|--------|
| ✅ Replace `reply.includes(...)` with Anthropic tool-use (define `complete_intake` tool) | code | `lib/ai.ts`, `app/api/webhooks/twilio/route.ts` | Typecheck/build pass; real SMS completion test pending |
| ✅ Fall back gracefully when no tool call returned | code | same | Text response is sent normally with `isComplete: false` |

### 0H — Manual: secret rotation 🔴 checklist ready

Checklist (user runs this off-Claude):
- Use `docs/SECRET_ROTATION_CHECKLIST.md`
- Rotate Supabase service role key + anon key
- Rotate Twilio Auth Token
- Rotate Anthropic API key
- Rotate Stripe secret key + webhook signing secret
- Rotate Clerk secret key
- Rotate `CRON_SECRET`
- Update all values in `.env.local`, Vercel, and cron-job.org
- Redeploy: `npx.cmd vercel --prod`
- Verify auth, checkout, form submit, SMS, inbound webhook, STOP opt-out, and cron

---

## Phase 1 — Reliability & Backend Correctness (within 2 weeks of first customer)

### 1A — Structured lead extraction 🟡
- `lib/ai.ts` `generateLeadSummary` returns `{ summary, score, urgency, timeline, service_type, is_homeowner }`
- Migration adds `urgency`, `timeline`, `is_homeowner` columns to `leads`
- Webhook persists structured fields
- Verify: completed conversation populates all columns

### 1B — Phone normalization (deferred to here if not done in 0F) 🟡

### 1C — Asynchronous webhook processing 🔴
- Twilio webhook returns TwiML immediately; defers AI call to background
- Options: Inngest, Upstash QStash, or self-call `/api/process-message` with fire-and-forget fetch
- Verify: webhook responds in <500ms even when Anthropic is slow

### 1D — Stripe lifecycle events 🟡
- Add `customer.subscription.updated` handler — sync `subscription_status`
- Add `invoice.payment_failed` handler — flag `past_due`
- Add `event.id` idempotency check via `stripe_events` log table
- Verify: trigger via Stripe CLI; DB reflects state changes

### 1E — Stripe customer portal 🟢
- New route `app/api/billing/portal/route.ts` calling `stripe.billingPortal.sessions.create()`
- Add "Manage Billing" link in dashboard sidebar
- Verify: customer can update card, cancel subscription, view invoices

### 1F — Pro tier checkout 🟡
- Add `STRIPE_PRICE_ID_PRO` env var
- `app/subscribe/page.tsx` shows tier selector
- `app/api/billing/checkout/route.ts` accepts `priceId` param

### 1G — Idempotency 🟡
- Add `twilio_sid` unique column to messages
- Form endpoint checks for existing lead with same `phone + business_id` in last 5 minutes
- Verify: replaying webhook does not duplicate messages

### 1H — Prompt injection mitigation 🟢
- Move user-provided strings (business name, intake question) out of system prompt
- Pass via assistant context message instead, with delimiter
- Verify: a malicious intake question containing "ignore prior instructions" does not jailbreak

### 1I — Conversation length cap 🟢
- If `messageHistory.length > 20`, skip AI generation; force completion + summary
- Verify: 21-message conversation auto-completes

### 1J — Mid-conversation timeout 🟢
- Add `last_message_at` column to leads
- Cron job force-completes leads idle for 24h
- Verify: stale lead auto-summarizes after 24h

### 1K — Structured logging 🟢
- Add request ID per webhook invocation
- Strip PII from error logs
- Optional: integrate Sentry or Vercel log drain

### 1L — `intakeQuestion` parameter is accepted but never used 🟢 partial
- Discovered during Phase 0A lint pass.
- ✅ `lib/ai.ts` now uses `intakeQuestion` in the conversation prompt.
- Remaining issue in `public/embed.js:15` — variable extracted from config but never rendered.
- Files: `lib/ai.ts`, `public/embed.js`
- Verify: change intake question in Settings → submit a test lead → first AI reply uses the configured question

---

## Phase 2 — Product Improvements

### 2A — Twilio number per business 🔴
- Twilio API: provision local number on subscription start
- Store `twilio_phone` per business
- Webhook routes by `params.To` instead of phone-only lookup
- Update billing to charge $1/mo extra per number

### 2B — Human handoff 🟡
- Dashboard button "Take Over" pauses AI for that lead
- Manual reply box on lead detail sends SMS via Twilio
- Status shows "Owner replying"

### 2C — ROI metric 🟢
- Dashboard counter: "X leads responded to in <60s this month"
- Reinforces subscription value

### 2D — Email fallback 🟡
- Resend integration; if SMS fails twice, send email if available

### 2E — Code cleanup 🟢
- Extract `lib/lead-colors.ts`
- Generate Supabase types: `npx supabase gen types typescript --project-id ...`
- Replace `any` in lead detail page

### 2F — Onboarding upsert refactor 🟢
- Server action with proper conflict resolution
- Remove the upsert-then-fetch pattern

### 2G — Lead list pagination 🟢
- 50 leads per page; URL param `?page=`

---

## Phase 3 — Scale & Polish

- Multiple notification phones per business
- Configurable AI persona name
- Photo upload via MMS
- Conversation search
- Zapier / CRM webhook
- Supabase realtime dashboard updates
- Dark mode
- Consolidate planning docs (`PRODUCT_BRIEF.md` etc.) into rooflead repo `docs/`
- Custom domain + DNS
- Switch Stripe to live mode
- Production Clerk instance (currently using dev keys `pk_test_`)

---

## How to use this plan

1. Open `docs/IMPLEMENTATION_LOG.md` and add an entry as you start each task.
2. Complete one task at a time. Run typecheck/build after each.
3. Mark the task ✅ in this file when verified.
4. If a task uncovers a new issue, add it to the appropriate phase here.
5. Never skip Phase 0 to reach Phase 1+.
