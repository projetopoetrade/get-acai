// components/orders/repeat-order-button.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
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

interface RepeatOrderButtonProps {
  orderId: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function RepeatOrderButton({ orderId, variant = "outline", size = "default" }: RepeatOrderButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRepeatOrder = async () => {
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/repeat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        const newOrder = await response.json()
        toast.success('Pedido adicionado ao carrinho!')
        router.push('/carrinho')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao repetir pedido')
      }
    } catch (error) {
      toast.error('Erro ao repetir pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Repetir Pedido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Repetir este pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            Os mesmos itens serão adicionados ao seu carrinho. Você poderá revisar antes de finalizar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRepeatOrder} disabled={loading}>
            {loading ? 'Processando...' : 'Sim, repetir pedido'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
