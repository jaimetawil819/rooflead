# Implementation Log — RoofLead

**Started:** 2026-05-09

This is a running log of every change made under the controlled-implementation process. New entries go at the **top**. Each entry follows the template below.

---

## Entry template

```
## YYYY-MM-DD — Phase X.Y — Short title

**Task:** What from IMPLEMENTATION_PLAN.md
**Status:** completed | partial | rolled back

**Files changed:**
- path/to/file.ts (added | modified | deleted)
- ...

**Reason:**
Why this change was made.

**Verification performed:**
- typecheck: ok | failed
- build: ok | failed
- manual test: <what you ran and the result>

**Follow-up needed:**
- bullet point or "none"

**Notes / surprises:**
- anything noteworthy
```

---

## 2026-05-09 — Phase 0G — Structured AI completion signal

**Task:** Phase 0G from `IMPLEMENTATION_PLAN.md`
**Status:** completed

**Files changed:**
- `lib/ai.ts` (modified — returns `{ reply, isComplete }`, defines `complete_intake` tool, uses `intakeQuestion` in prompt)
- `app/api/webhooks/twilio/route.ts` (modified — uses structured `isComplete` instead of phrase matching)
- `docs/IMPLEMENTATION_PLAN.md` (modified — marks 0G complete and 1L partially resolved)
- `docs/IMPLEMENTATION_LOG.md` (modified — this entry)

**Reason:**
The conversation completion flow depended on the assistant reply containing the exact phrase `I have everything I need`. That is brittle: a small model wording change could prevent lead summaries and owner notifications from firing. Replaced that with Anthropic tool use so the model marks intake completion structurally by calling `complete_intake` only after all required qualification fields are collected.

**Verification performed:**
- **typecheck (`npx.cmd tsc --noEmit`):** clean — no output. ✅
- **build (`npm.cmd run build`):** ✓ Compiled successfully in 6.6s. All 19 routes detected. ✅
- **lint (`npm.cmd run lint`):** failed with 16 errors + 2 warnings — known lint debt; `lib/ai.ts` `intakeQuestion` warning is gone.

**Follow-up needed:**
- After deploy, run a full SMS conversation until completion and confirm lead summary + owner notification still fire.
- `public/embed.js` still extracts `intakeQuestion` but does not render it. That is left as a small UI/embed cleanup.

**Notes / surprises:**
- The Anthropic SDK response type needed an explicit `ToolUseBlock` type guard before accessing `toolUse.input`; TypeScript caught this cleanly.

---
## 2026-05-09 — Phase 0F — Public form endpoint hardening

**Task:** Phase 0F from `IMPLEMENTATION_PLAN.md`
**Status:** completed

