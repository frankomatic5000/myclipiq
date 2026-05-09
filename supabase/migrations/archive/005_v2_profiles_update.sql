-- Migration 005: Add v2 fields to profiles table
-- Issue: #62
-- Risk: LOW — additive only, no data loss
-- Rollback: ALTER TABLE profiles DROP COLUMN language;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'pt', 'es'));
