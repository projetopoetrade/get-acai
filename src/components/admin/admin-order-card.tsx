// src/components/admin/admin-order-card.tsx
import { 
    MapPin, Clock, User, Phone, CheckCircle2, 
    Bike, ChefHat, XCircle, AlertCircle, Eye
  } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Order } from '@/services/orders'; // Ajuste o import conforme sua tipagem
  import { Badge } from '@/components/ui/badge';
  import { useRouter } from 'next/navigation';
  
  interface AdminOrderCardProps {
    order: Order;
    onAdvanceStatus: (id: string, currentStatus: string) => void;
    onCancel: (id: string) => void;
    loadingId: string | null;
  }
  
  export function AdminOrderCard({ order, onAdvanceStatus, onCancel, loadingId }: AdminOrderCardProps) {
    const router = useRouter();
    const isLoading = loadingId === order.id;
  
    // Resolve endereço
    const address = order.address 
    
    // Formata hora
    const time = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
  
    // Lógica do Próximo Passo (Botão de Ação)
    const getAction = () => {
      switch (order.status) {
        case 'pending':
        case 'awaiting_payment': // Se for PIX e vc quiser aprovar manual
          return { label: 'Aceitar Pedido', next: 'confirmed', color: 'bg-green-600 hover:bg-green-700' };
        case 'payment_received': 
          return { label: 'Iniciar Preparo', next: 'preparing', color: 'bg-blue-600 hover:bg-blue-700' };
        case 'confirmed':
          return { label: 'Iniciar Preparo', next: 'preparing', color: 'bg-blue-600 hover:bg-blue-700' };
        case 'preparing':
          return { label: 'Pedido Pronto', next: 'ready', color: 'bg-purple-600 hover:bg-purple-700' };
        case 'ready':
          return order.deliveryMethod === 'delivery' 
            ? { label: 'Despachar Entrega', next: 'delivering', color: 'bg-orange-600 hover:bg-orange-700' }
            : { label: 'Entregar ao Cliente', next: 'delivered', color: 'bg-green-600 hover:bg-green-700' };
        case 'delivering':
          return { label: 'Finalizar Entrega', next: 'delivered', color: 'bg-green-600 hover:bg-green-700' };
        default:
          return null;
      }
    };
  
    const action = getAction();
  
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="font-bold text-lg">#{order.orderNumber || order.id.substring(0,4)}</span>
            <span className="text-neutral-400 mx-2">•</span>
            <span className="font-medium text-neutral-600 dark:text-neutral-300">{order.customer?.name || 'Cliente'}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="font-bold text-[#9d0094]">R$ {Number(order.total).toFixed(2)}</span>
             <span className="text-xs text-neutral-500 flex items-center gap-1">
               <Clock className="w-3 h-3" /> {time}
             </span>
          </div>
        </div>
  
        {/* Detalhes do Pedido */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg mb-3 space-y-2">
          {/* Itens */}
          <div className="space-y-1">
            {order.items?.map((item, idx) => (
               <div key={idx} className="text-sm">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{item.quantity}x {item.product?.name || item.productName}</span>
                  {item.toppings && item.toppings.length > 0 && (
                     <p className="text-xs text-neutral-500 pl-4">
                       + {item.toppings.map(t => t.name || t.toppingName).join(', ')}
                     </p>
                  )}
                  {item.notes && <p className="text-xs text-orange-600 pl-4">Obs: {item.notes}</p>}
               </div>
            ))}
          </div>
  
          <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 my-2 pt-2"></div>
  
          {/* Endereço / Retirada */}
          <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
             {order.deliveryMethod === 'delivery' ? (
                <>
                  <Bike className="w-4 h-4 mt-0.5 text-blue-500" />
                  <div>
                     <p className="font-medium text-neutral-900 dark:text-neutral-200">Entrega em: {address?.neighborhood}</p>
                     <p className="text-xs">{address?.street}, {address?.number} {address?.complement ? `(${address.complement})` : ''}</p>
                  </div>
                </>
             ) : (
                <>
                   <User className="w-4 h-4 mt-0.5 text-orange-500" />
                   <p className="font-medium">Retirada no Balcão</p>
                </>
             )}
          </div>
          
          {/* Pagamento */}
          <div className="flex items-center gap-2 text-xs mt-2">
             <Badge variant={order.paymentStatus === 'paid' ? "default" : "secondary"} className={order.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                {order.paymentMethod.toUpperCase()}
                {order.paymentMethod === 'cash' && order.changeFor && ` (Troco p/ ${order.changeFor})`}
             </Badge>
             {order.paymentStatus === 'pending' && <span className="text-red-500 font-bold animate-pulse">! Pagamento Pendente</span>}
          </div>
        </div>
  
        {/* Botões de Ação */}
        <div className="grid grid-cols-4 gap-2">
           {action ? (
              <Button 
                 onClick={() => onAdvanceStatus(order.id, action.next)}
                 disabled={isLoading}
                 className={`col-span-3 text-white font-bold h-12 rounded-lg transition-all ${action.color}`}
              >
                 {isLoading ? 'Processando...' : action.label}
              </Button>
           ) : (
              <div className="col-span-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-sm font-medium text-neutral-500">
                 {order.status === 'delivered' ? 'Concluído' : 'Cancelado'}
              </div>
           )}
           
           {/* Botão Cancelar (Pequeno) */}
           {order.status !== 'cancelled' && order.status !== 'delivered' && (
               <Button 
                  variant="outline" 
                  onClick={() => onCancel(order.id)}
                  disabled={isLoading}
                  className="col-span-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
               >
                  <XCircle className="w-5 h-5" />
               </Button>
           )}
        </div>

        {/* Botão Ver Detalhes */}
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/pedidos/${order.id}`)}
          className="w-full mt-2 h-10 border-[#9d0094] text-[#9d0094] hover:bg-[#9d0094] hover:text-white transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
      </div>
    );
  }