-- ============================================================
-- AzetoAI — Supabase Schema
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- Table des clés API
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key          TEXT NOT NULL UNIQUE,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des paramètres (une seule ligne, id=1)
CREATE TABLE IF NOT EXISTS settings (
  id          INT PRIMARY KEY DEFAULT 1,
  plugin_url  TEXT NOT NULL DEFAULT 'https://example.com/azetoai-plugin.rbxm',
  tools       JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insérer la ligne settings par défaut
INSERT INTO settings (id, plugin_url, tools)
VALUES (1, 'https://example.com/azetoai-plugin.rbxm', '[]')
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ────────────────────────────────────

-- api_keys : chaque user voit seulement ses clés
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keys"   ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);

-- Pour l'API (service role bypass RLS automatiquement)
-- Politique permettant la validation par service role
CREATE POLICY "Service role full access" ON api_keys 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- settings : lecture publique (pour récupérer plugin URL)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Service role can update settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ── Index ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_api_keys_user    ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key     ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active  ON api_keys(is_active);
