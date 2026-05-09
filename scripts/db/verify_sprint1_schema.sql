-- Sprint 1 Migration Verification Script
-- Run this after applying migrations 008–017 to verify correctness.

-- ============================================
-- 1. Verify all 8 new tables exist
-- ============================================
SELECT 'clients' AS table_name, EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients'
) AS exists
UNION ALL SELECT 'prospects', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prospects'
)
UNION ALL SELECT 'prospect_timeline_events', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prospect_timeline_events'
)
UNION ALL SELECT 'prospect_call_records', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prospect_call_records'
)
UNION ALL SELECT 'prospect_alerts', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prospect_alerts'
)
UNION ALL SELECT 'client_alerts', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'client_alerts'
)
UNION ALL SELECT 'posts', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts'
)
UNION ALL SELECT 'import_logs', EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_logs'
)
ORDER BY table_name;

-- ============================================
-- 2. Verify RLS is enabled on all 8 new tables
-- ============================================
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN (
  'clients', 'prospects', 'prospect_timeline_events',
  'prospect_call_records', 'prospect_alerts', 'client_alerts',
  'posts', 'import_logs'
)
AND relkind = 'r'
ORDER BY relname;

-- ============================================
-- 3. Verify policies exist for each table
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'clients', 'prospects', 'prospect_timeline_events',
  'prospect_call_records', 'prospect_alerts', 'client_alerts',
  'posts', 'import_logs'
)
ORDER BY tablename, policyname;

-- ============================================
-- 4. Verify prospect → client FK in migration 017
-- ============================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'prospects'
AND kcu.column_name = 'converted_to_client_id';

-- ============================================
-- 5. Verify lead_source includes upsell_trigger
-- ============================================
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'prospects' AND column_name = 'lead_source';

-- ============================================
-- 6. Verify projects has new columns (service_type, checklist)
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
AND column_name IN ('service_type', 'checklist', 'status_history')
ORDER BY column_name;

-- ============================================
-- 7. Verify no destructive changes to customers/projects
-- ============================================
-- customers table should still exist with all original columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- projects.customer_id should still exist (not renamed yet)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'customer_id';

-- ============================================
-- 8. Verify update_updated_at_column() function exists
-- ============================================
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'update_updated_at_column';

-- ============================================
-- 9. Seed test data
-- ============================================

-- Insert test client
INSERT INTO clients (name, email, company, status, contract_status, image_auth_status)
VALUES ('Test Client', 'test@example.com', 'Test Company', 'active', 'signed', 'signed')
ON CONFLICT (email) DO NOTHING;

-- Insert test prospect
INSERT INTO prospects (name, company, email, status, lead_source, revenue_estimate)
VALUES ('Test Prospect', 'Prospect Co', 'prospect@example.com', 'lead_cadastrado', 'instagram_dm', 5000.00)
ON CONFLICT (email) DO NOTHING;

-- Insert test post
INSERT INTO posts (client_id, platform, content_type, caption, status)
SELECT id, 'instagram', 'reel', 'Test caption', 'draft'
FROM clients WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- Insert test client alert
INSERT INTO client_alerts (client_id, type, message)
SELECT id, 'upsell_opportunity', 'Test upsell alert'
FROM clients WHERE email = 'test@example.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. Basic CRUD smoke test
-- ============================================

-- Create prospect
INSERT INTO prospects (name, company, email, status, lead_source)
VALUES ('CRUD Test', 'CRUD Co', 'crud@example.com', 'primeiro_contato_enviado', 'referral')
ON CONFLICT (email) DO NOTHING
RETURNING id, name, status;

-- Update prospect status
UPDATE prospects SET status = 'negociacao' WHERE email = 'crud@example.com' RETURNING id, status;

-- Create timeline event
INSERT INTO prospect_timeline_events (prospect_id, type, description, author_id)
SELECT id, 'status_change', 'Moved to negociacao', NULL
FROM prospects WHERE email = 'crud@example.com'
RETURNING id, type, description;

-- Create call record
INSERT INTO prospect_call_records (prospect_id, date, duration_minutes, outcome, notes)
SELECT id, NOW(), 30, 'positive', 'Good call', NULL
FROM prospects WHERE email = 'crud@example.com'
RETURNING id, duration_minutes, outcome;

-- Convert prospect to client (simulated)
UPDATE prospects SET status = 'venda_fechada' WHERE email = 'crud@example.com' RETURNING id, status;

-- Verify clients were copied from customers
SELECT COUNT(*) AS client_count FROM clients;
SELECT COUNT(*) AS customer_count FROM customers;

-- Verify posts
SELECT COUNT(*) AS post_count FROM posts;

-- Verify alerts
SELECT COUNT(*) AS client_alert_count FROM client_alerts;
SELECT COUNT(*) AS prospect_alert_count FROM prospect_alerts;
