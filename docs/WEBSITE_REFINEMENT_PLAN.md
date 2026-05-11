# Website Refinement Plan - RoofLead

**Created:** 2026-05-11  
**Last updated:** 2026-05-11  
**Purpose:** Blueprint for refining the RoofLead marketing website and app UI into a more credible, conversion-focused SaaS product.  
**Scope:** Planning only. Do not implement until this plan is approved and split into execution slices.

---

## Current Progress

- Complete: Simplified public pricing to one supported Starter plan.
- Complete: Confirmed 14-day free trial requires a payment card.
- Complete: Updated checkout to create a 14-day Stripe trial with card collection.
- Complete: Updated pricing, final CTA, subscribe page, and terms copy to match.
- Complete: Moved the landing page problem/pain section immediately after the hero.
- Complete: Added a product preview section showing the owner-facing lead outcome.
- Complete: Added a trust section with SMS consent, STOP handling, owner takeover, and secure account/billing signals.
- Complete: Dashboard overview now starts with owner next actions and demotes setup/test tools.
- Complete: Settings now uses task-focused tabs for Business, Lead Form, Scheduling, and Billing.
- Complete: Mobile dashboard navigation now supports a phone-friendly top bar and slide-out drawer while preserving the desktop sidebar.
- Next: Improve the mobile lead list layout so lead triage feels native on a phone.

---

## Executive Summary

RoofLead already has the important product foundation: a marketing site, Clerk auth, Stripe billing, onboarding, an embeddable/test lead form, AI SMS qualification, lead dashboard, lead detail, settings, and pilot demo tooling.

The main weakness is not that the product is missing. The weakness is that the website and app presentation still feel like a clean MVP/pilot console rather than a serious SaaS product that a roofer would trust with every paid web lead.

The highest-impact refinement is a focused conversion and credibility pass:

- Reorder the landing page around pain, proof, product, pricing, and CTA.
- Add visible product proof: dashboard preview, realistic lead summary, SMS flow, and/or pilot testimonial.
- Fix CTA and billing consistency so the trial, pricing, and checkout path match.
- Move demo-only dashboard language out of the primary customer experience.
- Improve mobile dashboard navigation and dashboard information hierarchy.

This should be treated as the next product-polish track after core reliability and pilot demo readiness.

---

## Current Website Structure

### Marketing Routes

- `/` - Main landing page.
  - File: `app/page.tsx`
  - Components:
    - `components/marketing/Navbar.tsx`
    - `components/marketing/Hero.tsx`
    - `components/marketing/HowItWorks.tsx`
    - `components/marketing/Problem.tsx`
    - `components/marketing/Pricing.tsx`
    - `components/marketing/FAQ.tsx`
    - `components/marketing/FinalCTA.tsx`
    - `components/marketing/Footer.tsx`

- `/privacy` - Legal/privacy page.
  - File: `app/privacy/page.tsx`

- `/terms` - Terms page.
  - File: `app/terms/page.tsx`

### Conversion Routes

- `/sign-up` - Clerk sign-up.
  - File: `app/sign-up/[[...sign-up]]/page.tsx`

- `/sign-in` - Clerk sign-in.
  - File: `app/sign-in/[[...sign-in]]/page.tsx`

- `/subscribe` - Stripe checkout entry page.
  - File: `app/subscribe/page.tsx`

- `/subscribe/success` - Post-checkout success page.
  - File: `app/subscribe/success/page.tsx`

### Product/App Routes

- `/dashboard` - App overview.
  - File: `app/dashboard/page.tsx`
  - Includes stats, demo actions, recent leads, ROI estimate.

- `/dashboard/leads` - Lead list.
  - File: `app/dashboard/leads/page.tsx`
  - Includes filters, search, pagination, status/score badges.

- `/dashboard/leads/[id]` - Lead detail.
  - File: `app/dashboard/leads/[id]/page.tsx`
  - Includes snapshot, AI summary, structured fields, owner review, status, scheduling, conversation, manual SMS reply.

- `/dashboard/settings` - Business, scheduling, billing, form, and embed settings.
  - File: `app/dashboard/settings/page.tsx`

- `/dashboard/onboarding` - Initial account setup.
  - File: `app/dashboard/onboarding/page.tsx`

- `/test-form` and `/test-form/[widgetKey]` - Sample/demo lead forms.
  - Files:
    - `app/test-form/page.tsx`
    - `app/test-form/[widgetKey]/page.tsx`

- Embed widget.
  - File: `public/embed.js`

---

