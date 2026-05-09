# Project Audit — RoofLead

**Audit date:** 2026-05-09
**Phase at audit time:** Phase 3 — First Pilot Customer (deployed to Vercel, Stripe in test mode, 10DLC pending)
**Auditor:** Claude (full-codebase review, all-files context)
**Purpose:** Single source of truth for what's working, what's broken, and what's missing. Future Claude sessions should read this first.

---

## TL;DR for next Claude session

The MVP is functionally complete and live at `https://rooflead-mu.vercel.app`. The lead-flow happy path works end-to-end. **Do not start adding features.** There are critical security and data-integrity gaps that must be closed before a real paying customer is onboarded. The fixes are tracked in `docs/IMPLEMENTATION_PLAN.md`. Progress is logged in `docs/IMPLEMENTATION_LOG.md`. Touch those files first, then resume.

---

## What this product is

AI-powered SMS lead qualification for roofing companies. Homeowner submits a web form → Twilio SMS within 60 seconds from a Claude Haiku agent → 4-question qualification (service, urgency, timeline, ownership) → Claude Sonnet generates summary + score → owner SMS notification with dashboard link. Single shared Twilio number across all customers (architectural divergence from `TECHNICAL_ARCHITECTURE.md`).

**Stack:** Next.js 16.2.6 (App Router) · Supabase Postgres · Clerk auth · Twilio SMS · Anthropic Claude (Haiku for chat, Sonnet for summary) · Stripe subscriptions · Vercel hosting + cron · shadcn/ui · DM Sans.

**Live integrations:** GitHub auto-deploy is **NOT working** — deploys are manual via `npx vercel --prod`. Vercel cron is daily (Hobby plan limit); 10-minute follow-up cadence runs through cron-job.org as an external dependency.

---

## What's working today

- Marketing landing page (Hero, Problem, HowItWorks, Pricing, FAQ, FinalCTA, Footer)
- Privacy + Terms pages (added for 10DLC)
- Clerk auth (sign-in / sign-up)
- Stripe checkout (test mode), webhook receives `checkout.session.completed` and `customer.subscription.deleted`
- Subscribe → trial activation → dashboard unlock
- Onboarding wizard (3 steps: business info → embed code → test form)
- Form widget (`public/embed.js`) — derives base URL from script.src, fetches dynamic config
- Form submission API → AI-generated greeting SMS
- Twilio webhook → AI reply via Haiku → message persisted → completion-trigger summary via Sonnet → owner SMS
- Lead dashboard: Overview, Leads list (filter by status/score), Lead detail with conversation thread + tap-to-call
- Settings: business info + dynamic services list + intake question + embed code copy
- Daily follow-up cron (Vercel) + 10-min frequency via cron-job.org

---

## P0 — Critical (must fix before any paying customer)

| ID | Issue | Files |
|----|-------|-------|
| P0-1 | RLS status unverified; anon key exposed in client. Without strict RLS, any authenticated user could read other businesses' leads | Supabase dashboard; client-side queries in `app/dashboard/leads/[id]/page.tsx`, `app/dashboard/settings/page.tsx`, `app/dashboard/onboarding/page.tsx` |
| P0-2 | No Twilio webhook signature validation. Anyone with the URL can spoof inbound SMS | `app/api/webhooks/twilio/route.ts` |
| P0-3 | No rate limiting on form endpoint. A bot can drain Twilio + Anthropic budget | `app/api/forms/[widgetKey]/route.ts` |
| P0-4 | STOP keyword doesn't persist opt-out. Follow-up cron will re-message opted-out users (TCPA risk) | `app/api/webhooks/twilio/route.ts:23`, `app/api/cron/follow-up/route.ts` |
| P0-5 | Production secrets in conversation transcripts → must rotate (Twilio token, Stripe secret, Anthropic key, Supabase service role + anon, Clerk secret) | All `.env.local`-derived Vercel env vars |
| P0-6 | No `middleware.ts`. Future routes that forget per-route auth check are silently public | repo root |
| P0-7 | No `supabase/migrations/` directory. Schema is undocumented; cannot reproduce or roll back | new directory |
| P0-8 | Conversation completion is detected by string match `reply.includes("I have everything I need")`. If Haiku reworks the phrase the conversation never completes, summary never runs, owner never notified | `lib/ai.ts`, `app/api/webhooks/twilio/route.ts:103` |

---

## P1 — Important (within 2 weeks of first customer)

