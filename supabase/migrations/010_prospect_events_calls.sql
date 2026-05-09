-- Sprint 1 operational schema: prospect timeline, calls, and sales alerts
-- prospect_alerts are sales pipeline only: follow_up, deadline, payment.

CREATE TABLE IF NOT EXISTS prospect_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'message',
    'call',
    'email',
    'status_change',
    'note',
    'conversion'
  )),
  description TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospect_call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  outcome TEXT,
  notes TEXT,
  follow_up_suggested_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prospect_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow_up', 'deadline', 'payment')),
  message TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prospect_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_alerts ENABLE ROW LEVEL SECURITY;
