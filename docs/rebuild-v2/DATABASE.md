# MyClipIQ v2 — Database Design (Operational MVP)

> **Last updated**: 2026-05-09
> **Scope**: Sprint 1 — operational backbone tables
> **Phase 2 tables**: marked with [Phase 2] — do not implement in Sprint 1

---

## Sprint 1 New Tables

### 1. `prospects` — Sales Pipeline (replaces mock data)

```sql
CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  instagram TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'lead_cadastrado'
    CHECK (status IN (
      'lead_cadastrado',
      'primeiro_contato_enviado',
      'aguardando_resposta',
      'respondeu',
      'follow_up_enviado',
      'call_agendada',
      'call_realizada',
      'proposta_enviada',
      'negociacao',
      'venda_fechada',
      'venda_perdida',
      'pediu_contato_futuro'
    )),
  lead_source TEXT CHECK (lead_source IN (
    'instagram_dm',
    'referral',
    'event',
    'cold_outreach',
    'website',
    'whatsapp',
    'upsell_trigger',
    'other'
  )),
  products_interested TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revenue_estimate NUMERIC(12,2),
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- converted_to_client_id added in 010_clients_table.sql via ALTER
  -- (clients table must exist first)
  converted_to_client_id UUID,
  converted_at TIMESTAMPTZ
);
```

### 2. `prospect_timeline_events` — Auto-logged + manual

```sql
CREATE TABLE prospect_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'message', 'call', 'email', 'status_change', 'note', 'conversion'
  )),
  description TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `prospect_call_records`

```sql
CREATE TABLE prospect_call_records (
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
```

### 4. `prospect_alerts` (sales pipeline alerts only)

```sql
CREATE TABLE prospect_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow_up', 'deadline', 'payment')),
  message TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Contract alerts are client-level**, not prospect-level. See `client_alerts` below.
> **Rule**: prospect_alerts = sales pipeline only. client_alerts = operational/contract alerts.

### 5. `clients` — Active Customers (evolution of `customers`)

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  instagram TEXT,
  phone TEXT,
  company TEXT,

  -- Operational fields from current spreadsheets
  content_type TEXT CHECK (content_type IN (
    'podcast', 'external', 'teleprompter', 'mentorship',
    'social_media', 'glowup', 'event_coverage', 'course', 'custom'
  )),
  is_managed_by_us BOOLEAN DEFAULT false,
  package_type TEXT CHECK (package_type IN ('basic', 'pro', 'enterprise', 'custom')) DEFAULT 'basic',
  monthly_posts INTEGER DEFAULT 4,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'churned')) DEFAULT 'active',

  -- Contract tracking
  contract_status TEXT CHECK (contract_status IN (
    'none', 'pending', 'sent', 'signed', 'expired'
  )) DEFAULT 'none',
  contract_sent_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ,
  contract_expires_at TIMESTAMPTZ,
  contract_url TEXT,

  -- Image authorization
  image_auth_status TEXT CHECK (image_auth_status IN (
    'not_requested', 'pending', 'signed', 'expired', 'not_needed'
  )) DEFAULT 'not_requested',
  image_auth_signed_at TIMESTAMPTZ,
  image_auth_expires_at TIMESTAMPTZ,
  image_auth_url TEXT,

  -- Upsell / retention
  last_post_at TIMESTAMPTZ,
  last_post_platform TEXT,
  upsell_flag BOOLEAN DEFAULT false,
  upsell_flag_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. `projects` — Content Production (Sprint 1: operational fields)

```sql
-- Existing table from 001_initial_schema.sql — ALTER to add fields:
ALTER TABLE projects ADD COLUMN IF NOT EXISTS service_type TEXT CHECK (service_type IN (
  'podcast_entrevista',
  'gravacao_curso',
  'gravacao_mentoria',
  'conteudo_pronto_postar',
  'gestao_redes_sociais',
  'glowup_instagram',
  'cobertura_evento',
  'publicacao_pessoas_globais',
  'participacao_pernas_cruzadas',
  'pacote_personalizado'
));

ALTER TABLE projects ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';
-- checklist: [{ id, label, done, category, due_date }]

ALTER TABLE projects ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]';
-- status_history: [{ status, changed_at, changed_by }]
```

### 7. `posts` — Publishing Calendar

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN (
    'instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'twitter', 'other'
  )),
  content_type TEXT CHECK (content_type IN ('reel', 'story', 'carousel', 'video', 'photo', 'text')),
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'posted', 'archived')),
  clip_url TEXT,
  thumbnail_url TEXT,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. `client_alerts` — Operational alerts (contract, image auth, upsell)

```sql
CREATE TABLE client_alerts (
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
```

> **Why separate from prospect_alerts?**
> - prospect_alerts = sales pipeline (follow_up, deadline, payment)
> - client_alerts = operational/retention (contracts, image auth, upsell, project)
> - Different lifecycles, different owners, different UIs

### 9. `import_logs` — Spreadsheet Import Audit

```sql
CREATE TABLE import_logs (
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
```

---

## Sprint 1 — Keep Existing Tables (from 001_initial_schema.sql)

