begin;

alter table public.leads
  add column if not exists needs_human_review boolean not null default false,
  add column if not exists handoff_reason text;

create index if not exists leads_needs_human_review_idx
  on public.leads (business_id, needs_human_review, created_at desc);

commit;
