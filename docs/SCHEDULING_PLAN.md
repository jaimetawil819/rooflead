# Scheduling Plan

## Product Direction

Scheduling should start as a lightweight inspection-booking assist, not a full calendar product.

The near-term goal is to help the AI collect appointment intent and preferred timing, then make that information obvious to the roofing company. The owner still confirms the appointment manually.

## Why This Matters

Roofers do not only need qualified leads. They need the next action to be obvious. A lead that says "I need repair ASAP" is more useful when the dashboard also shows "requested inspection, prefers tomorrow afternoon."

## Phase 2G Scope

Build the foundation for scheduling:

- Business-level scheduling settings.
- Lead-level appointment status.
- Preferred appointment time.
- Appointment notes.
- Dashboard visibility and manual editing.

This phase should not integrate Google Calendar, Outlook, automatic slot claiming, reminders, or complex rescheduling.

## Business Scheduling Settings

Store these on the business record:

- Scheduling enabled.
- Timezone.
- Available days.
- Start time.
- End time.
- Inspection duration.
- Buffer time.

Default for the MVP:

- Enabled: true.
- Timezone: America/Los_Angeles.
- Days: Monday through Friday.
- Hours: 8:00 AM to 5:00 PM.
- Inspection duration: 60 minutes.
- Buffer: 15 minutes.

## Lead Scheduling Fields

Store these on the lead record:

- `appointment_status`
- `preferred_appointment_time`
- `appointment_notes`

Initial statuses:

- `not_requested`
- `requested`
- `scheduled`
- `completed`
- `canceled`

## AI Behavior

The AI may ask for preferred timing after the lead is qualified, but it must not claim that an appointment is confirmed unless the business owner confirms it.

Approved language:

- "What day or time usually works best for an inspection?"
- "I will pass that preferred time to the team so they can confirm availability."

Avoid:

- "You are booked."
- "Your appointment is confirmed."
- "The estimator will arrive at..."

## Owner Workflow

The owner should see:

- Whether scheduling has been requested.
- The preferred time.
- Any appointment notes.
- A manual status control.

The owner can then call or text the lead to confirm.

## Later Phases

Do later only after customer validation:

- Real availability slots.
- Google Calendar integration.
- Automated appointment confirmation.
- Rescheduling.
- Reminder SMS.
- Crew or estimator assignment.
- Multiple locations/timezones.

## Open Questions

- Do roofers usually offer fixed inspection windows or flexible callbacks?
- Do owners want the AI to ask for scheduling every time, or only for hot/warm leads?
- Should unqualified leads still be asked for preferred times?
- Should appointment status affect pipeline status automatically?
