// src/app/admin/pedidos/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw, Bell, ChefHat } from 'lucide-react';
import { ordersService } from '@/services/orders';
import { Order } from '@/services/orders'; // Sua interface Order
import { AdminOrderCard } from '@/components/admin/admin-order-card'; // O componente que criamos acima
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminGuard } from '@/components/admin/admin-guard';

// Definição das Abas
type TabType = 'new' | 'preparing' | 'delivery' | 'done';

const TABS: { id: TabType; label: string; count?: number }[] = [
  { id: 'new', label: 'Novos' },
  { id: 'preparing', label: 'Cozinha' },
  { id: 'delivery', label: 'Entrega' },
  { id: 'done', label: 'Histórico' },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- BUSCAR PEDIDOS ---
  const fetchOrders = async () => {
    try {
      // Aqui buscamos TUDO para poder contar os badges das abas
      // Em apps grandes, buscaríamos paginado por status, mas para MVP está ótimo
      const data = await ordersService.getAllOrders(); 
      setOrders(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos admin', error);
      toast.error('Erro de conexão');
    }
  };

  // Atualização Automática (Polling a cada 15s)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- AÇÕES ---
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      await ordersService.updateStatus(id, newStatus);
      toast.success('Status atualizado!');
      fetchOrders(); // Atualiza lista imediatamente
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    setProcessingId(id);
    try {
      await ordersService.cancelByAdmin(id);
      toast.success('Pedido cancelado');
      fetchOrders();
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

  // Contadores para as abas
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
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-1">
                    Gerencie todos os pedidos do sistema
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

        {/* Abas de Navegação */}
        <div className="flex overflow-x-auto px-4 gap-4 scrollbar-hide border-b border-neutral-200 dark:border-neutral-800">
          {TABS.map((tab) => {
            const count = getCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-[#9d0094] text-[#9d0094] font-bold' 
                    : 'border-transparent text-neutral-500 font-medium'
                }`}
              >
                {tab.label}
                {count > 0 && tab.id !== 'done' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#9d0094] text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
   

      {/* Lista de Pedidos */}
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