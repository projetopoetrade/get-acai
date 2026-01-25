// app/admin/relatorios/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesOverview } from "@/components/admin/reports/sales-overview"
import { ProductsReport } from "@/components/admin/reports/products-report"
import { ToppingsReport } from "@/components/admin/reports/toppings-report"
import { CustomersReport } from "@/components/admin/reports/costumers-report"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getReportsData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login?redirect=/admin/relatorios')
  }

  const [orders, products, toppings] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            redirect('/login?redirect=/admin/relatorios')
          }
          return []
        }
        return r.json()
      }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            redirect('/login?redirect=/admin/relatorios')
          }
          return []
        }
        return r.json()
      }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            redirect('/login?redirect=/admin/relatorios')
          }
          return []
        }
        return r.json()
      })
  ])

  return { orders, products, toppings }
}

export default async function ReportsPage() {
  const { orders, products, toppings } = await getReportsData()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Relatórios e Analytics</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Análise detalhada do seu negócio
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl">
            <TabsTrigger 
              value="sales"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
            >
              Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
            >
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="toppings"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
            >
              Toppings
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium"
            >
              Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4 mt-6">
            <SalesOverview orders={orders} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-6">
            <ProductsReport orders={orders} products={products} />
          </TabsContent>

          <TabsContent value="toppings" className="space-y-4 mt-6">
            <ToppingsReport orders={orders} toppings={toppings} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-4 mt-6">
            <CustomersReport orders={orders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
