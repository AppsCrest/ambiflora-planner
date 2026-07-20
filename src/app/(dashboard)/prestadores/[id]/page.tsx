import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrestadorForm } from '@/components/prestador-form'
import { PrestadorObrasPanel } from './prestador-obras-panel'

export default async function EditarPrestadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: prestador }, { data: links }, { data: allSites }] = await Promise.all([
    supabase.from('prestadores_servicos').select('*').eq('id', id).single(),
    supabase
      .from('obra_prestadores')
      .select('*, sites(id, nome, estado)')
      .eq('prestador_id', id),
    supabase.from('sites').select('id, nome, estado').order('nome'),
  ])

  if (!prestador) notFound()

  const linkedSiteIds = new Set(links?.map(l => l.site_id) ?? [])
  const availableSites = allSites?.filter(s => !linkedSiteIds.has(s.id)) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Editar Prestador</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Dados do Prestador</h2>
          <PrestadorForm prestador={prestador} />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Obras</h2>
          <PrestadorObrasPanel
            prestadorId={id}
            links={links ?? []}
            availableSites={availableSites}
          />
        </div>
      </div>
    </div>
  )
}
