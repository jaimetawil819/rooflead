-- Phase 2G: lightweight scheduling foundations.
-- This does not implement calendar booking. It stores owner availability
-- preferences and lead appointment intent for manual follow-up.

begin;

alter table public.businesses
  add column if not exists scheduling_enabled boolean not null default true,
  add column if not exists scheduling_timezone text not null default 'America/Los_Angeles',
  add column if not exists scheduling_available_days jsonb not null default '["monday","tuesday","wednesday","thursday","friday"]'::jsonb,
  add column if not exists scheduling_start_time text not null default '08:00',
  add column if not exists scheduling_end_time text not null default '17:00',
  add column if not exists inspection_duration_minutes integer not null default 60,
  add column if not exists scheduling_buffer_minutes integer not null default 15;

alter table public.leads
  add column if not exists appointment_status text not null default 'not_requested',
  add column if not exists preferred_appointment_time text,
  add column if not exists appointment_notes text;

create index if not exists leads_appointment_status_idx
  on public.leads (business_id, appointment_status, created_at desc);

commit;
