// components/admin/categories/topping-limits-manager.tsx
'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Layers, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface ToppingCategory {
  id: string
  name: string
  description?: string
  icon?: string
}

interface SizeToppingLimit {
  id?: string
  size: string
  category: string
  limit: number
}

interface ToppingLimitsManagerProps {
  toppingCategories: ToppingCategory[]
  sizeToppingLimits: SizeToppingLimit[]
}

const SIZES = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
]

export function ToppingLimitsManager({ toppingCategories, sizeToppingLimits: initialLimits }: ToppingLimitsManagerProps) {
  const [selectedSize, setSelectedSize] = useState<string>('pequeno')
  const [limits, setLimits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // Inicializar limites a partir dos dados do servidor
  useEffect(() => {
    const limitsMap: Record<string, string> = {}
    initialLimits.forEach(limit => {
      if (limit.size === selectedSize) {
        limitsMap[limit.category] = limit.limit.toString()
      }
    })
    setLimits(limitsMap)
  }, [selectedSize, initialLimits])

  const getCurrentLimit = (categoryId: string) => {
    if (limits[categoryId] !== undefined) {
      return limits[categoryId]
    }
    const existing = initialLimits.find(
      l => l.size === selectedSize && l.category === categoryId
    )
    return existing ? existing.limit.toString() : '0'
  }

  const hasChanges = (categoryId: string) => {
    const current = getCurrentLimit(categoryId)
    const existing = initialLimits.find(
      l => l.size === selectedSize && l.category === categoryId
    )
    const existingValue = existing ? existing.limit.toString() : '0'
    return current !== existingValue
  }

  const handleUpdate = async (categoryId: string) => {
    const limitValue = limits[categoryId] || getCurrentLimit(categoryId)
    const limitNumber = parseInt(limitValue) || 0

    setLoading({ ...loading, [categoryId]: true })

    try {
      const existing = initialLimits.find(
        l => l.size === selectedSize && l.category === categoryId
      )

      const url = existing?.id
        ? `${process.env.NEXT_PUBLIC_API_URL}/size-topping-limits/${existing.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/size-topping-limits`

      const method = existing?.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          size: selectedSize,
          category: categoryId,
          limit: limitNumber,
          ...(existing?.id && { id: existing.id })
        })
      })

      if (response.ok) {
        toast.success('Limite atualizado!')
        router.refresh()
      } else {
        const error = await response.text()
        console.error('Erro ao atualizar limite:', error)
        toast.error('Erro ao atualizar limite')
      }
    } catch (error) {
      console.error('Erro ao atualizar limite:', error)
      toast.error('Erro ao atualizar limite')
    } finally {
      setLoading({ ...loading, [categoryId]: false })
    }
  }

  const updateLimit = (categoryId: string, value: string) => {
    setLimits({
      ...limits,
      [categoryId]: value
    })
  }

  return (
    <div className="space-y-4">
      {/* Informação */}
      <Alert className="border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Como funciona</AlertTitle>
        <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
          Configure o limite máximo de toppings por categoria para cada tamanho de produto.
          Por exemplo: "Pequeno pode ter até 3 frutas, Médio pode ter até 5 frutas".
        </AlertDescription>
      </Alert>

      {/* Seleção de Tamanho */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Selecionar Tamanho</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Escolha o tamanho para configurar os limites de categorias de toppings
          </p>
        </div>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="w-[200px] h-9 border border-neutral-200 dark:border-neutral-800">
            <SelectValue placeholder="Selecione o tamanho" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Limites por Categoria - {SIZES.find(s => s.value === selectedSize)?.label}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Configure o limite máximo de toppings para cada categoria
          </p>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
          {toppingCategories.map((category) => {
            const currentLimit = getCurrentLimit(category.id)
            const hasChange = hasChanges(category.id)
            const isLoading = loading[category.id]

            return (
              <div 
                key={category.id} 
                className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {category.icon && (
                      <span className="text-xl flex-shrink-0">{category.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24">
                      <Label htmlFor={`limit-${category.id}`} className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Limite
                      </Label>
                      <Input
                        id={`limit-${category.id}`}
                        type="number"
                        min="0"
                        value={currentLimit}
                        onChange={(e) => updateLimit(category.id, e.target.value)}
                        placeholder="0"
                        className="h-8 text-sm border border-neutral-200 dark:border-neutral-800 mt-1"
                      />
                    </div>

                    <div className="pt-5">
                      <Button
                        onClick={() => handleUpdate(category.id)}
                        disabled={isLoading || !hasChange}
                        className="h-8 px-3 bg-[#9d0094] hover:bg-[#8a0080] text-white text-xs font-medium disabled:opacity-50"
                      >
                        {isLoading ? (
                          'Salvando...'
                        ) : hasChange ? (
                          <>
                            <Save className="mr-1.5 h-3.5 w-3.5" />
                            Salvar
                          </>
                        ) : (
                          'Sem alterações'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {toppingCategories.length === 0 && (
            <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
              <Layers className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p className="text-sm">Nenhuma categoria de topping encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
