'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const prestadorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  pessoa_contacto: z.string().optional(),
  contacto: z.string().optional(),
  regiao: z.string().optional(),
  notas: z.string().optional(),
})

export async function createPrestador(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = prestadorSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    pessoa_contacto: parsed.data.pessoa_contacto || null,
    contacto: parsed.data.contacto || null,
    regiao: parsed.data.regiao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('prestadores_servicos').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/prestadores')
  return { success: true }
}

export async function updatePrestador(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = prestadorSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    pessoa_contacto: parsed.data.pessoa_contacto || null,
    contacto: parsed.data.contacto || null,
    regiao: parsed.data.regiao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('prestadores_servicos').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/prestadores')
  return { success: true }
}

export async function togglePrestadorAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('prestadores_servicos').update({ ativo: !ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/prestadores')
  return { success: true }
}

export async function deletePrestador(id: string) {
  const supabase = await createClient()
  await supabase.from('obra_prestadores').delete().eq('prestador_id', id)
  const { data: prestadorAssignments } = await supabase.from('assignments').select('id').eq('prestador_id', id)
  if (prestadorAssignments && prestadorAssignments.length > 0) {
    const aIds = prestadorAssignments.map(a => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', aIds)
    await supabase.from('assignments').delete().in('id', aIds)
  }
  const { error } = await supabase.from('prestadores_servicos').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/prestadores')
  return { success: true }
}

export async function deletePrestadoresBulk(ids: string[]) {
  if (ids.length === 0) return { success: true }
  const supabase = await createClient()
  await supabase.from('obra_prestadores').delete().in('prestador_id', ids)
  const { data: prestadorAssignments } = await supabase.from('assignments').select('id').in('prestador_id', ids)
  if (prestadorAssignments && prestadorAssignments.length > 0) {
    const aIds = prestadorAssignments.map(a => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', aIds)
    await supabase.from('assignments').delete().in('id', aIds)
  }
  const { error } = await supabase.from('prestadores_servicos').delete().in('id', ids)
  if (error) return { error: error.message }
  revalidatePath('/prestadores')
  return { success: true }
}
