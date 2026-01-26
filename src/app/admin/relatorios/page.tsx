import { 
  BarChart3, 
  Package, 
  IceCream, 
  Users, 
  ChevronRight,
  TrendingUp,
  Wallet
} from "lucide-react"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Mantemos seus componentes de gráficos para a "Visão Rápida" abaixo dos botões
import { SalesOverview } from "@/components/admin/reports/sales-overview"
import { ProductsReport } from "@/components/admin/reports/products-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getReportsData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) redirect('/login?redirect=/admin/relatorios')

  // Fetch paralelo para performance
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

export default async function ReportsPage() {
  const { orders, products, toppings } = await getReportsData()

  // Filtro Global de Segurança (Ignora cancelados)
  const activeOrders = orders.filter((order: any) => order.status !== 'CANCELLED');

  // Configuração dos Botões de Redirecionamento
  const reportRoutes = [
    {
      title: "Vendas Detalhadas",
      description: "Fluxo de caixa, ticket médio e métodos de pagamento.",
      href: "/admin/relatorios/vendas",
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Performance de Produtos",
      description: "Itens mais vendidos e curva ABC do cardápio.",
      href: "/admin/relatorios/produtos",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Análise de Toppings",
      description: "Consumo de adicionais e previsão de reposição.",
      href: "/admin/relatorios/toppings",
      icon: IceCream,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      title: "Comportamento do Cliente",
      description: "Clientes VIPs, recorrentes e novos cadastros.",
      href: "/admin/relatorios/clientes",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Minimalista */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Central de Inteligência
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Selecione um módulo para análise aprofundada
          </p>
        </div>

        {/* ✅ NOVOS BOTÕES DE REDIRECIONAMENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportRoutes.map((route) => (
            <Link 
              key={route.href} 
              href={route.href}
              className="group relative flex flex-col justify-between p-6 bg-white dark:bg-neutral-900 rounded-[24px] border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-[#9d0094]/30 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${route.bg}`}>
                  <route.icon className={`h-6 w-6 ${route.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-[#9d0094] transition-colors">
                    {route.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {route.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-xs font-bold text-neutral-400 group-hover:text-[#9d0094] transition-colors">
                Acessar relatório <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Visão Rápida (Mantivemos as Tabs antigas como preview abaixo) */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-neutral-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Resumo Executivo</h2>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 h-auto rounded-xl inline-flex">
              <TabsTrigger value="overview" className="px-4 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="products" className="px-4 py-2 rounded-lg text-xs font-medium data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800">
                Top Produtos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
               <SalesOverview orders={activeOrders} />
            </TabsContent>
            
            <TabsContent value="products" className="mt-4">
               <ProductsReport orders={activeOrders} products={products} />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  )
}