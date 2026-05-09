-- Sprint 1 operational schema: prospects
-- Additive only. converted_to_client_id starts without FK; migration 017 adds it.

CREATE TABLE IF NOT EXISTS prospects (
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
  converted_to_client_id UUID,
  converted_at TIMESTAMPTZ
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
