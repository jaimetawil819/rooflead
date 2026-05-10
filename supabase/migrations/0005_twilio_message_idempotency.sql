-- Phase 1: Twilio/message idempotency.
-- Prevents duplicate Twilio webhook delivery from creating duplicate inbound messages.

begin;

alter table public.messages
  add column if not exists twilio_message_sid text;

create unique index if not exists messages_twilio_message_sid_key
  on public.messages (twilio_message_sid)
  where twilio_message_sid is not null;

commit;
