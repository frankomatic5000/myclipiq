-- Migration 006: Create project_reviews table
-- Issue: #62
-- Risk: MEDIUM — new table with RLS, foreign keys to projects and auth.users
-- Rollback: DROP TABLE project_reviews CASCADE; (destructive — documented only, not to be run without backup)

CREATE TABLE IF NOT EXISTS project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('editor', 'creator', 'customer')),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_reviews_project ON project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_stage ON project_reviews(stage);

ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Team members can view reviews for projects belonging to their customer
CREATE POLICY "Team members can view reviews" ON project_reviews FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.customer_id = (
      SELECT customer_id FROM projects WHERE projects.id = project_reviews.project_id
    )
    AND team_members.user_id = auth.uid()
  )
);

-- Reviewers can update their own reviews
CREATE POLICY "Reviewers can update their reviews" ON project_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
