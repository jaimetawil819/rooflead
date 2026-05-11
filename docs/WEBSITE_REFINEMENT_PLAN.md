# Website Refinement Plan - RoofLead

**Created:** 2026-05-11  
**Last updated:** 2026-05-11  
**Purpose:** Living roadmap for refining the RoofLead marketing website and app UI into a more credible, conversion-focused SaaS product.  
**Scope:** Tracks completed refinement work, current QA status, and remaining product-polish slices.

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
- Complete: UI/UX Pro Max redesign pass applied to the marketing site with a trust-forward SaaS hero, stronger product proof, use cases, comparison framing, clearer pricing, and upgraded FAQ/final CTA.
- Complete: Dashboard overview, app shell, setup tools, and leads inbox now follow the same UI/UX Pro Max SaaS style as the homepage, including a dark command-center header and mobile-first lead cards.
- Complete: Lead detail now follows the dashboard design system with a command header, primary call/reply actions, two-column workflow layout, sticky conversation panel, and separated danger zone.
- Complete: Settings now follows the dashboard design system with a command header, responsive tab rail, polished settings panels, larger controls, clearer install code, and billing context.
- Complete: Embed widget and public test forms now follow the SaaS design system with clearer consent, stronger form hierarchy, better loading/error/success states, and safer embed rendering.
- Complete: Marketing conversion polish added a Book Demo/Pilot Setup path, stronger FAQ objection handling, cleaner pricing contact presentation, and branded auth/subscribe/success screens.
- Complete: Refinement plan cleanup removed stale original-audit language and separated completed work from remaining work.
- Complete: Desktop/mobile QA completed a static authenticated-app pass and fixed issues in onboarding, lead filters, lead detail status control, and settings service controls.
- Complete: Live mobile walkthrough found one Settings > Scheduling spacing issue; the start/end time controls no longer use decorative clock icons that crowd native mobile time inputs.
- Complete: Public support and pilot setup links now use a centralized contact config so a domain inbox or booking URL can be swapped in without hunting through marketing/legal pages.
- Complete: Public site URL, metadata, legal host copy, Stripe redirects, billing portal return path, and owner SMS deep links now use shared site URL config.
- Next: Recheck the mobile scheduling controls, then set production URL/contact env vars when a custom-domain inbox, custom domain, or booking URL is available.

---

## Executive Summary

RoofLead now has a much stronger SaaS presentation across the public website, conversion path, lead capture forms, and authenticated app. The core product foundation exists: Clerk auth, Stripe billing, onboarding, embeddable/test lead forms, AI SMS qualification, lead dashboard, lead detail, settings, and pilot demo tooling.

The original refinement goals are largely complete:

- Public site now sells pain, proof, product, pricing, FAQ, and CTA in a stronger order.
- Marketing and dashboard surfaces now share a trust-forward navy/blue SaaS design language.
- Trial, card-required billing, pricing, subscribe, and terms language now match.
- Product proof is visible through dashboard previews, realistic lead summaries, SMS flow, use cases, and trust sections.
- Dashboard, lead inbox, lead detail, settings, onboarding, embed widget, and public test forms have been upgraded from MVP utility screens to more polished operational SaaS surfaces.

The remaining refinement work is narrower:

- Recheck the Settings > Scheduling mobile time inputs after the walkthrough spacing fix.
- Set `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_PILOT_SETUP_EMAIL`, or `NEXT_PUBLIC_PILOT_SETUP_URL` in production when a custom domain, custom-domain inbox, or booking link is available.
- Tune dashboard next-action hierarchy after pilot usage reveals real owner behavior.
- Add pilot proof/testimonial/case-study content once real results exist.

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
  - Includes owner next actions, priority leads, KPIs, recent leads, ROI estimate, and secondary setup/testing tools.

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

- `/test-form` and `/test-form/[widgetKey]` - Sample and account-specific public test lead forms.
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

### Remaining Friction

- A live signed-in browser walkthrough is still needed to verify authenticated desktop/mobile layouts with real session state.
- Legal/privacy support contact is now centralized behind public env config, but still needs a custom-domain inbox value when available.
- Public app URL usage is now centralized behind site config, but production still needs the final custom-domain value when available.
- True pilot proof is not available yet, so testimonial/case-study sections should wait for real customer outcomes.
- Dashboard priority hierarchy may need further tuning after pilot feedback shows which owner actions matter most.

