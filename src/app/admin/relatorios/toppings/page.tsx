import { ToppingsReport } from "@/components/admin/reports/toppings-report"
import { Button } from "@/components/ui/button"
import { ArrowLeft, IceCream } from "lucide-react"
import Link from "next/link"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) redirect('/login')

  try {
    const [orders, toppings] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      }).then(r => r.ok ? r.json() : []),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      }).then(r => r.ok ? r.json() : [])
    ])

    return { orders, toppings }
  } catch (error) {
    return { orders: [], toppings: [] }
  }
}

export default async function ToppingsPage() {
  const { orders, toppings } = await getData()
  const activeOrders = orders.filter((o: any) => o.status !== 'CANCELLED')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Link href="/admin/relatorios">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
              <IceCream className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Análise de Toppings</h1>
              <p className="text-sm text-neutral-500">Consumo de adicionais e preferências</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
          <ToppingsReport orders={activeOrders} toppings={toppings} />
        </div>
      </div>
    </div>
  )
}