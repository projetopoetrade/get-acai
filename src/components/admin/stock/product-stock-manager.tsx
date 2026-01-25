// components/admin/stock/product-stock-manager.tsx
'use client'

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Minus, Plus, AlertTriangle, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  imageUrl?: string
  stock: number | null
  available: boolean
  category?: {
    id: string
    name: string
  }
}

interface ProductStockManagerProps {
  products: Product[]
  categories: any[]
}

export function ProductStockManager({ products, categories }: ProductStockManagerProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [stocks, setStocks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === "all" || product.category?.id === categoryFilter
      const matchStock = 
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock !== null && product.stock < 10) ||
        (stockFilter === "out" && product.stock === 0) ||
        (stockFilter === "unlimited" && product.stock === null)

      return matchSearch && matchCategory && matchStock
    })
  }, [products, search, categoryFilter, stockFilter])

  const updateStock = async (productId: string, newStock: string) => {
    setLoading({ ...loading, [productId]: true })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/stock`,
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
      setLoading({ ...loading, [productId]: false })
    }
  }

  const adjustStock = (productId: string, currentStock: number | null, amount: number) => {
    const current = currentStock === null ? 0 : currentStock
    const newValue = Math.max(0, current + amount)
    setStocks({ ...stocks, [productId]: newValue.toString() })
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar produto..."
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
                {category.name}
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
        {filteredProducts.length} produtos encontrados
      </div>

      {/* Lista de Produtos */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
        {filteredProducts.map((product) => {
          const currentStock = stocks[product.id] !== undefined 
            ? stocks[product.id] 
            : product.stock?.toString() || ''
          const isLowStock = product.stock !== null && product.stock < 10
          const hasChanges = currentStock !== (product.stock?.toString() || '')

          return (
            <div 
              key={product.id} 
              className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors ${
                isLowStock ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Imagem */}
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{product.name}</p>
                      {isLowStock && (
                        <Badge variant="destructive" className="h-5 text-xs px-1.5">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Baixo
                        </Badge>
                      )}
                      {!product.available && (
                        <Badge variant="secondary" className="h-5 text-xs">Indisponível</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span>{product.category?.name}</span>
                      <span>•</span>
                      <span>
                        Estoque: {product.stock === null ? 'Ilimitado' : product.stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStock(product.id, product.stock, -1)}
                    disabled={loading[product.id]}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <Input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setStocks({ ...stocks, [product.id]: e.target.value })}
                    placeholder="∞"
                    className="w-20 h-8 text-center text-sm border border-neutral-200 dark:border-neutral-800"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustStock(product.id, product.stock, 1)}
                    disabled={loading[product.id]}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>

                  <Button 
                    onClick={() => updateStock(product.id, currentStock)}
                    disabled={loading[product.id] || !hasChanges}
                    className="h-8 px-3 bg-[#9d0094] hover:bg-[#8a0080] text-white text-xs font-medium disabled:opacity-50"
                  >
                    {loading[product.id] ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
            <Package className="mx-auto h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
