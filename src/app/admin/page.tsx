import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardOverview } from "@/components/admin/dashboard/overview"
import { PendingOrders } from "@/components/admin/dashboard/pending-orders"
import { StockAlerts } from "@/components/admin/dashboard/stock-alerts"


async function getDashboardData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) redirect('/login?redirect=/admin')

  const [orders, products, toppings] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    }).then(r => r.ok ? r.json() : []),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    }).then(r => r.ok ? r.json() : []),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    }).then(r => r.ok ? r.json() : [])
  ])

  return { orders, products, toppings }
}

export default async function AdminDashboard() {
  const { orders, products, toppings } = await getDashboardData()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Visão geral do sistema</p>
      </div>

      {/* Seção Superior: Cards de Métricas */}
      <DashboardOverview orders={orders} products={products} toppings={toppings} />

      {/* Seção Inferior: Pendências e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingOrders orders={orders} />
        <StockAlerts products={products} toppings={toppings} />
      </div>
    </div>
  )
}