---

## Completed Audit Findings

### 1. Landing Page Order

Original issue: the page explained mechanics before fully selling the missed-lead pain and product proof.

Current state: complete. The page now leads with pain and proof, includes product preview/use cases/trust, then moves into how it works, pricing, FAQ, and final CTA.

### 2. Trust And Product Proof

Original issue: trust scaffolding and owner-facing product proof were too thin.

Current state: mostly complete. The site now shows realistic dashboard/SMS proof, compliance/trust signals, owner takeover, secure billing/auth cues, and a clearer pilot setup path.

Remaining: add real testimonial, pilot result, or case-study content once available.

### 3. CTA And Billing Consistency

Original issue: trial, pricing, card requirement, and checkout language needed alignment.

Current state: complete. Public pricing shows one Starter plan, trial language is card-required, and checkout creates a 14-day trial.

Remaining: keep this discipline when future plan tiers or plan-aware checkout are introduced.

### 4. Dashboard Production Hierarchy

Original issue: dashboard setup/test tools were too prominent.

Current state: complete for the current release. Overview now starts with owner next actions, priority leads, KPIs, and recent leads; setup/testing tools are secondary.

Remaining: tune exact next-action metadata after pilot usage.

### 5. Mobile Dashboard Access

Original issue: the app relied on a desktop sidebar.

Current state: complete. Mobile dashboard navigation now uses a phone-friendly top bar and slide-out drawer while desktop keeps the sidebar.

Remaining: verify with a live signed-in mobile walkthrough.

---

## Remaining Conversion Watch Items

### Clarity of Value Proposition

Current hero direction is strong:

> Respond to every roofing lead in under 60 seconds.

Keep this direction:

Keep the speed promise, but add money/lead loss framing nearby:

- "Stop losing paid roofing leads because nobody replied fast enough."
- "Every form submission gets an instant SMS follow-up, qualification, and owner summary."
- "Built for roofers spending money on Google Ads, Angi, HomeAdvisor, or local SEO."

### CTA Placement

Current state:

- Primary CTA: `Start Free Trial`.
- Secondary CTA: `Book Demo` / `Book Pilot Setup`.
- Product preview anchor remains available as a supporting link.
- Pricing and subscribe pages match the card-required trial.

Watch item:

- If future public pricing adds multiple plans, checkout needs plan-aware routing.

### Trust and Credibility

Still worth adding later:

- Pilot testimonial section.
- "Built for owner-operated roofing companies" founder note.
- Compliance/trust strip: TCPA opt-in language, STOP handling, Stripe billing, Clerk auth, Twilio SMS.
- Product screenshot showing actual dashboard.
- ROI calculator-style mini proof block.

### Lead Capture

Current state:

- Self-serve signup remains primary.
- Assisted setup is now available through Book Demo/Pilot Setup CTAs.

Watch item:

- Replace mailto-based pilot setup with a real scheduling link or CRM form when available.

---

## Visual/UI Status

### Visual Style

Current style:

- Clean white/gray/blue SaaS.
- Rounded cards.
- Lucide icons.
- DM Sans.
- Minimal and readable.

Status:

The product is now visually credible for a pilot SaaS. The brand still has room for more roofing-specific photography, proof, and case-study content later, but the major MVP-style UI gap has been addressed.

Keep this direction:

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

- Proof sections, use cases, comparison framing, pricing, FAQ, and final CTA are now in place.

Dashboard:

- Needs denser prioritization, not more cards.
- The overview should answer: "What should I do next?"

Lead detail:

- Now uses a two-column desktop workflow with primary actions high in the page and conversation/manual reply separated.

### Consistency

Remaining consistency watch items:

- Replace legal/support email with custom-domain support when available.
- Run live authenticated browser QA for dashboard/onboarding/settings in real session state.
- Keep future UI additions aligned to the navy/blue SaaS design system.

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

### 5. Use Cases - Complete

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

Status: Done on 2026-05-11

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

Status: complete. FAQ now covers:

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

Current status:

- Command-center header with primary lead actions.
- Priority queue for leads that need owner attention.
- KPI strip for lead volume, quality, review, won, and ROI context.
- Recent lead activity.
- Setup/test actions kept secondary.

Remaining:

- Tune next-action metadata after pilot feedback.

Files:

- `app/dashboard/page.tsx`
- `components/dashboard/DashboardQuickActions.tsx`

