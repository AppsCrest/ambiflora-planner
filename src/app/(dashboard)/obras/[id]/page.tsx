import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteForm } from '@/components/site-form'
import { ObraPrestadoresPanel } from './obra-prestadores-panel'

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: site }, { data: responsaveis }, { data: links }, { data: allPrestadores }] = await Promise.all([
    supabase.from('sites').select('*').eq('id', id).single(),
    supabase.from('responsaveis').select('id, nome, cargo').eq('ativo', true).order('nome'),
    supabase
      .from('obra_prestadores')
      .select('*, prestadores_servicos(id, nome, regiao)')
      .eq('site_id', id),
    supabase.from('prestadores_servicos').select('id, nome, regiao').eq('ativo', true).order('nome'),
  ])

  if (!site) notFound()

  const linkedPrestadorIds = new Set(links?.map(l => l.prestador_id) ?? [])
  const availablePrestadores = allPrestadores?.filter(p => !linkedPrestadorIds.has(p.id)) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Editar Obra</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Dados da Obra</h2>
          <SiteForm site={site} responsaveis={responsaveis ?? []} />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Prestadores de Serviços</h2>
          <ObraPrestadoresPanel
            siteId={id}
            links={links ?? []}
            availablePrestadores={availablePrestadores}
          />
        </div>
      </div>
    </div>
  )
}
