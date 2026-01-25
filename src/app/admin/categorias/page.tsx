// app/admin/categorias/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCategoriesManager } from "@/components/admin/categories/product-categories-manager"
import { ToppingCategoriesManager } from "@/components/admin/categories/topping-categories-manager"
import { ToppingLimitsManager } from "@/components/admin/categories/topping-limits-manager"
import { Package, Cookie, Layers } from "lucide-react"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getCategoriesData() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login?redirect=/admin/categorias')
  }

  const [productCategories, toppingCategories, sizeToppingLimits] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' 
    })
      .then(r => r.ok ? r.json() : []),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/categories`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' 
    })
      .then(r => r.ok ? r.json() : []),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/size-topping-limits`, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' 
    })
      .then(r => r.ok ? r.json() : [])
  ])

  return { productCategories, toppingCategories, sizeToppingLimits }
}

export default async function CategoriesPage() {
  const { productCategories, toppingCategories, sizeToppingLimits } = await getCategoriesData()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Categorias e Configurações
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
            Gerencie categorias de produtos, toppings e limites
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 p-1">
            <TabsTrigger 
              value="products" 
              className="relative data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:font-semibold"
            >
              <Package className="mr-2 h-4 w-4" />
              Produtos ({productCategories.length})
            </TabsTrigger>
            <TabsTrigger 
              value="toppings" 
              className="relative data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:font-semibold"
            >
              <Cookie className="mr-2 h-4 w-4" />
              Toppings ({toppingCategories.length})
            </TabsTrigger>
            <TabsTrigger 
              value="limits" 
              className="relative data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:font-semibold"
            >
              <Layers className="mr-2 h-4 w-4" />
              Limites de Toppings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
              <ProductCategoriesManager categories={productCategories} />
            </div>
          </TabsContent>

          <TabsContent value="toppings" className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
              <ToppingCategoriesManager categories={toppingCategories} />
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
              <ToppingLimitsManager 
                toppingCategories={toppingCategories} 
                sizeToppingLimits={sizeToppingLimits}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
