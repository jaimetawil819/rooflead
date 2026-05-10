-- Phase 1: Stripe billing correctness.
-- Adds webhook idempotency and optional subscription metadata columns.

begin;

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text;

create index if not exists businesses_stripe_subscription_id_idx
  on public.businesses (stripe_subscription_id);

alter table public.stripe_events enable row level security;

revoke all privileges on table public.stripe_events from anon, authenticated;
grant all privileges on table public.stripe_events to service_role;

commit;
