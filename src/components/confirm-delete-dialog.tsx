'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface Props {
  description?: string
  onConfirm: () => Promise<{ error?: string; success?: boolean }>
  successMessage: string
}

export function ConfirmDeleteMenuItem({ description, onConfirm, successMessage }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(successMessage)
        setOpen(false)
      }
    })
  }

  return (
    <>
      <DropdownMenuItem
        variant="destructive"
        onSelect={(e) => { e.preventDefault(); setOpen(true) }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </DropdownMenuItem>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              {description ?? 'Esta ação é irreversível e apaga todos os dados relacionados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? 'A eliminar...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
