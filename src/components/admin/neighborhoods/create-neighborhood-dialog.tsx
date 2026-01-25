// components/admin/neighborhoods/create-neighborhood-dialog.tsx
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
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function CreateNeighborhoodDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    customDeliveryFee: '',
    estimatedTime: '30-40 min',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/neighborhoods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          customDeliveryFee: parseFloat(formData.customDeliveryFee),
          active: true
        })
      })

      if (response.ok) {
        toast.success('Bairro criado com sucesso!')
        setOpen(false)
        setFormData({ name: '', customDeliveryFee: '', estimatedTime: '30-40 min', notes: '' })
        router.refresh()
      } else {
        toast.error('Erro ao criar bairro')
      }
    } catch (error) {
      toast.error('Erro ao criar bairro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Bairro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Bairro</DialogTitle>
            <DialogDescription>
              Adicione um novo bairro para entrega
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Bairro *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Centro"
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
                placeholder="5.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Tempo Estimado</Label>
              <Input
                id="time"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                placeholder="30-40 min"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Bairro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
