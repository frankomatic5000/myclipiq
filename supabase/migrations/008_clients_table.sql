-- Sprint 1 operational schema: clients
-- Risk: HIGH — additive only. Do not modify customers/projects destructively.
-- Rollback note: remove this migration only before it is applied to shared environments.

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  instagram TEXT,
  phone TEXT,
  company TEXT,

  content_type TEXT CHECK (content_type IN (
    'podcast',
    'external',
    'teleprompter',
    'mentorship',
    'social_media',
    'glowup',
    'event_coverage',
    'course',
    'custom'
  )),
  is_managed_by_us BOOLEAN DEFAULT false,
  package_type TEXT CHECK (package_type IN ('basic', 'pro', 'enterprise', 'custom')) DEFAULT 'basic',
  monthly_posts INTEGER DEFAULT 4,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'churned')) DEFAULT 'active',

  contract_status TEXT CHECK (contract_status IN (
    'none',
    'pending',
    'sent',
    'signed',
    'expired'
  )) DEFAULT 'none',
  contract_sent_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ,
  contract_expires_at TIMESTAMPTZ,
  contract_url TEXT,

  image_auth_status TEXT CHECK (image_auth_status IN (
    'not_requested',
    'pending',
    'signed',
    'expired',
    'not_needed'
  )) DEFAULT 'not_requested',
  image_auth_signed_at TIMESTAMPTZ,
  image_auth_expires_at TIMESTAMPTZ,
  image_auth_url TEXT,

  last_post_at TIMESTAMPTZ,
  last_post_platform TEXT,
  upsell_flag BOOLEAN DEFAULT false,
  upsell_flag_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Transitional copy from legacy customers. Keeps customers and projects.customer_id untouched.
INSERT INTO clients (
  id,
  name,
  email,
  instagram,
  phone,
  content_type,
  is_managed_by_us,
  package_type,
  monthly_posts,
  status,
  created_at,
  updated_at
)
SELECT
  customers.id,
  customers.name,
  customers.email,
  customers.instagram,
  customers.phone,
  customers.content_type,
  COALESCE(customers.is_managed_by_us, false),
  customers.package_type,
  customers.monthly_posts,
  customers.status,
  customers.created_at,
  customers.updated_at
FROM customers
ON CONFLICT (id) DO NOTHING;

-- Defensive: ensure public.update_updated_at_column() exists before triggers use it.
-- Migration 004 creates this, but adding defensively for standalone environments.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
