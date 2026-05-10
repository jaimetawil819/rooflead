-- Phase 1: structured lead extraction.
-- Stores key qualification fields separately from the free-text AI summary.

begin;

alter table public.leads
  add column if not exists timeline text,
  add column if not exists is_homeowner boolean,
  add column if not exists qualification_reason text;

commit;
