// components/admin/toppings/topping-form.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const toppingSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres").max(500),
  price: z.string().min(1, "Preço é obrigatório"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  available: z.boolean(),
  isFree: z.boolean(),
  isPopular: z.boolean(),
  isPremium: z.boolean(),
  order: z.string().optional().or(z.literal('')),
  calories: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, "Categoria é obrigatória")
})

type ToppingFormValues = z.infer<typeof toppingSchema>

interface ToppingFormProps {
  topping?: any
  categories: any[]
}

export function ToppingForm({ topping, categories }: ToppingFormProps) {
  const router = useRouter()
  const isEditing = !!topping

  const form = useForm<ToppingFormValues>({
    resolver: zodResolver(toppingSchema),
    defaultValues: {
      name: topping?.name || "",
      description: topping?.description || "",
      price: topping?.price?.toString() || "0",
      imageUrl: topping?.imageUrl || "",
      available: topping?.available ?? true,
      isFree: topping?.isFree || false,
      isPopular: topping?.isPopular || false,
      isPremium: topping?.isPremium || false,
      order: topping?.order?.toString() || "",
      calories: topping?.calories?.toString() || "",
      categoryId: topping?.categoryId || "",

    },
  })

  async function onSubmit(data: ToppingFormValues) {
    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/toppings/admin/${topping.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/toppings/admin`

      const payload = {
        ...data,
        price: parseFloat(data.price),
        order: data.order ? parseInt(data.order) : undefined,
        calories: data.calories ? parseInt(data.calories) : undefined,
        imageUrl: data.imageUrl || undefined,
      }

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        toast.error('Token de autenticação não encontrado')
        return
      }

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
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

      toast.success(isEditing ? 'Topping atualizado com sucesso!' : 'Topping criado com sucesso!')
      router.push('/admin/toppings')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar topping')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-6 sm:py-8 pb-24 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            {isEditing && (
              <Link href="/admin/toppings">
                <Button variant="ghost" size="icon" className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'Editar Topping' : 'Novo Topping'}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                {isEditing ? 'Atualize as informações do topping' : 'Preencha os dados para criar um novo topping'}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8 lg:pb-12">
            {/* Informações Básicas */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Informações Básicas
                </CardTitle>
                <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
                  Dados principais do topping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      className="min-h-[100px] text-base border-2 border-neutral-200 dark:border-neutral-700 focus-visible:border-[#9d0094]"
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
          </CardContent>
        </Card>

            {/* Preço e Ordem */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Preço e Ordem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/toppings')}
                className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="h-12 px-6 bg-[#9d0094] hover:bg-[#8a0080] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Atualizar Topping' : 'Criar Topping'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
