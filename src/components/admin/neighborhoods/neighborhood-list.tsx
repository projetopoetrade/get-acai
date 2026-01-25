// components/admin/neighborhoods/neighborhood-list.tsx
'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Search, MapPin, Clock, DollarSign, Edit, Trash } from "lucide-react"
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
import { EditNeighborhoodDialog } from "./edit-neighborhood-dialog"

interface Neighborhood {
  id: string
  name: string
  customDeliveryFee: string | number
  estimatedTime: string
  active: boolean
  notes?: string
}

interface NeighborhoodListProps {
  neighborhoods: Neighborhood[]
}

export function NeighborhoodList({ neighborhoods }: NeighborhoodListProps) {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/neighborhoods/${id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        toast.success(`Bairro ${currentStatus ? 'desativado' : 'ativado'}`)
        router.refresh()
      } else {
        toast.error('Erro ao atualizar bairro')
      }
    } catch (error) {
      toast.error('Erro ao atualizar bairro')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/neighborhoods/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (response.ok) {
        toast.success(`Bairro ${name} deletado`)
        router.refresh()
      } else {
        toast.error('Erro ao deletar bairro')
      }
    } catch (error) {
      toast.error('Erro ao deletar bairro')
    }
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Buscar bairro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 border border-neutral-200 dark:border-neutral-800"
        />
      </div>

      {/* Lista */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
        {filteredNeighborhoods.map((neighborhood) => (
          <div key={neighborhood.id} className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MapPin className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{neighborhood.name}</p>
                    <Badge 
                      variant={neighborhood.active ? "default" : "secondary"}
                      className="h-5 text-xs px-1.5"
                    >
                      {neighborhood.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>R$ {parseFloat(neighborhood.customDeliveryFee.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{neighborhood.estimatedTime}</span>
                    </div>
                  </div>

                  {neighborhood.notes && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      📝 {neighborhood.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={neighborhood.active}
                  onCheckedChange={() => handleToggle(neighborhood.id, neighborhood.active)}
                />

                <EditNeighborhoodDialog neighborhood={neighborhood} />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-neutral-900 dark:text-neutral-100">Deletar bairro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                        Tem certeza que deseja deletar o bairro "{neighborhood.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-2 border-neutral-300 dark:border-neutral-700">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(neighborhood.id, neighborhood.name)}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}

        {filteredNeighborhoods.length === 0 && (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
            <MapPin className="mx-auto h-10 w-10 opacity-20 mb-3" />
            <p className="text-sm">Nenhum bairro encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
