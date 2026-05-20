'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Row = Record<string, string>

function str(v: string | undefined): string | null {
  return v?.trim() || null
}

function parseDate(v: string | undefined): string | null {
  if (!v?.trim()) return null
  const s = v.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return null
}

export async function bulkImportWorkers(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    const { error } = await supabase.from('workers').insert({
      nome: row.nome.trim(),
      cargo: str(row.cargo),
      telefone: str(row.telefone),
      email: str(row.email),
      data_admissao: parseDate(row.data_admissao),
      notas: str(row.notas),
    })
    if (error) errors++; else created++
  }
  revalidatePath('/trabalhadores')
  return { created, errors }
}

export async function bulkImportResponsaveis(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    const { error } = await supabase.from('responsaveis').insert({
      nome: row.nome.trim(),
      cargo: str(row.cargo),
      telefone: str(row.telefone),
      data_admissao: parseDate(row.data_admissao),
      notas: str(row.notas),
    })
    if (error) errors++; else created++
  }
  revalidatePath('/responsaveis')
  return { created, errors }
}

export async function bulkImportEquipment(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    const { error } = await supabase.from('equipment').insert({
      nome: row.nome.trim(),
      tipo: str(row.tipo),
      numero_serie: str(row.numero_serie),
      notas: str(row.notas),
    })
    if (error) errors++; else created++
  }
  revalidatePath('/equipamentos')
  return { created, errors }
}

const ESTADOS_VALIDOS = ['por_comecar', 'em_curso', 'concluida', 'pausada'] as const

export async function bulkImportSites(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    const estadoRaw = row.estado?.trim().toLowerCase()
    const estado = (ESTADOS_VALIDOS as readonly string[]).includes(estadoRaw)
      ? (estadoRaw as typeof ESTADOS_VALIDOS[number])
      : 'por_comecar'
    const valorRaw = row.valor?.trim().replace(',', '.')
    const valor = valorRaw ? parseFloat(valorRaw) : null
    const { error } = await supabase.from('sites').insert({
      nome: row.nome.trim(),
      cliente: str(row.cliente),
      morada: str(row.morada),
      estado,
      data_inicio: parseDate(row.data_inicio),
      data_fim_prevista: parseDate(row.data_fim_prevista),
      valor: valor && !isNaN(valor) ? valor : null,
      notas: str(row.notas),
    })
    if (error) errors++; else created++
  }
  revalidatePath('/obras')
  return { created, errors }
}
