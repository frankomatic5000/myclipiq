-- Migration 006: Create team_members table
-- Issue: #62
-- Risk: MEDIUM — new table with RLS, ties users to customers
-- Rollback: DROP TABLE team_members CASCADE; (destructive — documented only, not to be run without backup)

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, customer_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own team memberships
CREATE POLICY "Users can view their team memberships" ON team_members FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admins can manage team members
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
