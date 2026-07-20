-- ============================================================
-- Migração 006 — Prestador de Serviço como modo de alocação
-- ============================================================
-- Permite que uma alocação do calendário seja atribuída
-- diretamente a um Prestador de Serviço (tal como já acontece
-- com equipa/trabalhador), em vez de apenas ser associado como
-- prestador "extra" via assignment_prestadores.
-- Ao contrário de team_id/worker_id, NÃO há unique constraint —
-- um prestador pode estar alocado a mais do que uma obra no
-- mesmo dia/período; a duplicação é apenas assinalada como aviso
-- na interface, não bloqueada.
-- Idempotente, seguindo o padrão das migrações anteriores.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'assignments'
      AND column_name  = 'prestador_id'
  ) THEN
    ALTER TABLE assignments
      ADD COLUMN prestador_id uuid
        references prestadores_servicos(id) on delete restrict;
  END IF;
END
$$;
