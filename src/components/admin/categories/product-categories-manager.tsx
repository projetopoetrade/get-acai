// components/admin/categories/product-categories-manager.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash, Save, X, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
}

interface ProductCategoriesManagerProps {
  categories: Category[]
}

export function ProductCategoriesManager({ categories }: ProductCategoriesManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' })
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Categoria criada!')
        setFormData({ name: '', description: '', icon: '' })
        setIsCreating(false)
        router.refresh()
      } else {
        toast.error('Erro ao criar categoria')
      }
    } catch (error) {
      toast.error('Erro ao criar categoria')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Categoria atualizada!')
        setEditingId(null)
        setFormData({ name: '', description: '', icon: '' })
        router.refresh()
      } else {
        toast.error('Erro ao atualizar categoria')
      }
    } catch (error) {
      toast.error('Erro ao atualizar categoria')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast.success(`Categoria ${name} deletada`)
        router.refresh()
      } else {
        toast.error('Erro ao deletar categoria')
      }
    } catch (error) {
      toast.error('Erro ao deletar categoria')
    }
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', icon: '' })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categorias de Produtos</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">Organize seus produtos em categorias</p>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        )}
      </div>

      {/* Formulário de criação */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Açaís"
                required
                className="h-9 border border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deliciosos açaís..."
                className="h-9 border border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Ícone (Emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🍦"
                className="h-9 border border-neutral-200 dark:border-neutral-800"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button 
              type="submit"
              className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              Criar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsCreating(false)
                setFormData({ name: '', description: '', icon: '' })
              }}
              className="h-9 px-4 border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de categorias */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
        {categories.map((category) => (
          <div key={category.id} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            {editingId === category.id ? (
              // Modo edição
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-9 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Ícone</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="h-9 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <div className="flex gap-2 md:col-span-3 mt-1">
                  <Button 
                    onClick={() => handleUpdate(category.id)}
                    className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
                  >
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={cancelEdit}
                    className="h-9 px-4 border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualização
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <span className="text-xl">{category.icon}</span>
                  )}
                  <div>
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{category.name}</p>
                    {category.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(category)}
                    className="h-8 w-8 text-[#9d0094] hover:text-[#8a0080] hover:bg-[#9d0094]/10"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-900 dark:text-neutral-100">Deletar categoria?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                          Tem certeza que deseja deletar "{category.name}"? 
                          Produtos desta categoria não serão deletados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-2 border-neutral-300 dark:border-neutral-700">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id, category.name)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && !isCreating && (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Package className="mx-auto h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">Nenhuma categoria de produto criada</p>
          </div>
        )}
      </div>
    </div>
  )
}