## Current User Flow

### Intended Customer Flow

1. Visitor lands on homepage.
2. Visitor understands the promise: respond to every roofing lead in under 60 seconds.
3. Visitor clicks `Start Free Trial`.
4. Visitor signs up with Clerk.
5. Visitor subscribes through Stripe.
6. Visitor completes onboarding.
7. Visitor gets an embed snippet or test form.
8. A homeowner submits the form.
9. RoofLead starts SMS qualification.
10. Business owner reviews lead in the dashboard.
11. Owner calls or manually replies to the lead.

### Current Friction

- The homepage asks for trial signup before enough trust is built.
- Pricing has now been simplified to the supported Starter plan while plan-specific checkout is deferred.
- The trial has now been clarified as 14 days free with a payment card required.
- Dashboard setup/test tools have been demoted below the core lead workflow.
- The app dashboard is not clearly optimized around the owner's fastest action: calling the best lead first.

---

## Biggest Layout Problems

### 1. Landing Page Order Is Not Ideal

Current order:

1. Hero
2. How it works
3. Problem
4. Pricing
5. FAQ
6. Final CTA

Recommended order:

1. Hero
2. Pain/proof
3. Product/solution
4. How it works
5. Use cases
6. Trust
7. Pricing
8. FAQ
9. Final CTA

Why this matters:

Roofers need to feel the business pain before they care about mechanics. The page currently explains how the product works before it fully proves why the user should care.

### 2. Trust Is Too Thin

The site has strong claims but little trust scaffolding:

- No customer testimonial.
- No pilot result.
- No founder credibility note.
- No product screenshot.
- No source/context for response-time claims.
- No production domain/business email signal in the pricing section.

### 3. Product Preview Is Too Abstract

The SMS mockup in `Hero.tsx` is useful, but the buyer also needs to see the owner outcome:

- Hot/warm/cold score.
- AI summary.
- Call button.
- Conversation history.
- "Needs review" and owner takeover.
- Estimated recovered revenue.

The dashboard is the proof that this is not just a chatbot.

### 4. CTA/Billing Path Needs Continued Discipline

Decision now made:

- Marketing CTA says `Start Free Trial`.
- Trial is 14 days free.
- A payment card is required to activate the trial.
- Public pricing shows one supported Starter plan.
- Checkout creates a Starter subscription with a 14-day trial.

Keep this consistent as new CTAs, pricing pages, and plan tiers are added.

### 5. Dashboard Reads Like a Demo Tool

`DashboardQuickActions.tsx` is practical for walkthroughs, but it should not be the dominant customer-facing workflow. A production owner should first see:

- Leads needing action.
- Hot leads.
- New or uncontacted leads.
- Recent qualified leads.
- Revenue/ROI context.

Demo/test actions should be secondary or only visible in onboarding/demo mode.

### 6. Dashboard Mobile Navigation Is Missing

`components/dashboard/Sidebar.tsx` uses a fixed desktop sidebar. Small roofing company owners are likely to check leads on a phone. The app needs a mobile navigation pattern:

- Top bar with menu button.
- Slide-out drawer.
- Bottom nav for core areas, or compact mobile sidebar.
- Mobile-friendly lead detail actions.

---

## Conversion Weaknesses

### Clarity of Value Proposition

Current hero headline is strong:

> Respond to every roofing lead in under 60 seconds.

Recommended refinement:

Keep the speed promise, but add money/lead loss framing nearby:

- "Stop losing paid roofing leads because nobody replied fast enough."
- "Every form submission gets an instant SMS follow-up, qualification, and owner summary."
- "Built for roofers spending money on Google Ads, Angi, HomeAdvisor, or local SEO."

### CTA Placement

Current CTAs:

- Navbar: Start Free Trial
- Hero: Start Free Trial, See How It Works
- Pricing cards: Start Free Trial
- Final CTA: Start Your Free Trial

Recommended:

- Primary CTA: `Start free trial`
- Secondary CTA: `See 3-minute demo` or `View product preview`
- Pricing CTA should preserve selected plan or route to a plan-aware checkout.
- Final CTA should reinforce ROI and risk reversal.

### Trust and Credibility

Add one or more of:

- Pilot testimonial section.
- "Built for owner-operated roofing companies" founder note.
- Compliance/trust strip: TCPA opt-in language, STOP handling, Stripe billing, Clerk auth, Twilio SMS.
- Product screenshot showing actual dashboard.
- ROI calculator-style mini proof block.

### Lead Capture

