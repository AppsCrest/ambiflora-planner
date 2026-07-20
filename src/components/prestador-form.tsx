'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPrestador, updatePrestador } from '@/lib/actions/prestadores'
import type { Database } from '@/types/database'

type Prestador = Database['public']['Tables']['prestadores_servicos']['Row']

export function PrestadorForm({ prestador }: { prestador?: Prestador }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = prestador
        ? await updatePrestador(prestador.id, formData)
        : await createPrestador(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(prestador ? 'Prestador atualizado' : 'Prestador criado')
        router.push('/prestadores')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" defaultValue={prestador?.nome} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pessoa_contacto">Pessoa de Contacto</Label>
          <Input id="pessoa_contacto" name="pessoa_contacto" defaultValue={prestador?.pessoa_contacto ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contacto">Contacto</Label>
          <Input id="contacto" name="contacto" placeholder="Telefone ou email" defaultValue={prestador?.contacto ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="regiao">Região</Label>
        <Input id="regiao" name="regiao" defaultValue={prestador?.regiao ?? ''} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={prestador?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : prestador ? 'Guardar Alterações' : 'Criar Prestador'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/prestadores')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
