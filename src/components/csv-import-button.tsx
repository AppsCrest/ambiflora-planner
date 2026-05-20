'use client'

import { useRef, useTransition } from 'react'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  // Normalize headers: lowercase, remove accents, replace non-alphanumeric with _
  const headers = lines[0].split(',').map(h =>
    h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '_')
  )
  return lines.slice(1)
    .map(line => {
      const values = parseCSVLine(line)
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim() })
      return obj
    })
    .filter(row => Object.values(row).some(v => v))
}

interface Props {
  action: (rows: Record<string, string>[]) => Promise<{ created: number; errors: number }>
  entityName: string
  templateHeaders: string[]
  sampleRow: string[]
  templateFilename: string
}

export function CsvImportButton({ action, entityName, templateHeaders, sampleRow, templateFilename }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCSV(text)
      if (rows.length === 0) {
        toast.error('CSV vazio ou formato inválido')
        return
      }
      startTransition(async () => {
        const { created, errors } = await action(rows)
        if (created > 0) {
          toast.success(
            `${created} ${entityName} importado${created !== 1 ? 's' : ''}` +
            (errors > 0 ? ` · ${errors} linha${errors !== 1 ? 's' : ''} ignorada${errors !== 1 ? 's' : ''}` : '')
          )
        } else {
          toast.error(
            `Nenhum ${entityName} importado` +
            (errors > 0 ? ` — ${errors} linha${errors !== 1 ? 's' : ''} com erro` : '')
          )
        }
      })
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  function downloadTemplate() {
    const csvContent = [templateHeaders.join(','), sampleRow.join(',')].join('\r\n')
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = templateFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-1.5">
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-1.5" />
        {isPending ? 'A importar...' : 'Importar CSV'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={downloadTemplate}
        title="Descarregar modelo CSV"
        className="text-muted-foreground hover:text-foreground px-2"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}
