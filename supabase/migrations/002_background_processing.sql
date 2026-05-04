-- Enable pgmq extension for lightweight background job queue
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Analysis jobs table for tracking background processing
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES video_uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed')) DEFAULT 'queued',
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast polling by user
CREATE INDEX idx_analysis_jobs_user ON analysis_jobs(user_id, created_at DESC);
CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status, created_at);
CREATE INDEX idx_analysis_jobs_upload ON analysis_jobs(upload_id);

-- Row Level Security
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their jobs" ON analysis_jobs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their jobs" ON analysis_jobs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their jobs" ON analysis_jobs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Create the queue for analysis jobs
SELECT pgmq.create('analysis_queue');
