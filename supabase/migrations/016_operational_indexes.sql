-- Sprint 1 operational indexes

-- Prospect lookups
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_assigned ON prospects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_prospects_created ON prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_source ON prospects(lead_source);
CREATE INDEX IF NOT EXISTS idx_prospects_converted_client ON prospects(converted_to_client_id);

-- Client lookups
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_content_type ON clients(content_type);
CREATE INDEX IF NOT EXISTS idx_clients_upsell ON clients(upsell_flag) WHERE upsell_flag = true;
CREATE INDEX IF NOT EXISTS idx_clients_last_post ON clients(last_post_at);

-- Post/calendar lookups
CREATE INDEX IF NOT EXISTS idx_posts_client ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_project ON posts(project_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Timeline + call lookups
CREATE INDEX IF NOT EXISTS idx_prospect_timeline_prospect ON prospect_timeline_events(prospect_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_calls_prospect ON prospect_call_records(prospect_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_alerts_prospect ON prospect_alerts(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_alerts_unresolved ON prospect_alerts(prospect_id) WHERE resolved_at IS NULL;

-- Client alert lookups
CREATE INDEX IF NOT EXISTS idx_client_alerts_client ON client_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_alerts_type ON client_alerts(type);
CREATE INDEX IF NOT EXISTS idx_client_alerts_unresolved ON client_alerts(client_id) WHERE resolved_at IS NULL;

-- Import audit lookups
CREATE INDEX IF NOT EXISTS idx_import_logs_user ON import_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_logs_type ON import_logs(import_type, created_at DESC);
