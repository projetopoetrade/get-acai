// app/admin/toppings/toppings-table.tsx
'use client'

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ToppingActions } from "@/components/admin/toppings/topping-actions"

type Topping = {
  id: string
  name: string
  price: number
  icon?: string
  available?: boolean
  category?: {
    id: string
    name: string
  }
  stock?: number | null
}

const columns: ColumnDef<Topping>[] = [
  {
    accessorKey: "icon",
    header: "Ícone",
    cell: ({ row }) => <span className="text-2xl">{row.getValue("icon") as string}</span>
  },
  {
    accessorKey: "name",
    header: "Nome"
  },
  {
    accessorKey: "category.name",
    header: "Categoria"
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => `R$ ${(row.getValue("price") as number).toFixed(2)}`
  },
  {
    accessorKey: "stock",
    header: "Estoque",
    cell: ({ row }) => {
      const stock = row.getValue("stock")
      return stock === null ? "Ilimitado" : stock
    }
  },
  {
    accessorKey: "available",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("available") ? "default" : "destructive"}>
        {row.getValue("available") ? "Disponível" : "Indisponível"}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <ToppingActions topping={row.original} />
  }
]

interface ToppingsTableProps {
  data: Topping[]
}

export function ToppingsTable({ data }: ToppingsTableProps) {
  return <DataTable columns={columns} data={data} />
}
