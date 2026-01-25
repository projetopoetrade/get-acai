// components/admin/products/product-form.tsx
'use client'

import { FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, useForm } from "react-hook-form"
import * as z from "zod"

const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(3).max(500),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  imageUrl: z.string().url(),
  available: z.boolean(),
  isCombo: z.boolean(),
  isCustomizable: z.boolean(),
  hasPromo: z.boolean(),
  promoText: z.string().optional(),
  includedToppings: z.array(z.string()).optional(),
  highlightType: z.enum(['promo', 'bestseller', 'new', 'limited']).optional(),
  highlightLabel: z.string().optional(),
  highlightOrder: z.number().optional(),
  categoryId: z.string().uuid(),
  sizeId: z.string(),
  sizeGroup: z.string().optional(),
  stock: z.number().nullable().optional()
})

export function ProductForm({ product, categories, sizes }: { product: any, categories: any, sizes: any }) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {}
  })

  const onSubmit = async (data: any) => {
    const url = product 
      ? `/api/products/${product.id}` 
      : '/api/products'
    
    await fetch(url, {
      method: product ? 'PATCH' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem   >
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Açaí 500ml" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Mais campos... */}
      </form>
    </Form>
  )
}
