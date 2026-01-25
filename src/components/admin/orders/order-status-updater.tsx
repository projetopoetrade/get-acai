// components/admin/orders/order-status-updater.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'ready', label: 'Pronto' },
  { value: 'delivering', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregue' }
]

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    if (status === currentStatus) {
      toast.info('Status já está atualizado')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Status atualizado com sucesso')
        router.refresh()
      } else {
        const error = await response.json().catch(() => ({ message: 'Erro ao atualizar status' }))
        toast.error(error.message || 'Erro ao atualizar status')
      }
    } catch (error) {
      toast.error('Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger 
          className="flex-1 h-12 text-base font-semibold bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 hover:border-[#9d0094] focus-visible:border-[#9d0094] focus-visible:ring-[#9d0094]/20 transition-all text-neutral-900 dark:text-neutral-100"
        >
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-lg">
          {statusOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="text-base font-medium py-3 cursor-pointer text-neutral-900 dark:text-neutral-100 hover:bg-[#9d0094]/10 focus:bg-[#9d0094]/10 data-[highlighted]:bg-[#9d0094]/10 data-[highlighted]:text-[#9d0094]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={handleUpdate} 
        disabled={loading || status === currentStatus}
        className="h-12 px-6 bg-[#9d0094] hover:bg-[#8a0080] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Atualizando...
          </>
        ) : (
          'Atualizar Status'
        )}
      </Button>
    </div>
  )
}
