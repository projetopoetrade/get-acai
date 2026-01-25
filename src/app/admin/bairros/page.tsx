// app/admin/bairros/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Clock } from "lucide-react"
import { NeighborhoodList } from "@/components/admin/neighborhoods/neighborhood-list"
import { CreateNeighborhoodDialog } from "@/components/admin/neighborhoods/create-neighborhood-dialog"
import { BulkImportDialog } from "@/components/admin/neighborhoods/bulk-import-dialog"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getNeighborhoods() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login?redirect=/admin/bairros')
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/neighborhoods`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirect('/login?redirect=/admin/bairros')
    }
    const error = await response.text()
    console.error('Erro ao buscar bairros:', error)
    return []
  }

  return response.json()
}

export default async function NeighborhoodsPage() {
  const neighborhoods = await getNeighborhoods()

  const activeCount = neighborhoods.filter((n: any) => n.active).length
  const averageFee = neighborhoods.length > 0 
    ? neighborhoods.reduce((acc: number, n: any) => acc + parseFloat(n.customDeliveryFee || 0), 0) / neighborhoods.length 
    : 0

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Gerenciar Bairros
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                Configure bairros e taxas de entrega
              </p>
            </div>
            <div className="flex gap-2">
              <BulkImportDialog />
              <CreateNeighborhoodDialog />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6 sm:mb-8">
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Total de Bairros
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <MapPin className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {neighborhoods.length}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                {activeCount} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Taxa Média
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                R$ {averageFee.toFixed(2)}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Taxa de entrega média
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Tempo Médio
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <Clock className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                30-40 min
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Estimativa de entrega
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Bairros */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
          <NeighborhoodList neighborhoods={neighborhoods} />
        </div>
      </div>
    </div>
  )
}
