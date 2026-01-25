// app/admin/toppings/columns.tsx
'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ToppingActions } from "@/components/admin/toppings/topping-actions"

export type Topping = {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  icon?: string
  available?: boolean
  category?: {
    id: string
    name: string
  }
  stock?: number | null
}

export const columns: ColumnDef<Topping>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.icon && (
          <span className="text-xl">{row.original.icon}</span>
        )}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {row.getValue("name") as string}
        </span>
      </div>
    )
  },
  {
    accessorKey: "category.name",
    header: "Categoria",
    cell: ({ row }) => (
      <span className="text-neutral-600 dark:text-neutral-400">
        {row.original.category?.name || '-'}
      </span>
    )
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => (
      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
        R$ {(row.getValue("price") as number).toFixed(2)}
      </span>
    )
  },
  {
    accessorKey: "stock",
    header: "Estoque",
    cell: ({ row }) => {
      const stock = row.getValue("stock")
      return (
        <span className="text-neutral-600 dark:text-neutral-400">
          {stock === null ? "Ilimitado" : (stock as number)}
        </span>
      )
    }
  },
  {
    accessorKey: "available",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant={row.getValue("available") ? "default" : "destructive"}
        className={row.getValue("available") 
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
          : ""}
      >
        {row.getValue("available") ? "Disponível" : "Indisponível"}
      </Badge>
    )
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row, table }) => {
      const meta = table.options.meta as { onEdit?: (topping: any) => void } | undefined
      return <ToppingActions topping={row.original} onEdit={meta?.onEdit} />
    }
  }
]
