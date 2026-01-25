// app/admin/page.tsx
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { PendingOrdersWidget } from "@/components/admin/dashboard/pending-orders-widget"
import { LowStockAlerts } from "@/components/admin/dashboard/low-stock-alerts"
import { Skeleton } from "@/components/ui/skeleton"

// Loading fallbacks
function PendingOrdersSkeleton() {
  return (
    <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LowStockSkeleton() {
  return (
    <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Visão geral do sistema
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Vendas Hoje
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                R$ 1.234,50
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                +20.1% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Pedidos Hoje
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                23
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                +8 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Ticket Médio
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                R$ 53,67
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                +12% este mês
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Produtos Ativos
              </CardTitle>
              <div className="p-2 bg-[#9d0094]/10 rounded-lg">
                <Package className="h-5 w-5 text-[#9d0094]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                48
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                12 toppings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Widgets Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<PendingOrdersSkeleton />}>
            <PendingOrdersWidget />
          </Suspense>

          <Suspense fallback={<LowStockSkeleton />}>
            <LowStockAlerts />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
