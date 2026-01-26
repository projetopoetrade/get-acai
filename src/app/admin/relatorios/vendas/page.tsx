import { SalesOverview } from "@/components/admin/reports/sales-overview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Função para buscar dados
async function getData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) redirect('/login')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })

    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar vendas:", error)
    return []
  }
}

// 👇 O FIX ESTÁ AQUI: TEM QUE TER 'export default'
export default async function VendasPage() {
  const orders = await getData()
  
  // Filtro de segurança
  const activeOrders = orders.filter((o: any) => o.status !== 'CANCELLED')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header com Navegação */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Link href="/admin/relatorios">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 shadow-sm hover:bg-neutral-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Relatório de Vendas</h1>
              <p className="text-sm text-neutral-500">Fluxo de caixa e detalhamento financeiro</p>
            </div>
          </div>
        </div>

        {/* Componente de Gráficos e KPIs */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
          <SalesOverview orders={activeOrders} />
        </div>
        
      </div>
    </div>
  )
}