| ID | Issue | Files |
|----|-------|-------|
| P1-1 | Lead summary doesn't extract structured fields. Cannot filter by urgency/service/timeline | `lib/ai.ts`, `app/api/webhooks/twilio/route.ts`, leads schema |
| P1-2 | Phone number normalization missing. Lead lookups fail when input format differs from Twilio E.164 | `app/api/forms/[widgetKey]/route.ts`, `app/api/webhooks/twilio/route.ts` |
| P1-3 | Twilio webhook does AI + summary + owner SMS synchronously. Will hit 10s timeout under load → Twilio retries → duplicate replies | `app/api/webhooks/twilio/route.ts` |
| P1-4 | Stripe lifecycle events (`customer.subscription.updated`, `invoice.payment_failed`) unhandled. Stale subscription state | `app/api/webhooks/stripe/route.ts` |
| P1-5 | No Stripe customer portal route. Every billing change is manual support work | new `app/api/billing/portal/route.ts` |
| P1-6 | Pro tier advertised but unbuyable (no price ID wired) | `app/subscribe/page.tsx`, `app/api/billing/checkout/route.ts` |
| P1-7 | No idempotency on form submission or message inserts. Twilio retries → duplicate user messages | `app/api/forms/[widgetKey]/route.ts`, messages schema |
| P1-8 | Prompt injection via `intake_question` and `business name`. Jailbreak risk | `lib/ai.ts` |
| P1-9 | No conversation length cap. Troll user could rack up unbounded AI cost | `app/api/webhooks/twilio/route.ts` |
| P1-10 | Supabase admin client duplicated across 5 files (already partially addressed in P0A) | All `app/api/**/route.ts` files using service role |
| P1-11 | Mid-conversation timeout missing. Half-replied leads never get summarized | cron + leads schema |
| P1-12 | No structured logging / error visibility | All routes |

---

## P2 — Product improvements (after first customer is stable)

- Twilio number per business (architectural fix; required before 5th customer)
- Human handoff button on conversation detail
- "Leads saved / responded in <60s" dashboard metric (the ROI proof point)
- Email fallback channel via Resend if SMS fails
- Extract duplicated `scoreColors` / `statusColors` to `lib/lead-colors.ts`
- Generate Supabase TypeScript types; replace `any` in `app/dashboard/leads/[id]/page.tsx`
- Onboarding upsert pattern → server action with proper conflict resolution
- Lead list pagination (currently fetches all leads)

---

## P3 — Nice to have

- Multiple notification phones per business
- Configurable AI persona name
- Photo upload via MMS during qualification
- Conversation history search
- Zapier/CRM webhook for qualified leads
- Supabase realtime dashboard updates
- Dark mode (`next-themes` already installed but unused)

---

## Doc-vs-code drift

| Doc claim | Reality |
|-----------|---------|
| `TECHNICAL_ARCHITECTURE.md` — Twilio number per business | One shared number (`lib/twilio.ts:11`) |
| `TECHNICAL_ARCHITECTURE.md` — `conversations` table | Not in schema; messages link directly to leads |
| `TECHNICAL_ARCHITECTURE.md` — `messages.twilio_sid` for dedup | Not in schema |
| `TECHNICAL_ARCHITECTURE.md` env list mentions `RESEND_API_KEY`, `STRIPE_PRICE_ID_PRO`, `TWILIO_WEBHOOK_URL` | Not used in code |
| `MVP_SCOPE.md` — Photo upload via MMS | Not built (correctly deferred) |
| `MVP_SCOPE.md` — Configurable AI persona name | Not built |
| `MVP_SCOPE.md` — Multiple notification contacts (`notification_phones text[]`) | Single `notification_phone` column |
| `MVP_SCOPE.md` — Business hours config | Not built |
| `MVP_SCOPE.md` — Configurable response delay | Not built |
| `CLAUDE_WORKFLOW.md` — Validate Twilio webhook signatures | Not implemented (P0-2) |
| `CLAUDE_WORKFLOW.md` — Rate-limit form-facing APIs | Not implemented (P0-3) |
| `CLAUDE_WORKFLOW.md` — Use Supabase RLS on every table | Status unverified (P0-1) |
| `CLAUDE_WORKFLOW.md` — Never log PII | `console.error` includes phone numbers in `app/api/webhooks/twilio/route.ts:99` |
| `CLAUDE_WORKFLOW.md` — Always create migrations | No `supabase/migrations/` directory (P0-7) |
| `CLAUDE_WORKFLOW.md` — File size limit 300 lines | All within limits ✅ |

The planning docs (`PRODUCT_BRIEF.md`, `MVP_SCOPE.md`, `TECHNICAL_ARCHITECTURE.md`, etc.) currently live **outside** the repo at `C:\Users\jaime\Claude Code\docs\`. The README references them at `docs/...` paths that don't resolve from the repo root. Consolidating those into the rooflead repo is a P3 cleanup.

---

## Schema (inferred — no migration file exists)

**businesses** — `id, owner_id, name, notification_phone, stripe_customer_id, subscription_status, onboarding_complete`
**leads** — `id, business_id, name, phone, email, address, service_type, status, lead_score, summary, follow_up_sent, created_at`
**messages** — `id, lead_id, role, body, sent_at`
**form_widgets** — `id, business_id, widget_key, services, intake_question`

Missing per spec: `urgency`, `timeline`, `is_homeowner`, `notified_at`, `zip` on leads; `direction`, `twilio_sid` on messages; `conversations` table not built (acceptable for MVP).

---

## Known external dependencies (worth documenting)

- **cron-job.org** — calls `/api/cron/follow-up` every 10 min with `Authorization: Bearer $CRON_SECRET` (workaround for Vercel Hobby daily-cron limit). If this service goes down, follow-ups stop firing.
- **Vercel auto-deploy from GitHub** — currently not connected/working. Deploys happen via `npx vercel --prod` manually.
- **Stripe webhook** — pointed at `https://rooflead-mu.vercel.app/api/webhooks/stripe` (test mode).
- **Twilio webhook** — pointed at `https://rooflead-mu.vercel.app/api/webhooks/twilio`. 10DLC campaign submitted, awaiting carrier approval.
