begin;

alter table public.leads
  add column if not exists owner_takeover_at timestamptz;

create index if not exists leads_owner_takeover_idx
  on public.leads (business_id, owner_takeover_at, created_at desc);

commit;
