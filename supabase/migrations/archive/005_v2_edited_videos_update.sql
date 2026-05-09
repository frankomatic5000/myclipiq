-- Migration 005: Add v2 fields to edited_videos table
-- Issue: #62
-- Risk: LOW — additive only, no data loss
-- Rollback: ALTER TABLE edited_videos DROP COLUMN ai_hook, DROP COLUMN ai_caption, DROP COLUMN ai_hashtags, DROP COLUMN ai_viral_score, DROP COLUMN editor_picks;

ALTER TABLE edited_videos ADD COLUMN IF NOT EXISTS ai_hook TEXT;
ALTER TABLE edited_videos ADD COLUMN IF NOT EXISTS ai_caption TEXT;
ALTER TABLE edited_videos ADD COLUMN IF NOT EXISTS ai_hashtags TEXT[] DEFAULT '{}';
ALTER TABLE edited_videos ADD COLUMN IF NOT EXISTS ai_viral_score INTEGER;
ALTER TABLE edited_videos ADD COLUMN IF NOT EXISTS editor_picks JSONB DEFAULT '{}';