The site currently only pushes sign-up. For early pilots, a lower-friction path may convert better:

- "Book a 15-minute demo"
- "See it on your website"
- "Get a pilot setup"

This does not need to replace signup, but a demo CTA should exist while the product is still early.

---

## Visual/UI Weaknesses

### Visual Style

Current style:

- Clean white/gray/blue SaaS.
- Rounded cards.
- Lucide icons.
- DM Sans.
- Minimal and readable.

Weakness:

It is polished enough for an MVP, but not distinctive. It could be any AI SaaS. It needs more roofing/home-services specificity without becoming gimmicky.

Recommended direction:

- Keep the clean SaaS foundation.
- Add product screenshots and realistic field-service context.
- Use color more intentionally:
  - Blue for primary action/trust.
  - Amber for urgency/inspection.
  - Green for won/revenue.
  - Red only for hot/urgent or destructive states.
- Avoid overusing generic cards and oversized empty white space in operational app screens.

### Information Density

Marketing page:

- Reasonable density, but missing proof sections.

Dashboard:

- Needs denser prioritization, not more cards.
- The overview should answer: "What should I do next?"

Lead detail:

- Good functional coverage.
- Should eventually become a two-column workflow page on desktop:
  - Left: lead status, summary, call/reply actions, scheduling.
  - Right: conversation.

### Consistency

Inconsistencies to fix:

- `RoofLead` casing vs rendered logo text.
- Button styles across marketing, subscribe, success, onboarding.
- Trial/card language.
- Dashboard production copy vs demo copy.
- Rounded card-heavy surfaces in settings and dashboard.

---

## Recommended Landing Page Structure

### 1. Hero

Purpose:

Immediately explain what RoofLead does and why the buyer should care.

Content:

- Headline: speed plus lead-loss pain.
- Subheadline: AI texts, qualifies, summarizes, and scores the lead.
- Primary CTA: `Start free trial`
- Secondary CTA: `See product demo`
- Trust/risk row: 14-day trial, setup under 10 minutes, cancel anytime.
- Visual: product/dashboard preview plus SMS conversation.

Visual format:

- Use a split or stacked product preview, not just centered text.
- On desktop, show dashboard/SMS mock together.
- On mobile, prioritize headline, CTA, and one compact visual.

Files:

- `components/marketing/Hero.tsx`

### 2. Pain/Problem

Purpose:

Make the cost of slow response obvious.

Content:

- Paid leads are expensive.
- After-hours submissions go cold.
- Competitors respond first.
- One recovered job can pay for the tool many times over.

Visual format:

- Keep the dark section from `Problem.tsx`, but move it earlier.
- Add a more concrete "missed lead math" panel.
- Use citations or soften unsupported claims.

Files:

- `components/marketing/Problem.tsx`
- `app/page.tsx`

### 3. Solution/Product Preview

Purpose:

Show the product outcome, not only the process.

Content:

- AI summary.
- Lead quality score.
- Owner notification.
- Call/reply action.
- Conversation history.

Visual format:

- Dashboard screenshot or coded preview panel.
- Avoid fake-looking generic charts.
- Use realistic roofing lead data.

Files:

- New component: `components/marketing/ProductPreview.tsx`

### 4. How It Works

Purpose:

Explain the simple operating model after the visitor understands the pain.

Content:

1. Homeowner submits form.
2. AI texts in under 60 seconds.
3. AI asks qualifying questions.
4. Owner gets summary and score.
5. Owner calls or takes over.

Visual format:

- 3 to 5 horizontal/vertical steps.
- Keep concise.

Files:

- `components/marketing/HowItWorks.tsx`

### 5. Use Cases

Purpose:

Help the roofer recognize specific moments where RoofLead helps.

Content:

- After-hours leads.
- Storm season surges.
- Google Ads form submissions.
- Office manager overload.
- Unresponsive leads needing follow-up.

Visual format:

- Compact cards or split list.
- Each use case should include a concrete benefit.

Files:

- New component: `components/marketing/UseCases.tsx`

### 6. Trust/Credibility

Purpose:

Reduce perceived risk.

Content options:

- Pilot testimonial when available.
- "Built for small roofing companies" founder note.
- Compliance row:
  - SMS consent language.
  - STOP opt-out handling.
  - Stripe billing.
  - Secure dashboard.
- Short case study once the first pilot has a result.

Visual format:

- One focused testimonial/case study is better than empty logo placeholders.
- If no testimonial exists, use a founder note plus compliance proof.

Files:

- New component: `components/marketing/Trust.tsx`

