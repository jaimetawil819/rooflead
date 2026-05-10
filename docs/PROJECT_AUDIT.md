# Project Audit - RoofLead

**Last updated:** 2026-05-10
**Current phase:** Phase 1 - Reliability and backend correctness
**Purpose:** Fast source of truth for future sessions. Read this with `docs/IMPLEMENTATION_PLAN.md` and `docs/IMPLEMENTATION_LOG.md`.

---

## Executive status

RoofLead is no longer just a demo scaffold. The core SaaS flow exists:

Website/test form -> lead record -> AI SMS qualification -> structured lead summary -> dashboard -> Stripe billing.

Phase 0 safety work is complete enough to move forward: secrets are ignored, tracked-file secret scan was clean, Clerk proxy is deny-by-default, Twilio webhooks validate signatures, STOP opt-outs persist, form input is validated, migrations exist, and private dashboard data no longer relies on direct browser Supabase table access.

Phase 1 is partially complete. Billing correctness, idempotency, structured lead extraction, AI guardrails, local inbound SMS simulation, async Twilio webhook processing, prompt injection mitigation, and mid-conversation timeout handling have been implemented. The biggest remaining reliability risk is now production observability.

---

## Product understanding

**Product:** AI-powered SMS lead intake and qualification for roofing companies.

**Target customer:** Small roofing companies and home-service operators that miss inbound leads because they respond slowly or do not have an office/admin person qualifying leads.

**Core value prop:** Respond instantly, ask the right qualifying questions, summarize the lead, score quality/urgency, and help the owner/sales rep act faster.

**Primary flow:**
1. Roofer signs up and configures business/settings.
2. Roofer embeds the RoofLead form or uses a test form.
3. Homeowner submits name, phone, address, and service need.
4. RoofLead sends/records the initial AI greeting.
5. Homeowner replies by SMS.
6. AI asks service, urgency, timeline, and homeowner/renter questions.
7. Completed conversation is summarized and scored.
8. Dashboard shows the lead, conversation, structured qualification fields, and status.

---

## Architecture snapshot

**Stack**
- Next.js 16 App Router + TypeScript
- Supabase Postgres
- Clerk auth
- Twilio SMS
- Anthropic Claude for conversation + summary
- Stripe Checkout, webhooks, and billing portal
- Vercel hosting
- shadcn/ui + Tailwind

**Important server boundaries**
- `proxy.ts` protects everything except intentional public routes.
- `lib/supabase/admin.ts` is the service-role client. It must stay server-only.
- Dashboard client pages call protected `/api/dashboard/*` routes instead of direct Supabase table access.
- Public form/webhook/cron routes are intentionally unauthenticated but have their own protections.

---

## Completed Phase 0

| Area | Status | Evidence |
|---|---|---|
| Repo safety | Complete | `.env*` ignored; `.env.example` tracked |
| Shared admin client | Complete | `lib/supabase/admin.ts` |
| Clerk proxy | Complete | `proxy.ts` deny-by-default public route list |
| Twilio validation | Complete | `twilio.validateRequest()` in webhook |
| STOP opt-out | Complete | `sms_opt_outs`, opt-out checks in form/cron/webhook |
| Form hardening | Complete | `lib/form-validation.ts`, `lib/rate-limit.ts` |
| Migrations | Complete | `supabase/migrations/0001` through `0006` |
| RLS hardening | Complete | `0003_secure_rls.sql` plus dashboard API routes |
| Completion signal | Complete | Anthropic `complete_intake` tool use |
| Secret rotation checklist | Complete | `docs/SECRET_ROTATION_CHECKLIST.md` |

Manual caveat: provider-side secret rotation and production environment checks are still operator tasks.

---

## Phase 1 progress

| Item | Status | Evidence |
|---|---|---|
| Stripe lifecycle events | Complete | `app/api/webhooks/stripe/route.ts` handles subscription create/update/delete and payment failed |
| Stripe idempotency | Complete | `stripe_events` via `0004_stripe_billing_hardening.sql` |
| Stripe billing portal | Complete | `app/api/billing/portal/route.ts`, Settings button |
| Twilio message idempotency | Complete | `messages.twilio_message_sid`, duplicate SID skip |
| Form duplicate guard | Complete | Same business + phone within 5 minutes returns existing lead |
| Structured lead extraction | Complete | `urgency`, `timeline`, `is_homeowner`, `qualification_reason` |
| AI reliability guardrails | Complete | blank reply fallback, Anthropic error fallback, 20-message cap |
| Manual inbound simulator | Complete | `npm run simulate:inbound` |
| Summary parser hardening | Complete | tolerant JSON extraction in `lib/ai.ts` |
| Renter/unqualified status rule | Complete | renter/unqualified completed leads become `junk`, not `qualified` |
| Async Twilio processing | Complete | webhook returns TwiML after insert; AI/SMS work runs via `after()` |
| Prompt injection mitigation | Complete | business config and transcripts treated as untrusted context in `lib/ai.ts` |
| Mid-conversation timeout | Complete | `leads.last_message_at`, cron timeout/follow-up logic |

---

## Remaining Phase 1 work

### Highest priority

1. **Structured logging**
   - Current risk: debugging production failures will be messy.
   - Suggested direction: request IDs, safe error messages, no full PII transcripts in logs.

2. **Durable background jobs**
   - Current risk: Next.js `after()` reduces Twilio timeout risk, but it is not a persistent queue.
   - Suggested direction: keep this for MVP, then add a DB-backed queue or hosted job worker if pilot usage exposes dropped/slow jobs.

### Lower priority

5. **Pro tier checkout**
   - Defer until there is evidence customers want multiple tiers.

6. **Stripe live mode**
   - Defer until domain, production Clerk, A2P, and first real customer are ready.

---

## Known external blockers

- **Twilio A2P 10DLC approval pending.** Real customer SMS delivery remains constrained until approval.
- **Manual production deployment.** Vercel deploys are currently run manually with `npx.cmd vercel --prod`.
- **cron-job.org dependency.** 10-minute follow-up cadence relies on external cron because Vercel Hobby cron is daily.
- **No custom domain yet.** This affects trust, Stripe live readiness, and Twilio/10DLC polish.

---

## Current readiness verdict

**Local/pilot-demo readiness:** Good, with simulator-based testing.
**Real customer readiness:** Close, but not automatic. Wait for A2P approval, run production smoke tests, and complete the remaining Phase 1 reliability work before relying on it for a paying pilot.

Recommended next engineering move: **structured logging** unless the immediate goal is customer demo polish.
