-- Migration 007: Create background_jobs table
-- Issue: #62
-- Risk: MEDIUM — new table with RLS, no foreign keys
-- Rollback: DROP TABLE background_jobs CASCADE; (destructive — documented only, not to be run without backup)

CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);

ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Admins can view background jobs
CREATE POLICY "Admins can view background jobs" ON background_jobs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_background_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS background_jobs_updated_at ON public.background_jobs;
CREATE TRIGGER background_jobs_updated_at
  BEFORE UPDATE ON public.background_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_background_jobs_updated_at();
