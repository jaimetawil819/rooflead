-- Phase 0D: durable SMS opt-out tracking.
-- Apply in Supabase SQL Editor before deploying the matching application code.

create table if not exists public.sms_opt_outs (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  keyword text not null default 'STOP',
  source text not null default 'twilio',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sms_opt_outs_phone_idx
  on public.sms_opt_outs (phone);

alter table public.sms_opt_outs enable row level security;

alter table public.leads
  add column if not exists sms_opted_out_at timestamptz;
