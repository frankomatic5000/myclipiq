-- Sprint 1 operational schema: publishing calendar posts

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN (
    'instagram',
    'tiktok',
    'youtube',
    'linkedin',
    'facebook',
    'twitter',
    'other'
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

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
