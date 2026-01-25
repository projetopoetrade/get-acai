'use client';

import api from '@/lib/api';
import { Address, CreateOrderRequest } from '@/types/api';

export interface Order {
  id: string;
  orderNumber?: string;
  status: 'pending' | 'awaiting_payment' | 'payment_received' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number | string;
  discount: number | string;
  deliveryFee: number | string;
  total: number | string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryMethod: 'delivery' | 'pickup'; // Campo correto da API
  deliveryType?: 'delivery' | 'pickup'; // Mantido para compatibilidade
  address?: Address;
  paymentMethod: 'pix' | 'cash' | 'credit' | 'debit';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  confirmedAt?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  changeFor?: number | string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    imageUrl?: string;
    category?: string;
  };
  productName?: string; // Campo direto da API
  productPrice?: number | string; // Campo direto da API
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  subtotal?: number | string; // Campo da API
  // Toppings podem vir em duas estruturas diferentes
  toppings?: Array<{
    id?: string;
    toppingId: string;
    toppingName: string;
    toppingPrice?: number | string;
    quantity?: number;
    name?: string; // Para compatibilidade
  }>;
  customization?: {
    sizeId?: string;
    toppings: Array<{
      toppingId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      isFree: boolean;
    }>;
    wantsCutlery: boolean;
    observations?: string;
  };
  notes?: string;
}

export const ordersService = {
  /**
   * Cria um novo pedido
   */
  create: async (payload: CreateOrderRequest): Promise<Order> => {
    const res = await api.post('/orders', payload);
    return res.data;
  },

  /**
   * Busca um pedido por ID
   */
  getById: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  /**
   * Busca o status de um pedido (para polling)
   */
  getStatus: async (id: string): Promise<{ status: Order['status'] }> => {
    const res = await api.get(`/orders/${id}/status`);
    return res.data;
  },

  /**
   * Busca todos os pedidos do usuário autenticado
   * Se não autenticado, pode buscar por telefone
   */
  getMyOrders: async (phone?: string): Promise<Order[]> => {
    const params = phone ? { phone } : {};
    const res = await api.get('/orders', { params });
    return res.data;
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  },


  // --- MÉTODOS DE ADMIN ---

  // Buscar todos os pedidos (com filtros opcionais)
  getAllOrders: async (params?: { status?: string }): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/admin/all', { params });
    return response.data;
  },

  // Atualizar status do pedido
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  // Cancelar pedido como admin
  cancelByAdmin: async (id: string): Promise<void> => {
    await api.delete(`/orders/admin/${id}/cancel`);
  }
};