### Sidebar/Navigation

Current status:

- Desktop sidebar remains.
- Mobile top bar and slide-out drawer are complete.
- Current nav includes Overview, Leads, and Settings.

Future nav candidates:

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

Current status:

- Search, filters, pagination, status/score/review badges, mobile cards, and desktop grid are complete.
- Filter controls now have proper labels.

Future:

- Add `Next action` and `Last activity` metadata over time.

Files:

- `app/dashboard/leads/page.tsx`
- `components/dashboard/LeadsFilter.tsx`

### Lead Detail

Current status:

- Desktop two-column layout is complete.
- Call and owner reply actions are high in the page.
- AI summary, facts, pipeline status, scheduling, conversation, manual reply, and danger zone are visually separated.
- Pipeline status now has an accessible label.

Future:

- Tune scheduling and next-action metadata after pilot usage.

Files:

- `app/dashboard/leads/[id]/page.tsx`

### Settings

Current status:

- Task-focused tabs are complete: Business, Lead Form, Scheduling, and Billing.
- Install code/test form controls live under Lead Form.
- Save feedback, larger controls, clearer focus states, and accessible service controls are in place.

Future:

- Consider splitting Embed into its own top-level tab only if Lead Form becomes too dense.

Files:

- `app/dashboard/settings/page.tsx`

### Onboarding

Current status:

- Three-step setup remains: Business, Install, Test.
- The flow now matches the dashboard/marketing design system.
- Old mojibake arrow text has been removed.
- Install and test form expectations are clearer.

Future:

- Add back navigation if pilot users need to revise earlier setup steps.

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

#### 9. Add Secondary Demo CTA - Complete

What changes:

- Add `See demo` or `Book pilot setup` as a secondary CTA in hero/nav/final CTA.

Why it matters:

Early-stage SaaS often converts better through demos than pure self-serve signup.

Likely files:

- `components/marketing/Navbar.tsx`
- `components/marketing/Hero.tsx`
- `components/marketing/FinalCTA.tsx`

Difficulty: Low  
Timing: Done on 2026-05-11

#### 10. Improve FAQ Objection Handling - Complete

What changes:

- Add objections around CRM replacement, owner takeover, AI uncertainty, phone numbers, setup, and existing forms.

Why it matters:

This product has operational and compliance concerns. FAQ should reduce sales friction.

Likely files:

- `components/marketing/FAQ.tsx`

Difficulty: Low  
Timing: Done on 2026-05-11

#### 11. Brand and Contact Credibility Pass - Complete

What changes:

- Ensure consistent `RoofLead` casing.
- Replace visible personal-email marketing presentation with a more professional pilot setup CTA.
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
Timing: Done on 2026-05-11

Remaining note:

- Legal pages still use the current support email until a custom domain/support inbox exists.

### Phase 4 - Visual QA and Roadmap Hygiene

#### 12. Improve Lead List Mobile Layout - Complete

What changes:

- Replace horizontal-scroll table behavior with mobile cards.

Why it matters:

Lead triage must be usable on phone.

Likely files:

- `app/dashboard/leads/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 13. Align Dashboard Shell And Overview With Marketing Design - Complete

What changes:

- Restyle the dashboard shell with the same navy/blue SaaS language as the homepage.
- Make the overview feel like an owner command center, not a generic admin page.
- Preserve the action-first hierarchy: urgent leads, KPIs, recent leads, then setup tools.
- Update dashboard quick actions to match the new card, focus, and touch-target standards.

Why it matters:

The app should deliver on the trust created by the homepage. A roofer who signs up should land in a product that feels just as serious and conversion-aware as the public site.

Likely files:

- `app/dashboard/layout.tsx`
- `components/dashboard/Sidebar.tsx`
- `app/dashboard/page.tsx`
- `components/dashboard/DashboardQuickActions.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 14. Improve Lead Detail Layout - Complete

What changes:

- Convert to responsive two-column desktop layout.
- Keep action buttons sticky or high in the page.
- Put call and owner reply actions at the top of the workflow.
- Keep AI summary, lead facts, status controls, scheduling, and conversation visually distinct.
- Move destructive delete behavior into a separated danger zone.

Why it matters:

Lead detail is the core operating screen.

Likely files:

- `app/dashboard/leads/[id]/page.tsx`

Difficulty: Medium to High  
Timing: Done on 2026-05-11

