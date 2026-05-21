'use server'

import { createClient } from '@/lib/supabase/server'
import type { RelatorioData } from './relatorios-client'

export async function gerarRelatorio(
  dataInicio: string,
  dataFim: string
): Promise<RelatorioData | { error: string }> {
  const supabase = await createClient()

  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(`
      id, data, periodo, team_id, worker_id,
      sites ( nome ),
      workers ( nome ),
      assignment_equipment ( equipment_id, equipment ( nome ) )
    `)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data')
    .order('periodo')

  if (error) return { error: error.message }

  const asgList = assignments ?? []

  // Build team_id → [worker names] map for team assignments
  const teamIds = [...new Set(asgList.filter(a => a.team_id).map(a => a.team_id!))]
  const teamMemberMap: Record<string, string[]> = {}

  if (teamIds.length > 0) {
    const { data: members } = await supabase
      .from('team_members')
      .select('team_id, workers ( nome )')
      .in('team_id', teamIds)
      .is('data_fim', null)

    for (const m of members ?? []) {
      const nome = (m.workers as { nome: string } | null)?.nome
      if (!nome) continue
      if (!teamMemberMap[m.team_id]) teamMemberMap[m.team_id] = []
      teamMemberMap[m.team_id].push(nome)
    }
  }

  const linhas = asgList.map(a => {
    let trabalhadores: string[] = []
    if (a.team_id) {
      trabalhadores = (teamMemberMap[a.team_id] ?? []).sort()
    } else if (a.worker_id) {
      const nome = (a.workers as { nome: string } | null)?.nome
      if (nome) trabalhadores = [nome]
    }

    const equipamentos = (a.assignment_equipment as { equipment: { nome: string } | null }[])
      .map(e => e.equipment?.nome)
      .filter((n): n is string => !!n)
      .sort()

    return {
      data: a.data,
      siteName: (a.sites as { nome: string } | null)?.nome ?? '?',
      periodo: a.periodo as 'manha' | 'tarde',
      trabalhadores,
      equipamentos,
    }
  })

  return { linhas }
}

export async function exportarExcel(
  dataInicio: string,
  dataFim: string
): Promise<{ buffer: number[] } | { error: string }> {
  const result = await gerarRelatorio(dataInicio, dataFim)
  if ('error' in result) return result

  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  const rows = result.linhas.map(r => ({
    'Dia': r.data.split('-').reverse().join('/'),
    'Obra': r.siteName,
    'Período': r.periodo === 'manha' ? 'Manhã' : 'Tarde',
    'Trabalhador(es)': r.trabalhadores.join(', ') || '—',
    'Equipamento(s)': r.equipamentos.join(', ') || '—',
  }))

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Relatório')

  const buf: ArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return { buffer: Array.from(new Uint8Array(buf)) }
}
