# Secret Rotation Checklist

Use this checklist before onboarding a real pilot customer or switching any service to live production mode.

Do not paste secrets into chat, screenshots, GitHub issues, commit messages, docs, or Slack. Rotate values in each provider dashboard, then update local `.env.local` and Vercel Environment Variables.

## Why this matters

During early setup, some development keys and tokens were visible in local screenshots / transcripts. Even if they were test-mode keys, treat them as compromised. Rotating now is cheaper than wondering later.

## Rotation order

### 1. Supabase

Rotate:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Where:
- Supabase Dashboard -> Project Settings -> API

After rotating:
- Update `.env.local`
- Update Vercel -> Project -> Settings -> Environment Variables
- Redeploy
- Test dashboard pages, form submission, Twilio webhook, Stripe webhook

Notes:
- The service role key is the most sensitive database secret. Never expose it in client code.
- Rotating the anon key may require updating any deployed environment immediately.

### 2. Twilio

Rotate:
- `TWILIO_AUTH_TOKEN`

Where:
- Twilio Console -> Account -> API keys & tokens

After rotating:
- Update `.env.local`
- Update Vercel Environment Variables
- Redeploy
- Send a test form lead and confirm Twilio attempts the outbound SMS
- Send an inbound SMS and confirm the webhook accepts the signed request

Important:
- Do not set `TWILIO_VALIDATE_REQUESTS=false` in Vercel. Production should validate webhook signatures.

### 3. Anthropic

Rotate:
- `ANTHROPIC_API_KEY`

Where:
- Anthropic Console -> API keys

After rotating:
- Update `.env.local`
- Update Vercel Environment Variables
- Redeploy
- Complete a test lead conversation until the AI replies

### 4. Stripe

Rotate:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Where:
- Stripe Dashboard -> Developers -> API keys
- Stripe Dashboard -> Developers -> Webhooks / Event destinations

After rotating:
- Update `.env.local`
- Update Vercel Environment Variables
- Redeploy
- Run a test checkout
- Confirm webhook updates `businesses.subscription_status`

Notes:
- Keep test-mode and live-mode keys separate.
- Do not switch to live Stripe until domain, terms/privacy, and Twilio 10DLC are ready.

### 5. Clerk

Rotate:
- `CLERK_SECRET_KEY`

Where:
- Clerk Dashboard -> API keys

After rotating:
- Update `.env.local`
- Update Vercel Environment Variables
- Redeploy
- Test sign-in, sign-up, dashboard protection, and sign-out

### 6. Cron

Rotate:
- `CRON_SECRET`

Generate locally:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After rotating:
- Update `.env.local`
- Update Vercel Environment Variables
- Update cron-job.org Authorization header:

```text
Authorization: Bearer NEW_CRON_SECRET
```

- Run the cron URL manually with the new header and confirm it returns JSON instead of `401`

## Vercel deployment checklist

After updating Vercel env vars:

```powershell
npx.cmd vercel --prod
```

Then verify:

- Marketing site loads
- Sign-up works
- Stripe checkout works
- Dashboard unlocks after subscription
- Settings save works
- Test form creates a lead
- SMS greeting sends or appears as a Twilio attempt
- Inbound SMS webhook works
- STOP creates an opt-out row
- Follow-up cron does not text opted-out numbers

## Keep local and production values separate

Recommended:

- `.env.local` = local development / test-mode values
- Vercel Preview = test-mode values
- Vercel Production = production-ready values

Do not commit real `.env*` files.
