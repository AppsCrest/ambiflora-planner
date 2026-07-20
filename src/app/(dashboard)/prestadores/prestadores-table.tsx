'use client'

import { useState } from 'react'
import { Trash2, HardHat, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { PrestadorActions } from './prestador-actions'
import { deletePrestadoresBulk } from '@/lib/actions/prestadores'

type Prestador = {
  id: string; nome: string; pessoa_contacto: string | null
  contacto: string | null; regiao: string | null; ativo: boolean
}

type AtivoFilter = 'todos' | 'ativos' | 'inativos'

export function PrestadoresTable({ prestadores }: { prestadores: Prestador[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [ativoFilter, setAtivoFilter] = useState<AtivoFilter>('todos')

  const filtered = prestadores.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || p.nome.toLowerCase().includes(q)
      || (p.pessoa_contacto ?? '').toLowerCase().includes(q)
      || (p.regiao ?? '').toLowerCase().includes(q)
    const matchAtivo = ativoFilter === 'todos' || (ativoFilter === 'ativos' ? p.ativo : !p.ativo)
    return matchSearch && matchAtivo
  })

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(p => next.delete(p.id))
      else filtered.forEach(p => next.add(p.id))
      return next
    })
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {someSelected && (
        <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-md">
          <span className="text-sm font-medium">{selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}
            className="text-slate-300 hover:text-white hover:bg-white/10 h-7 text-xs">
            Cancelar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} className="h-7 text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        description={`Apagar permanentemente ${selectedIds.size} prestador${selectedIds.size !== 1 ? 'es' : ''}? Serão removidos de todas as obras a que estão associados.`}
        onConfirm={async () => {
          const result = await deletePrestadoresBulk([...selectedIds])
          if (!result.error) setSelectedIds(new Set())
          return result
        }}
        successMessage={`${selectedIds.size} prestador${selectedIds.size !== 1 ? 'es' : ''} eliminado${selectedIds.size !== 1 ? 's' : ''}`}
      />

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome, contacto ou região..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1">
            {(['todos', 'ativos', 'inativos'] as AtivoFilter[]).map(f => (
              <button key={f} onClick={() => setAtivoFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${ativoFilter === f ? 'bg-primary text-white' : 'bg-muted text-slate-500 hover:bg-muted/80'}`}>
                {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = filtered.some(p => selectedIds.has(p.id)) && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Pessoa de Contacto</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Contacto</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Região</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <HardHat className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {prestadores.length === 0 ? 'Sem prestadores de serviços registados' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {prestadores.length === 0 ? 'Adiciona empresas ou pessoas que prestam serviços nas obras.' : 'Tenta ajustar a pesquisa ou os filtros.'}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${!p.ativo ? 'opacity-50' : ''} ${selectedIds.has(p.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(p.id)}
                    onChange={() => toggleOne(p.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{p.pessoa_contacto ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.contacto ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{p.regiao ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.ativo ? 'default' : 'secondary'}>{p.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <PrestadorActions prestador={p as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
