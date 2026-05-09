-- Sprint 1 operational schema: spreadsheet import audit logs

CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  import_type TEXT NOT NULL CHECK (import_type IN ('prospects', 'clients')),
  source_filename TEXT,
  rows_total INTEGER,
  rows_imported INTEGER,
  rows_failed INTEGER,
  errors JSONB DEFAULT '[]',
  column_mapping JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
