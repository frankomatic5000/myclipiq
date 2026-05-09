-- Sprint 1 operational schema: client operational/retention alerts

CREATE TABLE IF NOT EXISTS client_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'contract_expiring',
    'contract_expired',
    'image_auth_expiring',
    'image_auth_expired',
    'upsell_opportunity',
    'payment_overdue',
    'project_overdue'
  )),
  message TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_alerts ENABLE ROW LEVEL SECURITY;
