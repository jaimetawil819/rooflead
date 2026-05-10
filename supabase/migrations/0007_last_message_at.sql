-- Track the latest conversation activity for timeout/follow-up logic.

alter table public.leads
  add column if not exists last_message_at timestamptz;

update public.leads
set last_message_at = coalesce(
  (
    select max(public.messages.sent_at)
    from public.messages
    where public.messages.lead_id = public.leads.id
  ),
  public.leads.created_at,
  now()
)
where last_message_at is null;

alter table public.leads
  alter column last_message_at set default now();

alter table public.leads
  alter column last_message_at set not null;

create index if not exists leads_status_last_message_at_idx
  on public.leads (status, last_message_at);
