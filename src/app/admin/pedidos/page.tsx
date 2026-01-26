'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCcw, Bell, ChefHat } from 'lucide-react';
import { ordersService, Order } from '@/services/orders';
import { AdminOrderCard } from '@/components/admin/admin-order-card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminGuard } from '@/components/admin/admin-guard';

import { useSocket } from '@/contexts/socket-provider';

type TabType = 'new' | 'preparing' | 'delivery' | 'done';

const TABS: { id: TabType; label: string }[] = [
  { id: 'new', label: 'Novos' },
  { id: 'preparing', label: 'Cozinha' },
  { id: 'delivery', label: 'Entrega' },
  { id: 'done', label: 'Histórico' },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();


  // --- BUSCAR PEDIDOS (Carregamento Inicial) ---
  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos', error);
      toast.error('Erro de conexão ao buscar lista inicial');
    }
  }, []);

  // ✅ 3. Efeito para carregar inicial e escutar o Socket
  useEffect(() => {
    fetchOrders();

    if (!socket) return;

    // A. Escutar NOVOS pedidos
    socket.on('newOrder', (newOrder: Order) => {
      // Adiciona o novo pedido no topo da lista
      setOrders((prev) => {
        // Evita duplicidade (caso o socket mande 2x)
        if (prev.find(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      // Nota: O som e o toast já estão no hook useSocket, 
      // então aqui só atualizamos a lista visualmente.
    });

    // B. (Opcional) Escutar ATUALIZAÇÕES de status de outros admins
    socket.on('orderStatusUpdated', (updatedOrder: Order) => {
      setOrders((prev) => prev.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      ));
    });

    // Limpeza ao sair da página
    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
    };
  }, [socket, fetchOrders]);


  // --- AÇÕES ---
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      // Atualização Otimista (Muda na tela antes do servidor responder)
      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, status: newStatus as any } : o
      ));

      await ordersService.updateStatus(id, newStatus);
      toast.success('Status atualizado!');

      // O socket vai garantir que outros admins vejam isso, 
      // mas para nós, a atualização otimista já resolveu.
    } catch (error) {
      toast.error('Erro ao atualizar status');
      fetchOrders(); // Reverte se der erro
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    setProcessingId(id);
    try {
      await ordersService.cancelByAdmin(id);

      setOrders(prev => prev.map(o =>
        o.id === id ? { ...o, status: 'cancelled' } : o
      ));

      toast.success('Pedido cancelado');
    } catch (error) {
      toast.error('Erro ao cancelar');
    } finally {
      setProcessingId(null);
    }
  };

  // --- FILTRAGEM INTELIGENTE ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const s = order.status;
      switch (activeTab) {
        case 'new': return ['pending', 'awaiting_payment'].includes(s);
        case 'preparing': return ['payment_received', 'confirmed', 'preparing'].includes(s);
        case 'delivery': return ['ready', 'delivering'].includes(s);
        case 'done': return ['delivered', 'cancelled'].includes(s);
        default: return false;
      }
    });
  }, [orders, activeTab]);

  const getCount = (tab: TabType) => {
    return orders.filter(order => {
      const s = order.status;
      switch (tab) {
        case 'new': return ['pending', 'awaiting_payment'].includes(s);
        case 'preparing': return ['payment_received', 'confirmed', 'preparing'].includes(s);
        case 'delivery': return ['ready', 'delivering'].includes(s);
        default: return false;
      }
    }).length;
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#9d0094] rounded-xl flex items-center justify-center">
                  <ChefHat className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    Gestor de Pedidos
                  </h1>
                  <p className="flex items-center gap-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                    {/* ✅ Use isConnected aqui. Agora a bolinha muda de cor sozinha! */}
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                    {isConnected ? 'Conectado em tempo real' : 'Conectando ao servidor...'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchOrders()}
                className="h-11 w-11 border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RefreshCcw className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              </Button>
            </div>

            {/* ... Resto do Layout (Abas e Cards) permanece igual ... */}

            <div className="flex overflow-x-auto px-4 gap-4 scrollbar-hide border-b border-neutral-200 dark:border-neutral-800">
              {TABS.map((tab) => {
                const count = getCount(tab.id);
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-all whitespace-nowrap ${isActive
                        ? 'border-[#9d0094] text-[#9d0094] font-bold'
                        : 'border-transparent text-neutral-500 font-medium'
                      }`}
                  >
                    {tab.label}
                    {count > 0 && tab.id !== 'done' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-[#9d0094] text-white' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">Nenhum pedido nesta etapa</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredOrders.map((order) => (
                    <AdminOrderCard
                      key={order.id}
                      order={order}
                      onAdvanceStatus={handleUpdateStatus}
                      onCancel={handleCancel}
                      loadingId={processingId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}