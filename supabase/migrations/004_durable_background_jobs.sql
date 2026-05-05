-- Migration: Durable background jobs with retry, timeout detection, and cleanup
-- Issue: #23

-- Add retry_count column to analysis_jobs
ALTER TABLE analysis_jobs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3);

-- Ensure updated_at is maintained by a trigger (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS analysis_jobs_updated_at ON public.analysis_jobs;
CREATE TRIGGER analysis_jobs_updated_at
  BEFORE UPDATE ON public.analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for finding orphaned/stuck jobs quickly
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_orphaned
  ON analysis_jobs(status, updated_at)
  WHERE status IN ('queued', 'processing');

-- Detect orphaned jobs: processing/queued for > 5 minutes with no progress
CREATE OR REPLACE FUNCTION public.detect_orphaned_jobs()
RETURNS TABLE (
  job_id UUID,
  current_status TEXT,
  last_updated TIMESTAMPTZ,
  current_retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    aj.id AS job_id,
    aj.status AS current_status,
    aj.updated_at AS last_updated,
    aj.retry_count AS current_retry_count
  FROM public.analysis_jobs aj
  WHERE aj.status IN ('queued', 'processing')
    AND aj.updated_at < NOW() - INTERVAL '5 minutes'
  ORDER BY aj.updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retry an orphaned job: bump retry_count, reset status to queued, update timestamps
-- Returns true if retry was applied, false if max retries reached or job not found.
CREATE OR REPLACE FUNCTION public.retry_analysis_job(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job FROM public.analysis_jobs WHERE id = p_job_id FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Idempotency: already completed or failed, do nothing
  IF v_job.status IN ('completed', 'failed') THEN
    RETURN FALSE;
  END IF;

  -- Dead-letter: exceeded max retries
  IF v_job.retry_count >= 3 THEN
    UPDATE public.analysis_jobs
    SET status = 'failed',
        error_message = COALESCE(error_message, '') || ' | Max retries exceeded (dead-letter)',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_job_id;

    UPDATE public.ai_analyses
    SET status = 'failed',
        updated_at = NOW()
    WHERE id = v_job.analysis_id;

    UPDATE public.video_uploads
    SET status = 'failed',
        updated_at = NOW()
    WHERE id = v_job.upload_id;

    RETURN FALSE;
  END IF;

  -- Reset to queued and bump retry_count
  UPDATE public.analysis_jobs
  SET status = 'queued',
      retry_count = retry_count + 1,
      started_at = NULL,
      error_message = COALESCE(error_message, '') || ' | Retry #' || (retry_count + 1)::TEXT || ' at ' || NOW()::TEXT,
      updated_at = NOW()
  WHERE id = p_job_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function: delete completed jobs older than 7 days
-- Also deletes their associated analysis_jobs to keep the table lean.
CREATE OR REPLACE FUNCTION public.cleanup_old_completed_jobs()
RETURNS TABLE (
  deleted_job_id UUID,
  deleted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH deleted AS (
    DELETE FROM public.analysis_jobs
    WHERE status = 'completed'
      AND completed_at < NOW() - INTERVAL '7 days'
    RETURNING id, NOW() AS deleted_at
  )
  SELECT deleted.id, deleted.deleted_at FROM deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: helper to run both orphan detection + retry in one call.
-- This can be invoked by a cron/scheduler every minute.
CREATE OR REPLACE FUNCTION public.run_analysis_job_recovery()
RETURNS TABLE (
  job_id UUID,
  action TEXT
) AS $$
DECLARE
  rec RECORD;
  retried BOOLEAN;
BEGIN
  FOR rec IN
    SELECT * FROM public.detect_orphaned_jobs()
  LOOP
    retried := public.retry_analysis_job(rec.job_id);
    IF retried THEN
      job_id := rec.job_id;
      action := 'retried';
      RETURN NEXT;
    ELSE
      job_id := rec.job_id;
      action := 'dead-lettered or already resolved';
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron schedule for recovery (every 2 minutes) — requires pg_cron extension.
-- If pg_cron is unavailable, run the function via an external scheduler.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('analysis-job-recovery', '*/2 * * * *', 'SELECT * FROM public.run_analysis_job_recovery()');
    PERFORM cron.schedule('analysis-job-cleanup', '0 3 * * *', 'SELECT * FROM public.cleanup_old_completed_jobs()');
  END IF;
END $$;

-- Comments for documentation
COMMENT ON COLUMN public.analysis_jobs.retry_count IS 'Number of retries attempted (max 3 before dead-letter)';
COMMENT ON FUNCTION public.detect_orphaned_jobs() IS 'Returns jobs stuck in queued/processing for more than 5 minutes';
COMMENT ON FUNCTION public.retry_analysis_job(UUID) IS 'Retries a stuck job up to 3 times; dead-letters after max retries';
COMMENT ON FUNCTION public.cleanup_old_completed_jobs() IS 'Deletes completed analysis_jobs older than 7 days';
COMMENT ON FUNCTION public.run_analysis_job_recovery() IS 'Detects orphaned jobs and retries them automatically';