| Table | Status | Notes |
|-------|--------|-------|
| `customers` | ⚠️ **Migrate to `clients`** | Keep during transition; eventually migrate data |
| `profiles` | ✅ Keep | Add `language` column (005_v2_profiles_update.sql already applied) |
| `team_members` | ✅ Keep | From 006_v2_team_members.sql |
| `notifications` | ✅ Keep | Expand types for operational events |

---

## Sprint 1 — Deprecate / Do Not Use

| Table | Reason |
|-------|--------|
| `ai_analysis` (legacy) | Replaced by `ai_analyses`, but both are Phase 2 |
| `ai_analyses` | Phase 2 — AI clip analysis not in Sprint 1 |
| `video_uploads` | Phase 2 — R2 upload pipeline not in Sprint 1 |
| `analysis_jobs` | Phase 2 — background AI processing not in Sprint 1 |
| `edited_videos` | Phase 2 — video editing pipeline not in Sprint 1 |
| `project_reviews` | Phase 2 — customer approval workflow not in Sprint 1 |
| `archive_log` | Phase 2 — archive automation not in Sprint 1 |

---

## Indexes (Sprint 1)

```sql
-- Prospect lookups
CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_assigned ON prospects(assigned_to);
CREATE INDEX idx_prospects_created ON prospects(created_at DESC);
CREATE INDEX idx_prospects_source ON prospects(lead_source);

-- Client lookups
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_content_type ON clients(content_type);
CREATE INDEX idx_clients_upsell ON clients(upsell_flag) WHERE upsell_flag = true;
CREATE INDEX idx_clients_last_post ON clients(last_post_at);

-- Post/calendar lookups
CREATE INDEX idx_posts_client ON posts(client_id);
CREATE INDEX idx_posts_project ON posts(project_id);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at);
CREATE INDEX idx_posts_status ON posts(status);

-- Timeline + call lookups
CREATE INDEX idx_prospect_timeline_prospect ON prospect_timeline_events(prospect_id, created_at DESC);
CREATE INDEX idx_prospect_calls_prospect ON prospect_call_records(prospect_id, date DESC);

-- Client alert lookups
CREATE INDEX idx_client_alerts_client ON client_alerts(client_id);
CREATE INDEX idx_client_alerts_type ON client_alerts(type);
CREATE INDEX idx_client_alerts_unresolved ON client_alerts(client_id) WHERE resolved_at IS NULL;
```

---

## RLS Policies (Sprint 1)

```sql
-- Prospects: team members can view all (internal CRM)
CREATE POLICY "Team can view prospects" ON prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can create prospects" ON prospects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Assigned user or admin can update prospects" ON prospects FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (true);

-- Clients: same model
CREATE POLICY "Team can view clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can create clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Posts: same model
CREATE POLICY "Team can view posts" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Team can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can update posts" ON posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Timeline/Calls/Alerts: cascade from prospect access
CREATE POLICY "Team can view prospect events" ON prospect_timeline_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_timeline_events.prospect_id)
);
CREATE POLICY "Team can create prospect events" ON prospect_timeline_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Team can view prospect calls" ON prospect_call_records FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_call_records.prospect_id)
);
CREATE POLICY "Team can create prospect calls" ON prospect_call_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Team can view prospect alerts" ON prospect_alerts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM prospects WHERE prospects.id = prospect_alerts.prospect_id)
);
CREATE POLICY "Team can create prospect alerts" ON prospect_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can resolve prospect alerts" ON prospect_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Client alerts: same model
CREATE POLICY "Team can view client alerts" ON client_alerts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_alerts.client_id)
);
CREATE POLICY "Team can create client alerts" ON client_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Team can resolve client alerts" ON client_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

---

## Migration Order (Sprint 1) — FIXED

```
008_clients_table.sql          -- MUST be first (prospects references clients)
009_prospects_table.sql        -- FK to clients added after clients exists
010_prospect_events_calls.sql
011_client_alerts.sql
012_projects_service_checklist.sql  -- ALTER existing projects table
013_posts_table.sql
014_import_logs.sql
015_operational_rls.sql
016_operational_indexes.sql
017_prospect_client_fk.sql     -- ADD FK: prospects.converted_to_client_id → clients.id
```

## Sprint 1 — Contracts & Image Auth: Field-Based Approach

| Concern | Decision |
|---------|----------|
| **Separate tables vs fields?** | **Fields on `clients` table for Sprint 1** |
| **Why not separate tables?** | Simplicity. Karine needs to see contract status at a glance. No complex contract versioning needed yet. |
| **When to split?** | Phase 2+ if contract history/versions needed |
| **Current fields** | `contract_status`, `contract_sent_at`, `contract_signed_at`, `contract_expires_at`, `contract_url` |
| **Current image auth fields** | `image_auth_status`, `image_auth_signed_at`, `image_auth_expires_at`, `image_auth_url` |
| **Alerts** | `client_alerts` table with type = 'contract_expiring' / 'image_auth_expiring' |

> **Risk**: `clients` table may conflict with existing `customers` data. Migration must handle:
> 1. Create `clients` table (no FK conflicts, additive)
> 2. Copy data from `customers` with field mapping (nullable new fields)
> 3. `projects.customer_id` → keep as-is for now (rename in Phase 2)
> 4. **HIGH RISK** — requires Rod approval before execution
