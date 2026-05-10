# Supabase Migrations

This folder tracks database changes for RoofLead.

## Current state

- `0001_initial_baseline.sql` is the schema snapshot generated from the live Supabase project.
- `0002_sms_opt_outs.sql` is the first tracked forward migration. It adds durable SMS opt-out storage.
- `0003_secure_rls.sql` removes permissive direct table access after dashboard data access has moved behind protected API routes.

## Apply order

Apply migrations in numeric order:

1. `0001_initial_baseline.sql` - schema snapshot of the current live database. This should normally be treated as already applied to the existing Supabase project.
2. `0002_sms_opt_outs.sql` - run in Supabase SQL Editor before deploying code that references `sms_opt_outs` or `leads.sms_opted_out_at`.
3. `0003_secure_rls.sql` - run only after deploying the protected dashboard API routes. It removes permissive anon/authenticated table access and expects private data access to go through server-owned API routes using Clerk ownership checks.

## Capturing the baseline

Use the live Supabase database as the source of truth.

Recommended path:

1. Open Supabase Dashboard.
2. Go to Project Settings -> Database.
3. Copy the connection string URI.
4. Replace `[YOUR-PASSWORD]` with the database password.
5. From `C:\Users\jaime\SaaSProject\rooflead`, run:

```powershell
pg_dump --schema-only --no-owner --no-acl --schema public "<SUPABASE_DATABASE_URL>" > supabase/migrations/0001_initial_baseline.sql
```

If `pg_dump` is not installed, install PostgreSQL locally or use Supabase CLI:

```powershell
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db dump --schema public --file supabase/migrations/0001_initial_baseline.sql
```

Do not commit passwords, connection strings, table data, or seed rows.

## Manual apply via Supabase SQL Editor

For small forward migrations:

1. Open Supabase Dashboard -> SQL Editor.
2. Open the migration file locally.
3. Paste the SQL into the editor.
4. Run it once.
5. Verify the created tables/columns in Table Editor.

## Rules

- New migrations should be additive and idempotent when practical.
- Prefer `create table if not exists`, `create index if not exists`, and `add column if not exists` for MVP-era changes.
- Never edit a migration after it has been applied to production. Add a new numbered migration instead.
- Keep RLS policy changes explicit in migrations.
