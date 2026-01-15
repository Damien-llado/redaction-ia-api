-- ============================================
-- SCHEMA DE BASE DE DONNÉES REDACTION IA
-- ============================================

-- Extension pour génération UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer l'utilisateur unique (mono-utilisateur)
INSERT INTO users (email, name) VALUES ('admin@redaction-ia.local', 'Administrateur');

-- ============================================
-- TABLE: projects
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom_projet TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domaine TEXT,
  informations_site TEXT,
  audience_cible TEXT,
  ton_redaction TEXT,
  style_ecriture TEXT,
  synthese_a_propos TEXT,
  url_page_a_propos TEXT,
  date_creation TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ============================================
-- TABLE: eeat_elements
-- ============================================
CREATE TABLE eeat_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eeat_project_id ON eeat_elements(project_id);

-- ============================================
-- TABLE: redactions
-- ============================================
CREATE TABLE redactions (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_id TEXT,
  nom_article TEXT NOT NULL,
  mot_cle TEXT,
  date_redaction TIMESTAMPTZ DEFAULT NOW(),
  lien_google_doc TEXT,
  statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redactions_project_id ON redactions(project_id);
CREATE INDEX idx_redactions_doc_id ON redactions(doc_id);
CREATE INDEX idx_redactions_statut ON redactions(statut);

-- ============================================
-- TABLE: current_briefs
-- ============================================
CREATE TABLE current_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  doc_id TEXT,
  lien_google_doc TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_current_briefs_project_id ON current_briefs(project_id);

-- ============================================
-- TABLE: style_analysis_requests
-- ============================================
CREATE TABLE style_analysis_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  urls TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  result_ton_redaction TEXT,
  result_style_ecriture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_style_analysis_project_id ON style_analysis_requests(project_id);
CREATE INDEX idx_style_analysis_status ON style_analysis_requests(status);

-- ============================================
-- Commentaires pour documentation
-- ============================================
COMMENT ON TABLE projects IS 'Projets de rédaction avec configuration (ton, style, E-E-A-T)';
COMMENT ON TABLE eeat_elements IS 'Éléments E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)';
COMMENT ON TABLE redactions IS 'Briefs et rédactions générées par IA';
COMMENT ON TABLE current_briefs IS 'Brief courant en édition (1 par projet)';
COMMENT ON TABLE style_analysis_requests IS 'Demandes d''analyse de style rédactionnel';
