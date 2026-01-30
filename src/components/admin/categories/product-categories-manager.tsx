'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Plus, Edit, Trash, Save, X, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  description?: string
  order?: number
  active?: boolean
}

interface ProductCategoriesManagerProps {
  categories: Category[]
}

export function ProductCategoriesManager({ categories: initialCategories }: ProductCategoriesManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [localCategories, setLocalCategories] = useState(initialCategories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const router = useRouter()

  const sortedCategories = [...localCategories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[CREATE] Iniciando criação...', formData)
    
    const createPromise = async () => {
      setIsSubmitting(true)
      
      try {
        const maxOrder = Math.max(...localCategories.map(c => c.order ?? 0), 0)
        const payload = { 
          ...formData, 
          order: maxOrder + 1,
          active: true
        }
        
        console.log('[CREATE] Payload:', payload)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(payload)
        })

        console.log('[CREATE] Response status:', response.status)

        if (!response.ok) {
          const error = await response.json()
          console.error('[CREATE] Erro:', error)
          throw new Error(error.message || 'Erro ao criar categoria')
        }

        const newCategory = await response.json()
        console.log('[CREATE] Sucesso:', newCategory)
        
        setFormData({ name: '', description: '' })
        setIsCreating(false)
        router.refresh()
        
        return newCategory
      } finally {
        setIsSubmitting(false)
      }
    }

    toast.promise(createPromise(), {
      loading: 'Criando categoria...',
      success: (data) => `Categoria "${data.name}" criada com sucesso!`,
      error: (err) => err.message || 'Erro ao criar categoria',
    })
  }

  const handleUpdate = async (id: string) => {
    console.log('[UPDATE] Iniciando atualização...', { id, formData })
    
    const updatePromise = async () => {
      setIsSubmitting(true)
      
      try {
        console.log('[UPDATE] Payload:', formData)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(formData)
        })

        console.log('[UPDATE] Response status:', response.status)

        if (!response.ok) {
          const error = await response.json()
          console.error('[UPDATE] Erro:', error)
          throw new Error(error.message || 'Erro ao atualizar categoria')
        }

        const updated = await response.json()
        console.log('[UPDATE] Sucesso:', updated)
        
        setEditingId(null)
        setFormData({ name: '', description: '' })
        router.refresh()
        
        return updated
      } finally {
        setIsSubmitting(false)
      }
    }

    toast.promise(updatePromise(), {
      loading: 'Salvando alterações...',
      success: (data) => `"${data.name}" atualizada!`,
      error: (err) => err.message || 'Erro ao atualizar',
    })
  }

  // ✅ CORRIGIDO: Método mais explícito
  const confirmDelete = async () => {
    if (!categoryToDelete) {
      console.error('[DELETE] Nenhuma categoria selecionada')
      return
    }

    console.log('[DELETE] Confirmando exclusão de:', categoryToDelete)
    
    const deletePromise = async () => {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete.id}`
      console.log('[DELETE] URL:', url)
      console.log('[DELETE] Método: DELETE')
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      console.log('[DELETE] Response status:', response.status)
      console.log('[DELETE] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let error
        try {
          error = await response.json()
        } catch {
          error = { message: `Erro HTTP ${response.status}` }
        }
        console.error('[DELETE] Erro:', error)
        throw new Error(error.message || 'Erro ao deletar categoria')
      }

      console.log('[DELETE] Sucesso')
      
      const returnData = { name: categoryToDelete.name }
      
      // Fecha dialog e limpa estado
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
      
      // Aguarda um pouco antes de refresh
      await new Promise(resolve => setTimeout(resolve, 100))
      router.refresh()
      
      return returnData
    }

    toast.promise(deletePromise(), {
      loading: 'Deletando...',
      success: (data) => `"${data.name}" deletada`,
      error: (err) => err.message || 'Erro ao deletar',
    })
  }

  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    console.log('[REORDER] Iniciando reordenação...', { categoryId, direction })
    
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sortedCategories.length) return

    const reorderPromise = async () => {
      const reordered = [...sortedCategories]
      const [movedItem] = reordered.splice(currentIndex, 1)
      reordered.splice(targetIndex, 0, movedItem)
      
      console.log('[REORDER] Nova ordem:', reordered.map((c, i) => ({ 
        name: c.name, 
        oldOrder: c.order, 
        newOrder: i 
      })))
      
      const updates = reordered.map((cat, index) => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${cat.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ order: index })
        })
      )

      const results = await Promise.all(updates)
      console.log('[REORDER] Resultados:', results.map(r => r.status))
      
      if (!results.every(r => r.ok)) {
        const errors = await Promise.all(
          results.map(async (r, i) => {
            if (!r.ok) {
              const err = await r.json()
              return { category: reordered[i].name, error: err }
            }
            return null
          })
        )
        console.error('[REORDER] Erros:', errors.filter(e => e !== null))
        throw new Error('Erro ao atualizar ordem')
      }

      const newCategories = reordered.map((cat, index) => ({
        ...cat,
        order: index
      }))
      
      console.log('[REORDER] Estado local atualizado')
      setLocalCategories(newCategories)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      router.refresh()
      
      return { name: sortedCategories[currentIndex].name, direction }
    }

    toast.promise(reorderPromise(), {
      loading: 'Reordenando...',
      success: (data) => {
        const arrow = data.direction === 'up' ? '↑' : '↓'
        return `${arrow} "${data.name}" movida`
      },
      error: 'Erro ao reordenar',
    })
  }

  const openDeleteDialog = (id: string, name: string) => {
    console.log('[DELETE DIALOG] Abrindo para:', { id, name })
    setCategoryToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    console.log('[DELETE DIALOG] Fechando')
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const startEdit = (category: Category) => {
    console.log('[EDIT] Iniciando edição:', category)
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
  }

  const cancelEdit = () => {
    console.log('[EDIT] Cancelando edição')
    setEditingId(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categorias de Produtos</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
            Organize seus produtos em categorias • Use ↑↓ para reordenar
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            disabled={isSubmitting}
            className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Açaís"
                required
                disabled={isSubmitting}
                className="h-9 border border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deliciosos açaís..."
                disabled={isSubmitting}
                className="h-9 border border-neutral-200 dark:border-neutral-800"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Criar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setIsCreating(false)
                setFormData({ name: '', description: '' })
              }}
              className="h-9 px-4 border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
        {sortedCategories.map((category, index) => (
          <div key={category.id} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            {editingId === category.id ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className="h-9 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                    className="h-9 border border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <div className="flex gap-2 md:col-span-2 mt-1">
                  <Button
                    onClick={() => handleUpdate(category.id)}
                    disabled={isSubmitting}
                    className="h-9 px-4 bg-[#9d0094] hover:bg-[#8a0080] text-white text-sm font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={isSubmitting}
                    className="h-9 px-4 border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleReorder(category.id, 'up')}
                    disabled={index === 0 || isSubmitting}
                    className="h-5 w-5 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleReorder(category.id, 'down')}
                    disabled={index === sortedCategories.length - 1 || isSubmitting}
                    className="h-5 w-5 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400 dark:text-neutral-600 min-w-[2ch]">
                      {category.order ?? '–'}
                    </span>
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                      {category.name}
                    </p>
                  </div>
                  {category.description && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate pl-8">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(category)}
                    disabled={isSubmitting}
                    className="h-8 w-8 text-[#9d0094] hover:text-[#8a0080] hover:bg-[#9d0094]/10"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openDeleteDialog(category.id, category.name)}
                    disabled={isSubmitting}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {sortedCategories.length === 0 && !isCreating && (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Package className="mx-auto h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">Nenhuma categoria de produto criada</p>
          </div>
        )}
      </div>

      {/* ✅ Dialog de confirmação com onClick explícito */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 z-[9999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Deletar categoria?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-600 dark:text-neutral-400">
              Tem certeza que deseja deletar <strong className="text-neutral-900 dark:text-neutral-100">"{categoryToDelete?.name}"</strong>?{' '}
              Produtos desta categoria não serão deletados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={closeDeleteDialog}
              className="border-neutral-300 dark:border-neutral-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // ✅ Previne comportamento default
                console.log('[DELETE DIALOG] Botão Deletar clicado')
                confirmDelete()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