#### 15. Align Settings With Dashboard Design System - Complete

What changes:

- Restyle the tabbed settings page to match the command-center dashboard language.
- Improve mobile tab behavior and form density.
- Keep Business, Lead Form, Scheduling, and Billing tabs, but make each panel feel like a polished SaaS settings workflow.

Why it matters:

Settings is where owners configure the form, scheduling defaults, and billing. It should feel trustworthy and organized, not like an MVP utility page.

Likely files:

- `app/dashboard/settings/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 16. Upgrade Embed Widget UI - Complete

What changes:

- Improve form styling, states, errors, and customization.
- Consider CSS isolation and safer rendering.
- Align the public sample form and account-specific test form with the UI/UX Pro Max dashboard/marketing design language.
- Preserve SMS consent clarity and make test-mode expectations obvious before the owner submits a real phone number.

Why it matters:

The widget appears on customer websites and represents both the roofer and RoofLead.

Likely files:

- `public/embed.js`
- `app/test-form/page.tsx`
- `app/test-form/[widgetKey]/page.tsx`

Difficulty: Medium  
Timing: Done on 2026-05-11

#### 17. Desktop/Mobile Visual QA - In Progress

What changes:

- Run a visual QA pass across the redesigned public and authenticated surfaces.
- Check desktop and mobile layouts for overflow, clipped text, awkward wrapping, broken sticky behavior, weak touch targets, unclear focus states, and inconsistent CTA hierarchy.
- Verify public flows directly: homepage, subscribe, success, `/test-form`, and `/test-form/[widgetKey]` when a widget key is available.
- Verify authenticated flows with a signed-in session or fallback static/code review: dashboard overview, leads inbox, lead detail, settings, mobile navigation, and tabbed settings panels.
- Record defects as focused follow-up tasks instead of starting another broad redesign.

Why it matters:

The redesign work is now broad enough that the biggest risk is not missing sections. It is small responsive and interaction issues that reduce trust during a pilot demo.

Likely files:

- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/leads/page.tsx`
- `app/dashboard/leads/[id]/page.tsx`
- `app/dashboard/settings/page.tsx`
- `components/dashboard/Sidebar.tsx`
- `public/embed.js`
- `app/test-form/page.tsx`
- `app/test-form/[widgetKey]/page.tsx`
- `docs/WEBSITE_REFINEMENT_PLAN.md`
- `docs/IMPLEMENTATION_LOG.md`

Difficulty: Medium  
Timing: Do now

Current QA notes:

- Public homepage and `/test-form` desktop screenshots did not show a desktop layout blocker.
- A headless mobile screenshot suggested possible clipping, but the real-phone check did not reproduce horizontal overflow. Treat this as a watch item, not a confirmed defect.
- Static review of the dashboard shell, leads inbox, lead detail, settings tabs, and public forms did not reveal an obvious fixed-width mobile blocker.
- Static authenticated-app review found and fixed weaker programmatic labels in lead filters, lead detail pipeline status, and settings service controls.
- Onboarding was brought into the same SaaS design system and old mojibake arrow text was removed.
- Remaining work is a live authenticated browser walkthrough with a signed-in account.

#### 18. Refinement Plan Cleanup - Complete

What changes:

- Update older audit language that still describes already-fixed problems as current defects.
- Keep completed work, current next steps, and future/later items clearly separated.
- Make the plan easier to use as a project tracker by avoiding duplicate numbering and stale "current" critiques.

Why it matters:

The plan has become the operating blueprint. If it mixes old critique with current reality, it becomes harder to choose the next slice confidently.

Likely files:

- `docs/WEBSITE_REFINEMENT_PLAN.md`
- `docs/PROJECT_AUDIT.md`

Difficulty: Low  
Timing: Done on 2026-05-11

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

## Recommended Next Execution Slice

Complete the live signed-in browser walkthrough once an authenticated session is available:

1. Verify dashboard overview on desktop and phone.
2. Verify leads inbox filters, mobile cards, pagination, and empty states.
3. Verify lead detail action hierarchy, sticky conversation panel, manual reply, scheduling, status, and danger zone.
4. Verify settings tabs and mobile tab behavior.
5. Verify onboarding from account setup through test form.
6. Record only confirmed defects as focused follow-up tasks.

Reason:

Most structural refinement is complete. The highest-value next move is catching real session-state layout or interaction issues before a pilot demo.
