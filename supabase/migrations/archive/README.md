# Archived Migrations

These migrations were archived on 2026-05-09 during Sprint 1 cleanup.

## Why archived

- **005 duplicate files** (`005_v2_edited_videos_update.sql`, `005_v2_profiles_update.sql`, `005_v2_projects_update.sql`):
  Multiple migrations with the same numeric prefix. Only one can run per `supabase migration up`.
  The changes in these files are either:
  - Already applied via earlier migrations (e.g. `status_history` was already added)
  - Or superseded by Sprint 1 schema (e.g. `edited_videos` AI fields moved to Phase 2)

- **006 files** (`006_v2_archive_log.sql`, `006_v2_project_reviews.sql`, `006_v2_team_members.sql`):
  These tables are Phase 2 (AI pipeline, archival, team management). Sprint 1 scope is operational CRM only.

- **007 files** (`007_v2_ai_analyses.sql`, `007_v2_background_jobs.sql`):
  `ai_analyses` already exists from migration 001. `background_jobs` is Phase 2 infrastructure.

## Migration history fix

Migration history in `supabase_migrations.schema_migrations` was updated to mark all of these as "applied" with placeholder statements. This prevents `supabase migration up` from attempting to re-run them.

## Sprint 1 migration chain

```
001_initial_schema.sql
002_background_processing.sql
003_create_profile_trigger.sql
004_durable_background_jobs.sql
008_clients_table.sql
009_prospects_table.sql
010_prospect_events_calls.sql
011_client_alerts.sql
012_projects_service_checklist.sql
013_posts_table.sql
014_import_logs.sql
015_operational_rls.sql
016_operational_indexes.sql
017_prospect_client_fk.sql
018_verification.sql
```

## Recovery

To restore any archived migration, move it back to `../` and rename with a unique sequential number.
