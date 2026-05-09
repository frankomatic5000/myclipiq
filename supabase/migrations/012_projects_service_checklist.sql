-- Sprint 1 operational schema: additive project fields only
-- Existing projects.customer_id remains untouched during clients transition.

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

-- Already added in 005_v2_projects_update.sql; retained here as idempotent guard for fresh DBs.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]';
