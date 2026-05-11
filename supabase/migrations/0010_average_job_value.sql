begin;

alter table public.businesses
  add column if not exists average_job_value_cents integer not null default 800000;

commit;
