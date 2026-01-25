// components/admin/neighborhoods/edit-neighborhood-dialog.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface EditNeighborhoodDialogProps {
  neighborhood: any
}

export function EditNeighborhoodDialog({ neighborhood }: EditNeighborhoodDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: neighborhood.name,
    customDeliveryFee: neighborhood.customDeliveryFee.toString(),
    estimatedTime: neighborhood.estimatedTime,
    notes: neighborhood.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/neighborhoods/${neighborhood.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...formData,
            customDeliveryFee: parseFloat(formData.customDeliveryFee)
          })
        }
      )

      if (response.ok) {
        toast.success('Bairro atualizado!')
        setOpen(false)
        router.refresh()
      } else {
        toast.error('Erro ao atualizar bairro')
      }
    } catch (error) {
      toast.error('Erro ao atualizar bairro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-[#9d0094] hover:text-[#8a0080] hover:bg-[#9d0094]/10"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Bairro</DialogTitle>
            <DialogDescription>
              Atualize as informações do bairro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Bairro *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fee">Taxa de Entrega (R$) *</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                value={formData.customDeliveryFee}
                onChange={(e) => setFormData({ ...formData, customDeliveryFee: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Tempo Estimado</Label>
              <Input
                id="time"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
