import { CustomersReport } from "@/components/admin/reports/costumers-report"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) redirect('/login')

  try {
    // Aqui precisamos apenas dos pedidos para extrair os dados dos clientes
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })

    if (!res.ok) return []
    return res.json()
  } catch (error) {
    return []
  }
}

export default async function ClientesPage() {
  const orders = await getData()
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
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Comportamento do Cliente</h1>
              <p className="text-sm text-neutral-500">Ranking VIP e histórico de compras</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
          <CustomersReport orders={activeOrders} />
        </div>
      </div>
    </div>
  )
}