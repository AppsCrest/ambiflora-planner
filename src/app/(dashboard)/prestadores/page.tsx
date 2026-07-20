import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportPrestadores } from '@/lib/actions/imports'
import { PrestadoresTable } from './prestadores-table'

export default async function PrestadoresPage() {
  const supabase = await createClient()
  const { data: prestadores } = await supabase
    .from('prestadores_servicos')
    .select('*')
    .order('nome', { ascending: true })

  const ativos = prestadores?.filter(p => p.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prestadores de Serviços</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativos} ativo{ativos !== 1 ? 's' : ''} · {prestadores?.length ?? 0} no total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton
            action={bulkImportPrestadores}
            entityName="prestador"
            templateHeaders={['nome', 'pessoa_contacto', 'contacto', 'regiao', 'notas']}
            sampleRow={['Jardins & Cia, Lda', 'João Silva', '912345678', 'Lisboa', '']}
            templateFilename="modelo_prestadores.csv"
          />
          <Button nativeButton={false} render={<Link href="/prestadores/novo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Prestador
          </Button>
        </div>
      </div>

      <PrestadoresTable prestadores={prestadores ?? []} />
    </div>
  )
}
