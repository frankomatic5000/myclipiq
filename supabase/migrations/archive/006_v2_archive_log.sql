-- Migration 006: Create archive_log table
-- Issue: #62
-- Risk: MEDIUM — new table with RLS, foreign keys to projects and edited_videos
-- Rollback: DROP TABLE archive_log CASCADE; (destructive — documented only, not to be run without backup)

CREATE TABLE IF NOT EXISTS archive_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_id UUID REFERENCES edited_videos(id) ON DELETE CASCADE,
  r2_key TEXT,
  drive_id TEXT,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_log_project ON archive_log(project_id);

ALTER TABLE archive_log ENABLE ROW LEVEL SECURITY;

-- Team members can view archive logs for projects belonging to their customer
CREATE POLICY "Team members can view archive logs" ON archive_log FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.customer_id = (
      SELECT customer_id FROM projects WHERE projects.id = archive_log.project_id
    )
    AND team_members.user_id = auth.uid()
  )
);
