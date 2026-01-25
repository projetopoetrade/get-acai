// app/admin/toppings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ToppingFormModal } from "@/components/admin/toppings/topping-form-modal"
import { toast } from "sonner"

async function getToppings() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Erro ao buscar toppings')
  }

  const data = await response.json()
  
  return data.map((topping: any) => ({
    ...topping,
    price: parseFloat(topping.price),
    stock: topping.stock !== null ? parseInt(topping.stock) : null
  }))
}

async function getToppingCategories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/categories`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}

export default function ToppingsPage() {
  const [toppings, setToppings] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTopping, setEditingTopping] = useState<any | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [toppingsData, categoriesData] = await Promise.all([
        getToppings(),
        getToppingCategories()
      ])
      setToppings(toppingsData)
      setCategories(categoriesData)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleNewTopping = () => {
    setEditingTopping(null)
    setIsModalOpen(true)
  }

  const handleEditTopping = (topping: any) => {
    setEditingTopping(topping)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0094] mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Toppings
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                Gerencie os toppings disponíveis
              </p>
            </div>
            <Button 
              onClick={handleNewTopping}
              className="w-full sm:w-auto h-11 px-6 bg-[#9d0094] hover:bg-[#8a0080] text-white font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Topping
            </Button>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={toppings} 
            meta={{ onEdit: handleEditTopping }}
          />
        </div>

        {/* Modal */}
        <ToppingFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTopping(null)
          }}
          onSuccess={loadData}
          toppingToEdit={editingTopping}
          categories={categories}
        />
      </div>
    </div>
  )
}
