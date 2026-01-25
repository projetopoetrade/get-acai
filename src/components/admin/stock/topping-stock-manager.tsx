// components/admin/stock/topping-stock-manager.tsx
'use client'

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Minus, Plus, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Topping {
  id: string
  name: string
  icon?: string
  price: number | string
  stock: number | null
  available: boolean
  categoryId?: string
  category?: {
    id: string
    name: string
  }
}

interface ToppingStockManagerProps {
  toppings: Topping[]
  categories: any[]
}

export function ToppingStockManager({ toppings, categories }: ToppingStockManagerProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [stocks, setStocks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Filtrar toppings
  const filteredToppings = useMemo(() => {
    return toppings.filter((topping) => {
      const matchSearch = topping.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || topping.categoryId === categoryFilter
      const matchStock = 
        stockFilter === "all" ||
        (stockFilter === "low" && topping.stock !== null && topping.stock < 10) ||
        (stockFilter === "out" && topping.stock === 0) ||
        (stockFilter === "unlimited" && topping.stock === null)

      return matchSearch && matchCategory && matchStock
    })
  }, [toppings, search, categoryFilter, stockFilter])

  const updateStock = async (toppingId: string, newStock: string) => {
    setLoading({ ...loading, [toppingId]: true })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/toppings/${toppingId}/stock`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            stock: newStock === '' ? null : parseInt(newStock) 
          })
        }
      )

      if (response.ok) {
        toast.success('Estoque atualizado!')
        router.refresh()
      } else {
        toast.error('Erro ao atualizar estoque')
      }
    } catch (error) {
      toast.error('Erro ao atualizar estoque')
    } finally {
      setLoading({ ...loading, [toppingId]: false })
    }
  }

  const adjustStock = (toppingId: string, currentStock: number | null, amount: number) => {
    const current = currentStock === null ? 0 : currentStock
    const newValue = Math.max(0, current + amount)
    setStocks({ ...stocks, [toppingId]: newValue.toString() })
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar topping..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border border-neutral-200 dark:border-neutral-800"
          />
        </div>

        {/* Categoria */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 border border-neutral-200 dark:border-neutral-800">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status do Estoque */}
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="h-9 border border-neutral-200 dark:border-neutral-800">
            <SelectValue placeholder="Status do estoque" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="low">Estoque Baixo (&lt; 10)</SelectItem>
            <SelectItem value="out">Sem Estoque</SelectItem>
            <SelectItem value="unlimited">Ilimitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {filteredToppings.length} toppings encontrados
      </div>

      {/* Lista de Toppings */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
        {filteredToppings.map((topping) => {
          const currentStock = stocks[topping.id] !== undefined 
            ? stocks[topping.id] 
            : topping.stock?.toString() || ''
          const isLowStock = topping.stock !== null && topping.stock < 10
          const hasChanges = currentStock !== (topping.stock?.toString() || '')

          return (
            <div 
              key={topping.id} 
              className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${
                isLowStock ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {topping.icon && <span className="text-xl flex-shrink-0">{topping.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{topping.name}</p>
                      {isLowStock && (
                        <Badge variant="destructive" className="h-5 text-xs px-1.5">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Baixo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {topping.category?.name} • R$ {parseFloat(topping.price.toString()).toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Estoque atual: {topping.stock === null ? 'Ilimitado' : topping.stock}
                    </p>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustStock(topping.id, topping.stock, -1)}
                    disabled={loading[topping.id]}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <Input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setStocks({ ...stocks, [topping.id]: e.target.value })}
                    placeholder="∞"
                    className="h-8 w-20 text-center text-sm border border-neutral-200 dark:border-neutral-800"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustStock(topping.id, topping.stock, 1)}
                    disabled={loading[topping.id]}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>

                  <Button 
                    onClick={() => updateStock(topping.id, currentStock)}
                    disabled={loading[topping.id] || !hasChanges}
                    className="h-8 px-3 bg-[#9d0094] hover:bg-[#8a0080] text-white text-xs font-medium disabled:opacity-50"
                  >
                    {loading[topping.id] ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredToppings.length === 0 && (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
            <p className="text-sm">Nenhum topping encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
