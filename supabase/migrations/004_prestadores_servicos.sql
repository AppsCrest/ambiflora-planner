-- ============================================================
-- Migração 004 — Prestadores de Serviços
-- ============================================================
-- Nova entidade "prestadores_servicos" (empresas/pessoas externas
-- que prestam serviços nas obras) + relação N-N com "sites" para
-- selecionar quais prestadores trabalham em cada obra.
-- Idempotente, seguindo o padrão da migração 003.
-- ============================================================

CREATE TABLE IF NOT EXISTS prestadores_servicos (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  pessoa_contacto text,
  contacto        text,
  regiao          text,
  notas           text,
  ativo           boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname  = 'prestadores_servicos_updated_at'
      AND tgrelid = 'prestadores_servicos'::regclass
  ) THEN
    CREATE TRIGGER prestadores_servicos_updated_at
      BEFORE UPDATE ON prestadores_servicos
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

ALTER TABLE prestadores_servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso_autenticado_prestadores_servicos" ON prestadores_servicos;
CREATE POLICY "acesso_autenticado_prestadores_servicos" ON prestadores_servicos
  FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Prestadores por Obra (relação N-N)
-- ============================================================
CREATE TABLE IF NOT EXISTS obra_prestadores (
  site_id      uuid not null references sites(id) on delete cascade,
  prestador_id uuid not null references prestadores_servicos(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (site_id, prestador_id)
);

ALTER TABLE obra_prestadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso_autenticado_obra_prestadores" ON obra_prestadores;
CREATE POLICY "acesso_autenticado_obra_prestadores" ON obra_prestadores
  FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
