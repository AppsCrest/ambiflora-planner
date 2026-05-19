'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, PowerOff, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleWorkerAtivo, deleteWorker } from '@/lib/actions/workers'
import { ConfirmDeleteMenuItem } from '@/components/confirm-delete-dialog'
import type { Database } from '@/types/database'

type Worker = Database['public']['Tables']['workers']['Row']

export function WorkerActions({ worker }: { worker: Worker }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleWorkerAtivo(worker.id, worker.ativo)
    if (result.error) toast.error(result.error)
    else toast.success(worker.ativo ? 'Trabalhador desativado' : 'Trabalhador ativado')
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={loading} />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/trabalhadores/${worker.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle}>
          {worker.ativo
            ? <><PowerOff className="h-4 w-4 mr-2" />Desativar</>
            : <><Power className="h-4 w-4 mr-2" />Ativar</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmDeleteMenuItem
          description={`Apagar permanentemente o trabalhador "${worker.nome}" e removê-lo de todas as equipas?`}
          onConfirm={() => deleteWorker(worker.id)}
          successMessage="Trabalhador eliminado"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
