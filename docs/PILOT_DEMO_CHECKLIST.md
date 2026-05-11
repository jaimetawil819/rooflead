# Pilot Demo Checklist - RoofLead

**Created:** 2026-05-10
**Purpose:** Source of truth for getting RoofLead ready to demo to a roofing company owner.

This checklist is for pilot demos, not full production launch. The goal is to avoid embarrassing breakage, show a clear business outcome, and learn whether roofers will pay.

---

## Demo Goal

Show that RoofLead can:

1. Capture a roofing lead.
2. Respond instantly by SMS.
3. Qualify the homeowner with a short AI conversation.
4. Summarize and score the lead for the business owner.
5. Let the owner take over manually.
6. Show simple ROI metrics tied to won leads.

If the roofer does not care about these six outcomes, scheduling and extra features will not save the product.

---

## Current Demo Readiness

### Ready

- Marketing homepage.
- Authenticated dashboard.
- Business settings.
- Test form and embeddable form flow.
- AI SMS qualification flow via simulator and Twilio path.
- Lead list with filters, search, and pagination.
- Lead detail with AI summary, structured fields, status update, delete, human review, and manual owner SMS reply.
- Basic ROI dashboard using average job value and won leads.
- Dashboard demo actions for opening/copying the test form, reviewing leads, and opening settings.
- Stripe billing in test mode.
- Legal pages for Twilio A2P review.

### Needs Manual Check Before Every Demo

- Vercel production deployment is current.
- Supabase migrations are applied through `0010_average_job_value.sql`.
- Vercel env vars match local expectations.
- Twilio webhook points to the current production URL.
- Stripe webhook points to the current production URL.
- Public test form works at `/test-form`.
- Dashboard login works.
- A test lead can be created and found in the dashboard.

### Known Constraints

- A2P 10DLC approval may still block or limit real SMS delivery.
- No custom domain yet.
- Cron follow-up relies on external cron configuration.
- Scheduling is not built yet.
- Manual owner replies use the shared Twilio number.
- Estimated revenue is directional, not accounting-grade.

---

## Five-Minute Demo Script

### 1. Start With The Pain

"Most roofers lose money because web leads sit too long. RoofLead responds instantly, qualifies the homeowner, and gives you a clean summary so you know who to call first."

### 2. Show The Dashboard

Open `/dashboard`.

Point out:

- Total leads.
- Hot leads.
- Needs review.
- Won leads.
- Estimated revenue.

Keep this short. The dashboard is proof, not the whole story.

### 3. Submit A Test Lead

Open the business test form.

Submit a realistic lead:

- Name: demo homeowner name.
- Phone: test number you control or simulator phone.
- Address: realistic San Diego address.
- Service: roof repair or storm damage.

Explain:

"This can live on your website. When someone submits it, RoofLead starts the intake immediately."

### 4. Show The Conversation

Use either real SMS if A2P is working or the simulator if not.

Show that the assistant asks:

- Service need.
- Urgency.
- Timeline.
- Homeowner/renter status.

Do not over-explain the AI. The point is speed and qualification.

### 5. Show The Lead Detail

Open the new lead in `/dashboard/leads`.

Point out:

- AI summary.
- Score.
- Urgency.
- Timeline.
- Homeowner status.
- Conversation history.
- Call button.
- Manual owner reply box.

Say:

"The owner does not need to read the whole thread. They can glance at this and know what to do."

### 6. Show Owner Takeover

Send a short manual reply from the dashboard:

"Thanks, this is Jaime with the roofing team. I can take a closer look and help schedule the next step."

Explain:

"Once the owner takes over, the AI stops replying on that lead. It becomes a human conversation."

### 7. Show ROI

Mark a lead as `Won`, then return to dashboard.

Point out estimated revenue:

"If one roof job is worth several thousand dollars, this only needs to save one missed lead to pay for itself."

### 8. Ask Discovery Questions

End with questions, not a hard pitch:

- "How fast do you usually respond to web leads?"
- "Where do leads fall through the cracks right now?"
- "What is a typical completed roof job worth for you?"
- "Would this be useful if it caught even one extra job per month?"
- "What would make this unusable for your team?"

---

## Pre-Demo Technical Checklist

Run locally:

```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

Check production:

- Visit homepage.
- Sign in.
- Open dashboard.
- Use Demo Actions to open and copy the test form link.
- Open settings.
- Open `/test-form`.
- Submit a test lead.
- Confirm lead appears in dashboard.
- Confirm search works.
- Confirm pagination works if enough leads exist.
- Confirm lead detail opens.
- Confirm manual review toggle works.
- Confirm manual owner reply works if SMS delivery is available.
- Confirm average job value saves.
- Confirm marking a lead `won` updates estimated revenue.

Provider checks:

- Supabase migrations applied through `0010_average_job_value.sql`.
- Vercel env vars set.
- Twilio number active.
- Twilio webhook URL correct.
- Twilio A2P status checked.
- Stripe webhook active.
- Stripe checkout still works in test mode.

---

## Demo Data Guidelines

Before a real demo:

- Delete obvious junk/test leads.
- Keep 3-8 realistic sample leads.
- Include at least one hot lead.
- Include at least one needs-review lead.
- Include at least one won lead so ROI is visible.
- Use realistic names, services, and addresses.

Avoid:

- Joke names.
- Repeated duplicate test rows.
- Raw JSON-looking summaries.
- Empty conversations.
- Leads with the same phone number repeated many times.

---

## Stop Conditions

Do not demo to a real customer if:

- Dashboard cannot load.
- Public test form is broken.
- Lead creation is broken.
- Manual owner reply sends to the wrong number.
- Twilio webhook rejects legitimate Twilio traffic.
- Secrets or raw env values appear in logs/UI.
- The dashboard contains messy fake data that makes the product look unserious.

---

## Best Next Polish Items

1. Add production readiness checklist status to docs.
2. Consider a lightweight demo data reset/seed workflow if test data gets messy.
3. Add scheduling foundation after one or two demo calls validate demand.
