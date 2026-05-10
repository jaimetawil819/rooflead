-- Phase 0: lock private application tables behind server-owned API routes.
-- Apply only after deploying code that no longer reads/writes these tables
-- directly from the browser Supabase anon client.

begin;

drop policy if exists "Allow all operations for now" on public.businesses;
drop policy if exists "Allow all operations for now" on public.form_widgets;
drop policy if exists "Allow all operations for now" on public.leads;
drop policy if exists "Allow all operations for now" on public.messages;

alter table public.businesses enable row level security;
alter table public.form_widgets enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.sms_opt_outs enable row level security;

revoke all privileges on table public.businesses from anon, authenticated;
revoke all privileges on table public.form_widgets from anon, authenticated;
revoke all privileges on table public.leads from anon, authenticated;
revoke all privileges on table public.messages from anon, authenticated;
revoke all privileges on table public.sms_opt_outs from anon, authenticated;

grant all privileges on table public.businesses to service_role;
grant all privileges on table public.form_widgets to service_role;
grant all privileges on table public.leads to service_role;
grant all privileges on table public.messages to service_role;
grant all privileges on table public.sms_opt_outs to service_role;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

commit;
