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

-- Profiles used by the authenticated app shell
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('viewer', 'editor', 'admin')) DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upload and analysis tables used by the AI routes
CREATE TABLE video_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo')),
  status TEXT CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')) DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES video_uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  clip_suggestions JSONB DEFAULT '[]',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_edited_videos_project ON edited_videos(project_id);
CREATE INDEX idx_ai_analysis_project ON ai_analysis(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_video_uploads_user ON video_uploads(user_id, created_at DESC);
CREATE INDEX idx_ai_analyses_user ON ai_analyses(user_id, created_at DESC);
CREATE INDEX idx_ai_analyses_upload ON ai_analyses(upload_id);

-- Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE edited_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Policies: never expose application data to anonymous users via the public anon key.
CREATE POLICY "Authenticated users can view customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view videos" ON edited_videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view legacy AI analysis" ON ai_analysis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles AS self WHERE self.id = auth.uid() AND self.role = 'admin'
  )
);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM profiles AS self WHERE self.id = auth.uid() AND self.role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles AS self WHERE self.id = auth.uid() AND self.role = 'admin'
  )
);

CREATE POLICY "Users can view their uploads" ON video_uploads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their uploads" ON video_uploads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their uploads" ON video_uploads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their analyses" ON ai_analyses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their analyses" ON ai_analyses FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM video_uploads
    WHERE video_uploads.id = ai_analyses.upload_id
      AND video_uploads.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update their analyses" ON ai_analyses FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
