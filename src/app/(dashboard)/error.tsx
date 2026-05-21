'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Algo correu mal</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ocorreu um erro inesperado. Podes tentar novamente ou recarregar a página.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recarregar página
        </Button>
      </div>
    </div>
  )
}
