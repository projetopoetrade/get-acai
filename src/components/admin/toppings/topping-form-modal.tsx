// components/admin/toppings/topping-form-modal.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const toppingSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres").max(500),
  price: z.string().min(1, "Preço é obrigatório"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  order: z.string().optional().or(z.literal('')),
})

type ToppingFormData = z.infer<typeof toppingSchema>

interface ToppingFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  toppingToEdit?: any | null
  categories: any[]
}

export function ToppingFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  toppingToEdit, 
  categories 
}: ToppingFormModalProps) {
  const [saving, setSaving] = useState(false)

  const form = useForm<ToppingFormData>({
    resolver: zodResolver(toppingSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      imageUrl: '',
      categoryId: '',
      order: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (toppingToEdit) {
        // Modo edição
        form.reset({
          name: toppingToEdit.name || '',
          description: toppingToEdit.description || '',
          price: toppingToEdit.price?.toString() || '0',
          imageUrl: toppingToEdit.imageUrl || '',
          categoryId: toppingToEdit.categoryId || toppingToEdit.category?.id || '',
          order: toppingToEdit.order?.toString() || '',
        })
      } else {
        // Modo criação
        form.reset({
          name: '',
          description: '',
          price: '0',
          imageUrl: '',
          categoryId: categories[0]?.id || '',
          order: '',
        })
      }
    }
  }, [isOpen, toppingToEdit, form, categories])

  const onSubmit = async (data: ToppingFormData) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        toast.error('Token de autenticação não encontrado')
        return
      }

      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl || undefined,
        categoryId: data.categoryId,
        order: data.order ? parseInt(data.order) : undefined,
        available: toppingToEdit?.available ?? true,
        isFree: toppingToEdit?.isFree || false,
        isPopular: toppingToEdit?.isPopular || false,
        isPremium: toppingToEdit?.isPremium || false,
        calories: toppingToEdit?.calories ? parseInt(toppingToEdit.calories) : undefined,
      }

      const url = toppingToEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/toppings/admin/${toppingToEdit.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/toppings/admin`

      const response = await fetch(url, {
        method: toppingToEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao salvar topping' }))
        throw new Error(error.message || 'Erro ao salvar topping')
      }

      toast.success(toppingToEdit ? 'Topping atualizado com sucesso!' : 'Topping criado com sucesso!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar topping')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {toppingToEdit ? 'Editar Topping' : 'Novo Topping'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Nome *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Morango" 
                            className="h-11 text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Categoria *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094] w-full">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 z-50">
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id}
                                className="text-base py-3 hover:bg-[#9d0094]/10 focus:bg-[#9d0094]/10 cursor-pointer"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        Descrição *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Morango fresco e docinho"
                          className="min-h-[80px] text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        URL da Imagem
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://..." 
                          className="h-11 text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preço e Ordem */}
              <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Preço (R$) *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="2.00" 
                            className="h-11 text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Ordem de Exibição
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            className="h-11 text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                          Define a ordem de exibição na lista
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="h-12 px-6 bg-[#9d0094] hover:bg-[#8a0080] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {toppingToEdit ? 'Atualizar' : 'Criar Topping'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
