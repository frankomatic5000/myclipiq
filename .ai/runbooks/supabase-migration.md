Never run db push if migration history is drifted.
Inspect schema first.
Use targeted SQL for drifted environments.
Record migration history only after successful SQL.
Production requires backup/PITR confirmation.