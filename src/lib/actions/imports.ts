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
  const { data: existing } = await supabase.from('workers').select('nome')
  const existingNames = new Set((existing ?? []).map(w => w.nome.toLowerCase()))
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    if (existingNames.has(row.nome.trim().toLowerCase())) continue
    const { error } = await supabase.from('workers').insert({
      nome: row.nome.trim(),
      cargo: str(row.cargo),
      telefone: str(row.telefone),
      email: str(row.email),
      data_admissao: parseDate(row.data_admissao),
      notas: str(row.notas),
    })
    if (error) errors++; else { created++; existingNames.add(row.nome.trim().toLowerCase()) }
  }
  revalidatePath('/trabalhadores')
  return { created, errors }
}

export async function bulkImportResponsaveis(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('responsaveis').select('nome')
  const existingNames = new Set((existing ?? []).map(r => r.nome.toLowerCase()))
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    if (existingNames.has(row.nome.trim().toLowerCase())) continue
    const { error } = await supabase.from('responsaveis').insert({
      nome: row.nome.trim(),
      cargo: str(row.cargo),
      telefone: str(row.telefone),
      data_admissao: parseDate(row.data_admissao),
      notas: str(row.notas),
    })
    if (error) errors++; else { created++; existingNames.add(row.nome.trim().toLowerCase()) }
  }
  revalidatePath('/responsaveis')
  return { created, errors }
}

export async function bulkImportEquipment(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('equipment').select('nome')
  const existingNames = new Set((existing ?? []).map(e => e.nome.toLowerCase()))
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    if (existingNames.has(row.nome.trim().toLowerCase())) continue
    const { error } = await supabase.from('equipment').insert({
      nome: row.nome.trim(),
      tipo: str(row.tipo),
      numero_serie: str(row.numero_serie),
      notas: str(row.notas),
    })
    if (error) errors++; else { created++; existingNames.add(row.nome.trim().toLowerCase()) }
  }
  revalidatePath('/equipamentos')
  return { created, errors }
}

export async function bulkImportPrestadores(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('prestadores_servicos').select('nome')
  const existingNames = new Set((existing ?? []).map(p => p.nome.toLowerCase()))
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    if (existingNames.has(row.nome.trim().toLowerCase())) continue
    const { error } = await supabase.from('prestadores_servicos').insert({
      nome: row.nome.trim(),
      pessoa_contacto: str(row.pessoa_contacto),
      contacto: str(row.contacto),
      regiao: str(row.regiao),
      notas: str(row.notas),
    })
    if (error) errors++; else { created++; existingNames.add(row.nome.trim().toLowerCase()) }
  }
  revalidatePath('/prestadores')
  return { created, errors }
}

const ESTADOS_VALIDOS = ['por_comecar', 'em_curso', 'concluida', 'pausada'] as const

export async function bulkImportSites(rows: Row[]): Promise<{ created: number; errors: number }> {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('sites').select('nome')
  const existingNames = new Set((existing ?? []).map(s => s.nome.toLowerCase()))
  let created = 0, errors = 0
  for (const row of rows) {
    if (!row.nome?.trim()) { errors++; continue }
    if (existingNames.has(row.nome.trim().toLowerCase())) continue
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
    if (error) errors++; else { created++; existingNames.add(row.nome.trim().toLowerCase()) }
  }
  revalidatePath('/obras')
  return { created, errors }
}
