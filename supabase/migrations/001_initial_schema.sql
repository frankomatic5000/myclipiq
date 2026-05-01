-- MyClipIQ Database Schema

-- Customers (CRM)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  instagram TEXT,
  phone TEXT,
  content_type TEXT CHECK (content_type IN ('podcast', 'external', 'teleprompter', 'mentorship')),
  is_managed_by_us BOOLEAN DEFAULT false,
  package_type TEXT CHECK (package_type IN ('basic', 'pro', 'enterprise')) DEFAULT 'basic',
  monthly_posts INTEGER DEFAULT 4,
  status TEXT CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  raw_video_url TEXT,
  raw_video_drive_id TEXT,
  status TEXT CHECK (status IN ('intake', 'editing', 'analysis', 'review', 'approved', 'posted', 'archived')) DEFAULT 'intake',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  editing_started_at TIMESTAMPTZ,
  analysis_completed_at TIMESTAMPTZ,
  sent_for_review_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Edited Videos
CREATE TABLE edited_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  file_size INTEGER,
  hook TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  viral_score INTEGER CHECK (viral_score >= 0 AND viral_score <= 100),
  language TEXT CHECK (language IN ('pt', 'en')) DEFAULT 'pt',
  status TEXT CHECK (status IN ('pending', 'review', 'approved', 'rejected')) DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis Results
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  video_id UUID REFERENCES edited_videos(id) ON DELETE CASCADE,
  transcription TEXT,
  language TEXT DEFAULT 'pt-BR',
  hooks JSONB DEFAULT '[]',
  captions JSONB DEFAULT '{}',
  hashtags JSONB DEFAULT '{"primary": [], "secondary": [], "trending": []}',
  viral_score INTEGER,
  predicted_views INTEGER,
  predicted_engagement NUMERIC,
  optimal_posting JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT CHECK (type IN ('project_created', 'analysis_complete', 'review_requested', 'approved', 'posted')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_edited_videos_project ON edited_videos(project_id);
CREATE INDEX idx_ai_analysis_project ON ai_analysis(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE edited_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies (basic - will refine later)
CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can view all videos" ON edited_videos FOR SELECT USING (true);
