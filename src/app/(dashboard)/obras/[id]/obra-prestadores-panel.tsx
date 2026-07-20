'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { addObraPrestador, removeObraPrestador } from '@/lib/actions/obra-prestadores'

interface Link_ {
  site_id: string
  prestador_id: string
  prestadores_servicos: { id: string; nome: string; regiao: string | null } | null
}

interface Prestador {
  id: string
  nome: string
  regiao: string | null
}

interface Props {
  siteId: string
  links: Link_[]
  availablePrestadores: Prestador[]
}

export function ObraPrestadoresPanel({ siteId, links, availablePrestadores }: Props) {
  const [selectedPrestadorId, setSelectedPrestadorId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [removeTarget, setRemoveTarget] = useState<{ prestadorId: string; nome: string } | null>(null)

  function handleAdd() {
    if (!selectedPrestadorId) return
    startTransition(async () => {
      const result = await addObraPrestador(siteId, selectedPrestadorId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Prestador associado à obra')
        setSelectedPrestadorId('')
      }
    })
  }

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum prestador associado a esta obra.</p>
      ) : (
        <ul className="divide-y">
          {links.map((l) => (
            <li key={l.prestador_id} className="flex items-center justify-between py-2">
              <div>
                <Link href={`/prestadores/${l.prestador_id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                  {l.prestadores_servicos?.nome}
                </Link>
                {l.prestadores_servicos?.regiao && (
                  <p className="text-xs text-gray-500">{l.prestadores_servicos.regiao}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => setRemoveTarget({ prestadorId: l.prestador_id, nome: l.prestadores_servicos?.nome ?? '' })}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {availablePrestadores.length > 0 && (
        <div className="flex gap-2 pt-2 border-t">
          <Select value={selectedPrestadorId} onValueChange={(v) => setSelectedPrestadorId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <span className={`flex flex-1 text-left text-sm ${!selectedPrestadorId ? 'text-muted-foreground' : ''}`}>
                {selectedPrestadorId
                  ? (availablePrestadores.find(p => p.id === selectedPrestadorId)?.nome ?? '—')
                  : 'Adicionar prestador...'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {availablePrestadores.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}{p.regiao ? ` (${p.regiao})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedPrestadorId || isPending} size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null) }}
        description={`Remover "${removeTarget?.nome}" desta obra?`}
        onConfirm={() => removeObraPrestador(siteId, removeTarget!.prestadorId)}
        successMessage="Prestador removido da obra"
      />
    </div>
  )
}
