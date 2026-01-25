// components/admin/toppings/topping-actions.tsx
"use client"

import { MoreHorizontal, Pencil, Trash, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ToppingActionsProps {
  topping: {
    id: string
    name: string
    available?: boolean
  }
  onEdit?: (topping: any) => void
}

export function ToppingActions({ topping, onEdit }: ToppingActionsProps) {
  const router = useRouter()

  const handleEdit = () => {
    if (onEdit) {
      onEdit(topping)
    } else {
      router.push(`/admin/toppings/${topping.id}/editar`)
    }
  }

  const handleToggle = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/admin/${topping.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success(`${topping.name} ${topping.available ? 'desativado' : 'ativado'}`)
        router.refresh()
      } else {
        toast.error('Erro ao atualizar topping')
      }
    } catch (error) {
      toast.error('Erro ao atualizar topping')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente deletar ${topping.name}?`)) return

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/toppings/admin/${topping.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Topping deletado com sucesso')
        router.refresh()
      } else {
        toast.error('Erro ao deletar topping')
      }
    } catch (error) {
      toast.error('Erro ao deletar topping')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEdit}
        className="h-8 w-8 text-[#9d0094] hover:text-[#8a0080] hover:bg-[#9d0094]/10"
        title="Editar topping"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggle}>
            <ToggleLeft className="mr-2 h-4 w-4" />
            {topping.available ? 'Desativar' : 'Ativar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
