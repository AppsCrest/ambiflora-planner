import { PrestadorForm } from '@/components/prestador-form'

export default function NovoPrestadorPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo Prestador</h1>
      <div className="bg-white rounded-lg border p-6">
        <PrestadorForm />
      </div>
    </div>
  )
}
