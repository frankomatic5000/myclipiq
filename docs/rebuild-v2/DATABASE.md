# MyClipIQ v2 — Database Design

## Current Schema (Legacy)

### Tables

| Table | Purpose | Status |
|-------|---------|--------|
| **customers** | CRM — creators, brands, agencies | ✅ Keep |
| **projects** | Video projects linked to customers | ✅ Keep |
| **edited_videos** | Final edited video versions | ✅ Keep |
| **ai_analysis** | Legacy AI analysis results | ⚠️ Deprecate |
| **ai_analyses** | New AI analysis results | ✅ Keep |
| **notifications** | User notifications | ✅ Keep |
| **profiles** | User profiles + roles | ✅ Keep |
| **video_uploads** | Raw video uploads to R2 | ✅ Keep |
| **background_jobs** | Durable job queue | ✅ Keep |

## v2 Schema Changes

### What to Keep
- `customers` — core CRM
- `projects` — core workflow
- `edited_videos` — with added fields
- `ai_analyses` — primary analysis table
- `notifications` — with added types
- `profiles` — role-based access
- `video_uploads` — R2 lifecycle
- `background_jobs` — durable execution

### What to Redesign

#### 1. `projects` — Add Status History
```sql
ALTER TABLE projects ADD COLUMN status_history JSONB DEFAULT '[]';
-- Track: intake → editing → analysis → review → approved → posted → archived
```

#### 2. `edited_videos` — Add AI Picks
```sql
ALTER TABLE edited_videos ADD COLUMN ai_hook TEXT;
ALTER TABLE edited_videos ADD COLUMN ai_caption TEXT;
ALTER TABLE edited_videos ADD COLUMN ai_hashtags TEXT[] DEFAULT '{}';
ALTER TABLE edited_videos ADD COLUMN ai_viral_score INTEGER;
ALTER TABLE edited_videos ADD COLUMN editor_picks JSONB DEFAULT '{}';
-- editor_picks: { hook_index: 2, caption: "custom", hashtags: ["trending"] }
```

#### 3. New Table: `project_reviews`
```sql
CREATE TABLE project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT CHECK (stage IN ('editor', 'creator', 'customer')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. New Table: `team_members`
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('viewer', 'editor', 'admin')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. New Table: `archive_log`
```sql
CREATE TABLE archive_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_id UUID REFERENCES edited_videos(id) ON DELETE CASCADE,
  r2_key TEXT,
  drive_id TEXT,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);
```

### What to Deprecate
- `ai_analysis` (legacy) — migrate data to `ai_analyses`

### Migration Risks

| Risk | Mitigation |
|------|-----------|
| Data loss during `ai_analysis` → `ai_analyses` migration | Backup first, run migration script, verify counts |
| RLS policy gaps on new tables | Create policies before deploying |
| Performance on large video tables | Index on `created_at DESC`, consider partitioning |
| Team member duplicates | Unique constraint on `(user_id, customer_id)` |

## Indexes Needed (v2)

```sql
-- Project lookups
CREATE INDEX idx_projects_status_customer ON projects(status, customer_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Video lookups
CREATE INDEX idx_edited_videos_status ON edited_videos(status);

-- Review lookups
CREATE INDEX idx_project_reviews_project ON project_reviews(project_id);
CREATE INDEX idx_project_reviews_stage ON project_reviews(stage);

-- Archive lookups
CREATE INDEX idx_archive_log_project ON archive_log(project_id);

-- Background job lookups
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
```

## Row Level Security (v2)

```sql
-- Team members can see projects for their customers
CREATE POLICY "Team members can view customer projects" ON projects FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM team_members WHERE team_members.customer_id = projects.customer_id AND team_members.user_id = auth.uid()
  )
);

-- Editors can update projects for their customers
CREATE POLICY "Editors can update customer projects" ON projects FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM team_members WHERE team_members.customer_id = projects.customer_id AND team_members.user_id = auth.uid() AND team_members.role IN ('editor', 'admin')
  )
);
```
