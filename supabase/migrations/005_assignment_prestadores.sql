-- ============================================================
-- Migração 005 — Prestadores de Serviços por Alocação
-- ============================================================
-- Permite associar prestadores de serviços a uma alocação
-- específica do calendário (dia + período + obra), tal como já
-- acontece com equipamentos em assignment_equipment.
-- Ao contrário do equipamento, um prestador não fica "reservado"
-- em exclusivo — pode plausivelmente trabalhar em mais do que uma
-- obra no mesmo dia — pelo que não há trigger de conflito, à
-- semelhança de obra_prestadores.
-- Idempotente, seguindo o padrão das migrações 003/004.
-- ============================================================

CREATE TABLE IF NOT EXISTS assignment_prestadores (
  assignment_id uuid not null references assignments(id) on delete cascade,
  prestador_id  uuid not null references prestadores_servicos(id) on delete restrict,
  created_at    timestamptz not null default now(),
  primary key (assignment_id, prestador_id)
);

ALTER TABLE assignment_prestadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso_autenticado_assignment_prestadores" ON assignment_prestadores;
CREATE POLICY "acesso_autenticado_assignment_prestadores" ON assignment_prestadores
  FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
