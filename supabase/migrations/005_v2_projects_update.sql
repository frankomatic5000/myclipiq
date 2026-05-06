-- Migration 005: Add v2 fields to projects table
-- Issue: #62
-- Risk: LOW — additive only, no data loss
-- Rollback: ALTER TABLE projects DROP COLUMN status_history;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]';