### 7. Pricing

Purpose:

Make the cost feel easy relative to one recovered job.

Content:

- Show one supported Starter plan for now.
- Keep Pro out of public pricing until plan-specific checkout exists.
- Clearly state:
  - Trial length.
  - Whether card is required.
  - Setup fee, if any.
  - Conversation limits.
  - What happens after trial.

Visual format:

- Fewer, clearer plans.
- Show "One recovered job can pay for a year" near pricing.

Files:

- `components/marketing/Pricing.tsx`
- `app/subscribe/page.tsx`
- `app/api/billing/checkout/route.ts`

### 8. FAQ

Purpose:

Answer objections before signup/demo.

Current FAQ is useful. Add or refine:

- "Can I use my existing website form?"
- "Does this replace my CRM?"
- "What if the AI is unsure?"
- "Can the owner take over?"
- "Do I need a new phone number?"
- "What does setup involve?"

Files:

- `components/marketing/FAQ.tsx`

### 9. Final CTA

Purpose:

Restate value and give one low-friction next step.

Content:

- "Catch the next lead before a competitor does."
- Primary CTA: `Start free trial` or `Book pilot setup`.
- Secondary text must match billing reality.

Files:

- `components/marketing/FinalCTA.tsx`

---

## Recommended Dashboard/App Structure

### Dashboard Overview

Current:

- Welcome header.
- Demo actions.
- Six stats.
- Recent leads.

Recommended:

1. Header with business name and primary action.
2. Priority queue:
   - Hot leads.
   - Needs review.
   - New/uncontacted leads.
3. KPI strip:
   - Total leads.
   - Hot leads.
   - Qualified leads.
   - Won value.
4. Recent activity.
5. Demo/test actions as secondary/collapsible section.

Files:

- `app/dashboard/page.tsx`
- `components/dashboard/DashboardQuickActions.tsx`

### Sidebar/Navigation

Current:

- Fixed desktop sidebar.
- Overview, Leads, Settings.

Recommended:

- Add mobile top bar and menu drawer.
- Consider future nav:
  - Overview
  - Leads
  - Inbox/Conversations
  - Settings
  - Billing
  - Setup

Files:

- `components/dashboard/Sidebar.tsx`
- `app/dashboard/layout.tsx`

### Lead List

Current:

- Search, filters, table-like grid, pagination.

Recommended:

- Keep current functionality.
- Add `Next action` and `Last activity` over time.
- Make mobile rows card-like rather than relying on horizontal scroll.
- Preserve urgency/score/status badges.

Files:

- `app/dashboard/leads/page.tsx`
- `components/dashboard/LeadsFilter.tsx`

### Lead Detail

Current:

- Strong feature coverage in one vertical column.

Recommended:

- Desktop two-column layout:
  - Left/main: snapshot, AI summary, action buttons, scheduling/status.
  - Right: conversation and manual reply.
- Primary action should be obvious:
  - Call lead.
  - Send manual reply.
  - Mark won/lost.
- Move `Delete Test Lead` away from normal production actions.

Files:

- `app/dashboard/leads/[id]/page.tsx`

### Settings

Current:

- Long single-column settings form.

Recommended:

- Split into tabs or sections:
  - Business
  - Lead Form
  - Scheduling
  - Billing
  - Embed
- Add clearer save feedback and validation.

Files:

- `app/dashboard/settings/page.tsx`

### Onboarding

Current:

- Business info -> embed code -> test lead.

Recommended:

- Keep simple flow.
- Add ability to go back.
- Add clearer difference between "test form" and "install on website."
- After completion, land on a guided dashboard state.

Files:

- `app/dashboard/onboarding/page.tsx`

---

## Prioritized Implementation Plan

### Phase 1 - Critical Conversion and Trust Fixes

#### 1. Fix Trial, Pricing, and Checkout Consistency - Complete

What changes:

- Use one supported Starter plan for now.
- Require a payment card to activate the 14-day free trial.
- Make all marketing copy match that reality.
- Keep Pro out of the public pricing page until plan-specific checkout exists.

Why it matters:

Pricing confusion is one of the fastest ways to lose trust.

Likely files:

- `components/marketing/Hero.tsx`
- `components/marketing/Pricing.tsx`
- `components/marketing/FinalCTA.tsx`
- `app/subscribe/page.tsx`
- `app/api/billing/checkout/route.ts`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 2. Reorder Landing Page Sections - Complete

What changes:

