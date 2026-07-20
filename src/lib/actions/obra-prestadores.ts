'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addObraPrestador(siteId: string, prestadorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('obra_prestadores').insert({
    site_id: siteId,
    prestador_id: prestadorId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/obras/${siteId}`)
  revalidatePath(`/prestadores/${prestadorId}`)
  return { success: true }
}

export async function removeObraPrestador(siteId: string, prestadorId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('obra_prestadores')
    .delete()
    .eq('site_id', siteId)
    .eq('prestador_id', prestadorId)
  if (error) return { error: error.message }
  revalidatePath(`/obras/${siteId}`)
  revalidatePath(`/prestadores/${prestadorId}`)
  return { success: true }
}