**Files changed:**
- `app/api/forms/[widgetKey]/route.ts` (modified — validates/sanitizes request body, normalizes phone, applies optional rate limit)
- `lib/form-validation.ts` (added — JSON parsing, required fields, length caps, control-char stripping)
- `lib/rate-limit.ts` (added — env-gated in-memory MVP rate limiter)
- `lib/phone.ts` (modified — invalid phone input now returns `null` instead of preserving garbage)
- `.env.example` (modified — documents `RATE_LIMIT_ENABLED`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`)
- `docs/IMPLEMENTATION_PLAN.md` (modified — marks 0F complete)
- `docs/IMPLEMENTATION_LOG.md` (modified — this entry)

**Reason:**
The public lead form endpoint accepted arbitrary JSON and inserted raw values directly into Supabase. That made it too easy to submit empty leads, oversized strings, control characters, or unusable phone numbers. Hardened the endpoint before more demo/customer traffic.

**Verification performed:**
- **typecheck (`npx.cmd tsc --noEmit`):** clean — no output. ✅
- **build (`npm.cmd run build`):** ✓ Compiled successfully in 4.1s. All 19 routes detected. ✅
- **lint (`npm.cmd run lint`):** failed with 16 errors + 3 warnings — known lint debt, and one prior form-route `any` error was removed.
- **manual smoke test:** with rate limiting enabled locally (`RATE_LIMIT_ENABLED=true`, `RATE_LIMIT_MAX=1`), first invalid request returned `400`, second immediate request returned `429`. ✅

**Follow-up needed:**
- Current rate limiter is an in-memory MVP guard. It helps local/dev and some single-instance runtime abuse, but it is not reliable enough as the final production limiter on serverless infrastructure. Before paid traffic, replace or back it with Upstash/Vercel Firewall/another shared limiter.
- Valid form submission should be tested after next deploy using the real test form and a real phone number.

**Notes / surprises:**
- This phase intentionally did not add a new paid dependency. Phone normalization remains US-first and lightweight; deeper international parsing can wait until the business needs it.

---
## 2026-05-09 — Phase 0D — Manual Supabase migration applied

**Task:** Manual apply for `supabase/migrations/0002_sms_opt_outs.sql`
**Status:** completed

**Files changed:**
- `docs/IMPLEMENTATION_PLAN.md` (modified — removes manual-apply pending note)
- `docs/IMPLEMENTATION_LOG.md` (modified — this entry)

**Reason:**
The `sms_opt_outs` table and `leads.sms_opted_out_at` column were applied in Supabase SQL Editor, so the database is now ready for the Phase 0D app code.

**Verification performed:**
- User confirmed Supabase SQL Editor migration was completed.

**Follow-up needed:**
- After deploy, test real inbound `STOP` SMS and verify an opt-out row is created.

**Notes / surprises:**
- None.

---
## 2026-05-09 — Phase 0E — Baseline schema captured

**Task:** Complete remaining Phase 0E baseline capture
**Status:** completed

**Files changed:**
- `supabase/migrations/0001_initial_baseline.sql` (added — schema-only dump from live Supabase project)
- `supabase/migrations/0001_INITIAL_BASELINE_PENDING.md` (deleted — no longer needed)
- `supabase/migrations/README.md` (modified — current state now reflects committed baseline)
- `.gitignore` (modified — ignores Supabase CLI `.temp` metadata)
- `docs/IMPLEMENTATION_PLAN.md` (modified — marks 0E complete)
- `docs/IMPLEMENTATION_LOG.md` (modified — this entry)

**Reason:**
The live Supabase schema is now captured in the repository as the migration baseline. This makes future database changes reviewable and gives future sessions a real schema reference instead of guessing from application code.

**Verification performed:**
- `supabase/migrations/0001_initial_baseline.sql` exists and is schema-only sized. ✅
- `git check-ignore -v supabase/.temp/linked-project.json` confirms Supabase CLI temp files are ignored. ✅
- Searched baseline file for obvious secret markers (`PASSWORD`, `SUPABASE_SERVICE_ROLE`, `SECRET`, `KEY=`); no matches. ✅

**Follow-up needed:**
- Still apply `supabase/migrations/0002_sms_opt_outs.sql` in Supabase SQL Editor before deploying/testing Phase 0D behavior.

**Notes / surprises:**
- Supabase CLI created `supabase/.temp/`; that folder contains local CLI metadata and should stay untracked.

---
## 2026-05-09 — Phase 0E — Migration folder discipline

**Task:** Phase 0E from `IMPLEMENTATION_PLAN.md`
**Status:** partial — repo structure done; live schema baseline requires manual Supabase dump

**Files changed:**
- `supabase/migrations/README.md` (added — migration apply order and baseline capture instructions)
- `supabase/migrations/0001_INITIAL_BASELINE_PENDING.md` (added — placeholder explaining why the baseline is not guessed)
- `docs/IMPLEMENTATION_PLAN.md` (modified — marks 0E repo work complete and baseline dump pending)
- `docs/IMPLEMENTATION_LOG.md` (modified — this entry)

**Reason:**
The project now has forward migrations, but the current live Supabase schema is still not captured in the repo. Creating a fake `0001_initial_baseline.sql` from code would be dangerous because it could miss columns, policies, defaults, indexes, or RLS behavior. Added migration discipline docs and exact commands for generating the real baseline from Supabase.

**Verification performed:**
- Migration folder exists. ✅
- `0002_sms_opt_outs.sql` exists. ✅
- README includes numeric apply order, Supabase SQL Editor workflow, and `pg_dump` / Supabase CLI baseline options. ✅
- No app code changed in this phase.
- **typecheck (`npx.cmd tsc --noEmit`):** clean — no output. ✅
- **build (`npm.cmd run build`):** ✓ Compiled successfully in 4.3s. All 19 routes detected. ✅
- **lint (`npm.cmd run lint`):** failed with 17 errors + 3 warnings — same known lint debt.

**Follow-up needed:**
- User must generate and commit `supabase/migrations/0001_initial_baseline.sql` from the live Supabase database.
- After baseline is committed, delete `supabase/migrations/0001_INITIAL_BASELINE_PENDING.md`.
- User must still apply `0002_sms_opt_outs.sql` in Supabase before deploying/testing Phase 0D behavior.

**Notes / surprises:**
- This phase cannot honestly be marked fully complete without live database access or a schema dump from Supabase.

---
## 2026-05-09 — Phase 0D — Durable SMS opt-out persistence

**Task:** Phase 0D from `IMPLEMENTATION_PLAN.md`
**Status:** completed in code; Supabase migration still needs manual apply

**Files changed:**
- `supabase/migrations/0002_sms_opt_outs.sql` (added — creates `sms_opt_outs` table and `leads.sms_opted_out_at`)
- `lib/phone.ts` (added — lightweight phone normalization and lookup candidates)
- `lib/sms-opt-outs.ts` (added — opt-out keyword, lookup, and record helpers)
- `app/api/webhooks/twilio/route.ts` (modified — persists STOP/UNSUBSCRIBE/CANCEL/END/QUIT and blocks opted-out replies)
- `app/api/forms/[widgetKey]/route.ts` (modified — skips initial greeting if phone has opted out)
- `app/api/cron/follow-up/route.ts` (modified — skips follow-up SMS for opted-out phones)

**Reason:**
SMS opt-out handling was only an immediate TwiML response to the exact word `STOP`; it did not persist consent state. That was not good enough for compliance or real users. Added durable global opt-outs keyed by normalized phone number so future automated SMS sends are suppressed.

**Verification performed:**
- **typecheck (`npx.cmd tsc --noEmit`):** clean — no output. ✅
- **build (`npm.cmd run build`):** ✓ Compiled successfully in 4.5s. All 19 routes detected. ✅
- **lint (`npm.cmd run lint`):** failed with 17 errors + 3 warnings — same known lint debt; no new files reported.

**Follow-up needed:**
- Manual: apply `supabase/migrations/0002_sms_opt_outs.sql` in Supabase SQL Editor before deploying/testing this behavior against production.
- After migration + deploy: send `STOP` from a real phone, confirm row appears in `sms_opt_outs`, matching active lead gets `sms_opted_out_at`, and follow-up cron skips that phone.

**Notes / surprises:**
- Opt-out is intentionally global by phone number, not per lead. That is stricter and safer for TCPA-style compliance.
- Phone normalization is deliberately lightweight for now: US 10-digit numbers normalize to `+1...`, existing E.164-style numbers are preserved. Full validation remains Phase 0F.

---
## 2026-05-09 — Phase 0C — Twilio webhook signature validation

**Task:** Phase 0C from `IMPLEMENTATION_PLAN.md`
**Status:** completed

**Files changed:**
- `app/api/webhooks/twilio/route.ts` (modified — validates Twilio webhook signatures before trusting request params)
- `.env.example` (modified — documents optional local-only `TWILIO_VALIDATE_REQUESTS=false` bypass)
- `.gitignore` (modified — explicitly allows `.env.example` to be committed while real `.env*` files stay ignored)

**Reason:**
The Twilio webhook endpoint was public, which is correct for Twilio delivery, but it trusted any POST body that looked like a Twilio request. That meant a spoofed request could inject lead messages, trigger AI calls, or cause outbound SMS. Added official Twilio request validation using `twilio.validateRequest()` before any lead lookup, message insert, AI call, or SMS send.

Validation is enabled by default. Local manual testing can set `TWILIO_VALIDATE_REQUESTS=false`, but production should leave it unset.

**Verification performed:**
- **typecheck (`npx tsc --noEmit`):** clean — no output. ✅
- **build (`npm run build`):** ✓ Compiled successfully in 6.0s. All 19 routes detected. ✅
- **lint (`npm run lint`):** failed with 17 errors + 3 warnings — existing lint debt, no new Twilio-route lint errors. Known categories: `any` types in form/lead pages, unescaped legal-page copy, unused `intakeQuestion` plumbing.
- **manual smoke test:** started temporary Next dev server on port 3010 with validation forced on; unsigned fake POST to `/api/webhooks/twilio` returned `403`. ✅

**Follow-up needed:**
- After deploy, send a real inbound SMS through Twilio to confirm Twilio-signed requests still pass.
- Confirm Vercel production does **not** set `TWILIO_VALIDATE_REQUESTS=false`.

**Notes / surprises:**
- Twilio validation depends on the exact public URL and POST params. The handler reconstructs the public URL from forwarded headers (`x-forwarded-proto`, `x-forwarded-host`) with safe fallbacks for local dev.
- The first local smoke-test attempt used `npm run dev -- -p 3010`; PowerShell/npm did not preserve the port argument as expected. Retried by invoking Next directly with Node, then killed the temporary process tree.
- Caught that `.env.example` was still ignored by `.env*`; added `!.env.example` so the safe template is tracked without exposing real env files.

---
## 2026-05-09 — Phase 0B — Clerk middleware (proxy.ts)

**Task:** Phase 0B from `IMPLEMENTATION_PLAN.md`
**Status:** completed

**Files changed:**
- `proxy.ts` (modified — replaced partial route matcher with full public-route list)
- `middleware.ts` (created then immediately deleted — Next.js 16 uses `proxy.ts`, not `middleware.ts`)

**Reason:**
Next.js 16 (the version in this project) uses `proxy.ts` instead of `middleware.ts` for the edge proxy/middleware layer. A `proxy.ts` already existed with a narrower `isProtectedRoute` matcher that only matched `/dashboard(.*)`. This approach (protecting a whitelist of protected routes) is less safe than the inverse — defining a whitelist of *public* routes and protecting everything else. Rewrote to the deny-by-default model so any new route added later is protected automatically.

Public routes defined:
- `/` — marketing home
- `/sign-in(.*)`, `/sign-up(.*)` — Clerk auth flows
- `/privacy(.*)`, `/terms(.*)` — legal pages (required for 10DLC)
- `/api/forms/(.*)` — form submission + config (called by embed.js from external sites)
- `/api/webhooks/(.*)` — Stripe + Twilio webhooks (no session cookie, use their own signatures)
- `/api/cron/(.*)` — cron endpoint (uses CRON_SECRET header, not session)
- `/test-form/(.*)` — demo/development use

**Verification performed:**
- **typecheck (`npx tsc --noEmit`):** clean — no output. ✅
- **build (`npm run build`):** ✓ Compiled successfully in 5.5s. All 19 routes detected. `ƒ Proxy (Middleware)` confirmed in output. ✅
- **Surprise caught:** Next.js 16 rejects having both `middleware.ts` and `proxy.ts` simultaneously — threw `Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected`. Deleted `middleware.ts`; used `proxy.ts` exclusively. ✅

**Follow-up needed:**
- Manual verification: visit `/dashboard` while logged out → confirm redirect to `/sign-in`
- Manual verification: `curl -X POST https://rooflead-mu.vercel.app/api/webhooks/twilio` → confirm 400/403 (not a redirect)

**Notes / surprises:**
- Next.js 16 introduced `proxy.ts` as the new filename for the middleware layer (replacing `middleware.ts` from Next.js 13-15). The plan said to create `middleware.ts` — updated here instead. No behavior difference.
- The existing `proxy.ts` used `isProtectedRoute` (allow-by-default) which would have left any new page unprotected by default. Switched to `isPublicRoute` (deny-by-default) — safer posture.

---

## 2026-05-09 — Phase 0A — Repo safety & shared admin client

**Task:** Phase 0A from `IMPLEMENTATION_PLAN.md`
**Status:** completed

**Files changed:**
- `.env.example` (added)
- `lib/supabase/admin.ts` (added)
- `app/api/forms/[widgetKey]/route.ts` (modified — uses shared admin client)
- `app/api/forms/[widgetKey]/config/route.ts` (modified — uses shared admin client)
- `app/api/webhooks/twilio/route.ts` (modified — uses shared admin client)
- `app/api/webhooks/stripe/route.ts` (modified — uses shared admin client)
- `app/api/billing/checkout/route.ts` (modified — uses shared admin client)
- `app/api/cron/follow-up/route.ts` (modified — uses shared admin client)

**Reason:**
- `.env.example` so a future contributor (or future me) can set up local dev without guessing variable names. Lists every `process.env.*` actually referenced in `.ts/.tsx` plus the implicit Anthropic and Clerk vars. Excludes `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` because it's set in `.env.local` but never read by code.
- Shared admin client removes a maintenance hazard: 6 separate `createClient(URL, SERVICE_ROLE_KEY)` instantiations were spread across API routes. Any future change to Supabase config would have required touching every file. Now it's one helper.
- Lazy singleton (`getAdminClient()`) instead of module-level instantiation so the module is safe to import in build/tooling contexts where env vars may not be bound. Subsequent calls return the cached instance.
- Disabled `autoRefreshToken` and `persistSession` on the admin client since service-role calls are stateless server-to-server.

**Verification performed:**
- **`.gitignore`:** `git check-ignore -v` confirms `.env*`, `.env.local`, `.env.production`, `.env.development` all match line 34's `.env*` rule. ✅
- **typecheck (`npx tsc --noEmit`):** clean — no errors. ✅
- **build (`npm run build`):** ✓ Compiled successfully in 5.6s. All 16 routes detected. No regressions. ✅
- **lint (`npm run lint`):** 17 errors + 3 warnings — **all pre-existing, none introduced by 0A**:
  - `app/dashboard/leads/[id]/page.tsx`: 3× `any` types (P2-6 in plan)
  - `app/privacy/page.tsx` + `app/terms/page.tsx`: 12× unescaped quotes/apostrophes in legal copy
  - `lib/ai.ts:9` + `public/embed.js:15`: `intakeQuestion` param accepted but unused in system prompt (latent bug — see follow-up)

**Follow-up needed:**
- **NEW BUG DISCOVERED:** `intakeQuestion` parameter is plumbed through `generateConversationReply` and `embed.js` but never actually injected into the Claude system prompt. The dynamic intake question feature added earlier today does not reach the AI. Add to plan as a P1 follow-up.
- Pre-existing lint cleanup (unescaped entities, `any` types) remains tracked under P2-6.
- Phase 0B awaiting approval before starting.

**Notes / surprises:**
- `npm run build` showed "ƒ Proxy (Middleware)" in the route table even though no `middleware.ts` exists. That's Clerk's auto-injected proxy from `ClerkProvider`; it's expected. Adding a proper `middleware.ts` in 0B will replace it.
- All 6 admin-client refactors landed with zero behavior change. Net deletion of 30 lines of duplicated boilerplate.

---

## 2026-05-09 — Phase 0 — Plan and audit docs created

**Task:** Set up controlled-implementation source of truth (pre-Phase-0A)
**Status:** completed

**Files changed:**
- `docs/PROJECT_AUDIT.md` (added)
- `docs/IMPLEMENTATION_PLAN.md` (added)
- `docs/IMPLEMENTATION_LOG.md` (added)

**Reason:**
Audit was performed; before any code changes, the audit, plan, and log are committed so future sessions have full context. No application code changed in this entry.

**Verification performed:**
- File contents reviewed against the audit
- Cross-references between docs confirmed (`PROJECT_AUDIT.md` ↔ `IMPLEMENTATION_PLAN.md` ↔ `IMPLEMENTATION_LOG.md`)

**Follow-up needed:**
- Begin Phase 0A after user approval

**Notes / surprises:**
- The existing planning docs (`PRODUCT_BRIEF.md`, `MVP_SCOPE.md`, etc.) live outside the repo at `C:\Users\jaime\Claude Code\docs\` rather than in the rooflead repo. The new audit/plan/log docs are placed in `rooflead/docs/` because they need to live with the code. Consolidating the older planning docs into the repo is logged as P3.