- Move `Problem` immediately after `Hero`.
- Move `HowItWorks` after the pain/solution framing.
- Add placeholder slots for product preview and trust.

Why it matters:

The page should sell the problem before explaining mechanics.

Likely files:

- `app/page.tsx`

Difficulty: Low  
Timing: Done on 2026-05-11

#### 3. Add Product Preview Section - Complete

What changes:

- Create a marketing section that shows a realistic lead summary, score, conversation, and owner action.

Why it matters:

The dashboard outcome is the proof that RoofLead is not just another chatbot.

Likely files:

- `components/marketing/ProductPreview.tsx`
- `app/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 4. Add Trust Section - Complete

What changes:

- Add a credibility section with compliance, security, SMS opt-out, and either founder/pilot proof.

Why it matters:

RoofLead handles customer leads and outbound SMS. Buyers need confidence.

Likely files:

- `components/marketing/Trust.tsx`
- `app/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

### Phase 2 - Dashboard Production Polish

#### 5. Reduce Demo-Language Prominence - Complete

What changes:

- Rename or demote `Demo Actions`.
- Make production next actions more prominent.
- Keep test form links accessible but secondary.

Why it matters:

The dashboard should feel like the owner's daily lead command center.

Likely files:

- `components/dashboard/DashboardQuickActions.tsx`
- `app/dashboard/page.tsx`

Difficulty: Low  
Timing: Done on 2026-05-11

#### 6. Settings Information Architecture Pass - Complete

What changes:

- Split the long settings page into task-focused tabs.
- Group business identity and ROI defaults under `Business`.
- Group services, AI opening question, embed code, and test form access under `Lead Form`.
- Group availability and appointment-intent controls under `Scheduling`.
- Keep subscription management under `Billing`.

Why it matters:

Settings is already carrying multiple unrelated jobs. Tabs reduce cognitive load now and leave room for future SaaS expansion without turning settings into one long scroll.

Likely files:

- `app/dashboard/settings/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 7. Add Mobile Dashboard Navigation - Complete

What changes:

- Add mobile top bar/menu.
- Keep desktop sidebar.
- Ensure leads, settings, and lead detail are reachable on phone.

Why it matters:

Roofing owners will check leads from job sites and trucks.

Likely files:

- `components/dashboard/Sidebar.tsx`
- `app/dashboard/layout.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 8. Refine Dashboard Priority Hierarchy

What changes:

- Continue tuning the priority queue if pilot use reveals missing queue states.
- Consider clearer next-action metadata such as call, reply, mark won/lost, or schedule inspection.

Why it matters:

Owners need action, not analytics first.

Likely files:

- `app/dashboard/page.tsx`

Difficulty: Medium  
Timing: Later, after pilot feedback

### Phase 3 - Marketing Polish and Lead Capture

#### 9. Add Secondary Demo CTA

What changes:

- Add `See demo` or `Book pilot setup` as a secondary CTA in hero/nav/final CTA.

Why it matters:

Early-stage SaaS often converts better through demos than pure self-serve signup.

Likely files:

- `components/marketing/Navbar.tsx`
- `components/marketing/Hero.tsx`
- `components/marketing/FinalCTA.tsx`

Difficulty: Low  
Timing: Do next

#### 10. Improve FAQ Objection Handling

What changes:

- Add objections around CRM replacement, owner takeover, AI uncertainty, phone numbers, setup, and existing forms.

Why it matters:

This product has operational and compliance concerns. FAQ should reduce sales friction.

Likely files:

- `components/marketing/FAQ.tsx`

Difficulty: Low  
Timing: Do next

#### 11. Brand and Contact Credibility Pass

What changes:

- Ensure consistent `RoofLead` casing.
- Replace personal Gmail with domain email when available.
- Add footer links to privacy and terms.
- Improve auth/subscribe/success page brand framing.

Why it matters:

Small trust gaps compound on a paid SaaS site.

Likely files:

