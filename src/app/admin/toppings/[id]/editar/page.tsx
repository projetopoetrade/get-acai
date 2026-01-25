// app/admin/toppings/[id]/editar/page.tsx
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ToppingForm } from "@/components/admin/toppings/topping-form"
import { notFound } from "next/navigation"

async function getTopping(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/${id}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    notFound()
  }

  return response.json()
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

export default async function EditToppingPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const [topping, categories] = await Promise.all([
    getTopping(resolvedParams.id),
    getToppingCategories()
  ])

  return (
    <ToppingForm topping={topping} categories={categories} />
  )
}
