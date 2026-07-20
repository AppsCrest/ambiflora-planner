'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MapPin, Trash2 } from 'lucide-react'
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

const ESTADO_LABELS: Record<string, string> = {
  por_comecar: 'Por Começar',
  em_curso: 'Em Curso',
  pausada: 'Em Pausa',
  concluida: 'Concluída',
}

interface Link_ {
  site_id: string
  prestador_id: string
  sites: { id: string; nome: string; estado: string } | null
}

interface Site {
  id: string
  nome: string
  estado: string
}

interface Props {
  prestadorId: string
  links: Link_[]
  availableSites: Site[]
}

export function PrestadorObrasPanel({ prestadorId, links, availableSites }: Props) {
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [removeTarget, setRemoveTarget] = useState<{ siteId: string; nome: string } | null>(null)

  function handleAdd() {
    if (!selectedSiteId) return
    startTransition(async () => {
      const result = await addObraPrestador(selectedSiteId, prestadorId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Obra associada ao prestador')
        setSelectedSiteId('')
      }
    })
  }

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhuma obra associada.</p>
      ) : (
        <ul className="divide-y">
          {links.map((l) => (
            <li key={l.site_id} className="flex items-center justify-between py-2">
              <div>
                <Link href={`/obras/${l.site_id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                  {l.sites?.nome}
                </Link>
                {l.sites?.estado && (
                  <p className="text-xs text-gray-500">{ESTADO_LABELS[l.sites.estado] ?? l.sites.estado}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => setRemoveTarget({ siteId: l.site_id, nome: l.sites?.nome ?? '' })}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {availableSites.length > 0 && (
        <div className="flex gap-2 pt-2 border-t">
          <Select value={selectedSiteId} onValueChange={(v) => setSelectedSiteId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <span className={`flex flex-1 text-left text-sm ${!selectedSiteId ? 'text-muted-foreground' : ''}`}>
                {selectedSiteId
                  ? (availableSites.find(s => s.id === selectedSiteId)?.nome ?? '—')
                  : 'Adicionar obra...'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {availableSites.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedSiteId || isPending} size="icon">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null) }}
        description={`Remover a obra "${removeTarget?.nome}" deste prestador?`}
        onConfirm={() => removeObraPrestador(removeTarget!.siteId, prestadorId)}
        successMessage="Obra removida do prestador"
      />
    </div>
  )
}