- `public/logo.png` or logo source if available
- `components/marketing/Footer.tsx`
- `components/marketing/Pricing.tsx`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/subscribe/page.tsx`
- `app/subscribe/success/page.tsx`

Difficulty: Low to Medium  
Timing: Do next

### Phase 4 - Future SaaS Expansion

#### 11. Improve Lead List Mobile Layout

What changes:

- Replace horizontal-scroll table behavior with mobile cards.

Why it matters:

Lead triage must be usable on phone.

Likely files:

- `app/dashboard/leads/page.tsx`

Difficulty: Medium  
Timing: Do next

#### 12. Improve Lead Detail Layout

What changes:

- Convert to responsive two-column desktop layout.
- Keep action buttons sticky or high in the page.

Why it matters:

Lead detail is the core operating screen.

Likely files:

- `app/dashboard/leads/[id]/page.tsx`

Difficulty: Medium to High  
Timing: Later

#### 13. Upgrade Embed Widget UI

What changes:

- Improve form styling, states, errors, and customization.
- Consider CSS isolation and safer rendering.

Why it matters:

The widget appears on customer websites and represents both the roofer and RoofLead.

Likely files:

- `public/embed.js`
- `app/test-form/page.tsx`
- `app/test-form/[widgetKey]/page.tsx`

Difficulty: Medium  
Timing: Later

---

## File Ownership Map

### Marketing

- `app/page.tsx` - Section order and landing page composition.
- `components/marketing/Navbar.tsx` - Navigation and top-level CTAs.
- `components/marketing/Hero.tsx` - First impression, main message, primary conversion action.
- `components/marketing/Problem.tsx` - Pain, urgency, ROI math.
- `components/marketing/HowItWorks.tsx` - Process explanation.
- `components/marketing/Pricing.tsx` - Plan structure and signup path.
- `components/marketing/FAQ.tsx` - Objection handling.
- `components/marketing/FinalCTA.tsx` - Bottom conversion action.
- `components/marketing/Footer.tsx` - Trust/legal/navigation closure.

### App/Dashboard

- `app/dashboard/layout.tsx` - Protected app shell.
- `components/dashboard/Sidebar.tsx` - App navigation.
- `app/dashboard/page.tsx` - Owner overview and lead priorities.
- `components/dashboard/DashboardQuickActions.tsx` - Test/demo actions.
- `app/dashboard/leads/page.tsx` - Lead list and CRM table/card layout.
- `components/dashboard/LeadsFilter.tsx` - Search and filtering controls.
- `app/dashboard/leads/[id]/page.tsx` - Lead detail, conversation, action workflow.
- `app/dashboard/settings/page.tsx` - Business, form, billing, scheduling settings.
- `app/dashboard/onboarding/page.tsx` - First-run setup.

### Conversion/Billing

- `app/subscribe/page.tsx` - Checkout pre-sell page.
- `app/subscribe/success/page.tsx` - Post-checkout transition.
- `app/api/billing/checkout/route.ts` - Stripe checkout session creation.
- `app/api/billing/portal/route.ts` - Billing portal.
- `app/api/webhooks/stripe/route.ts` - Subscription lifecycle updates.
- `proxy.ts` - Public/protected route boundaries.

### Lead Capture

- `public/embed.js` - Customer-facing embedded widget.
- `app/test-form/page.tsx` - Sample opt-in form.
- `app/test-form/[widgetKey]/page.tsx` - Account-specific test form.
- `app/api/forms/[widgetKey]/route.ts` - Form submission endpoint.
- `app/api/forms/[widgetKey]/config/route.ts` - Widget/test form config.

---

## Acceptance Criteria

### Landing Page

- Visitor can understand product value in 5 seconds.
- Page explains pain before mechanics.
- Primary and secondary CTA are visible above the fold.
- Trial/card/pricing copy is consistent everywhere.
- At least one product preview section exists.
- At least one trust/credibility section exists.
- Pricing plan CTA maps to real supported checkout behavior.
- Footer includes core nav and legal links.

### Dashboard

- Desktop dashboard clearly answers "who should I call first?"
- Demo/test actions are not the primary production experience.
- Mobile navigation exists and core pages are reachable.
- Lead detail primary actions are obvious.
- Destructive test/deletion controls are visually separated from normal workflow.

### Visual Quality

- No horizontal content overflow on common mobile widths.
- Typography scale is consistent across marketing and app pages.
- CTA hierarchy is clear.
- Brand casing and contact details are consistent.
- UI feels like a serious SaaS product, not a one-off demo.

---

## Recommended First Execution Slice

Start with a narrow, high-impact slice:

1. Fix CTA/trial/pricing copy consistency.
2. Reorder landing page to `Hero -> Problem -> ProductPreview -> Trust -> HowItWorks -> Pricing -> FAQ -> FinalCTA`.
3. Add a simple coded `ProductPreview` section using realistic lead/dashboard data.
4. Add a lightweight `Trust` section.
5. Keep dashboard changes for the next slice.

Reason:

This improves conversion credibility without disturbing the authenticated app workflow. It is the safest first step and creates a stronger public face before deeper dashboard refactors.
