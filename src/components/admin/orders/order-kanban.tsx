// components/admin/orders/order-kanban.tsx
'use client'

import { ReactNode, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'

const columns = [
  { id: 'pending', label: 'Pendente' },
  { id: 'confirmed', label: 'Confirmado' },
  { id: 'preparing', label: 'Preparando' },
  { id: 'ready', label: 'Pronto' },
  { id: 'delivering', label: 'Entregando' },
  { id: 'delivered', label: 'Entregue' }
]

export function OrderKanban({ initialOrders }: { initialOrders: any }) {
  const [orders, setOrders] = useState(initialOrders)

  const handleDragEnd = async (result: any) => {
    // Update order status via API
    await fetch(`/api/orders/${result.draggableId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: result.destination.droppableId })
    })
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <Droppable key={column.id} droppableId={column.id} children={function (provided: DroppableProvided, snapshot: DroppableStateSnapshot): ReactNode {
                throw new Error('Function not implemented.')
            } } >
            {/* Column implementation */}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
