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
  deliveryMethod: 'delivery' | 'pickup';
  deliveryType?: 'delivery' | 'pickup';
  address?: Address;
  paymentMethod: 'pix' | 'cash' | 'credit' | 'debit';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  confirmedAt?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  changeFor?: number | string;
  // Campos do PIX para o frontend usar
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixExpiresAt?: string;
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
  productName?: string;
  productPrice?: number | string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  subtotal?: number | string;
  toppings?: Array<{
    id?: string;
    toppingId: string;
    toppingName: string;
    toppingPrice?: number | string;
    quantity?: number;
    name?: string;
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
    // 🔴 CORREÇÃO AQUI: Troque 'data' por 'payload'
    const res = await api.post('/orders', payload); 
    
    // ✅ O segredo para não dar erro "undefined" no ID:
    return res.data; 
  },

  // ... (o restante dos métodos estava correto)
  getById: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  getStatus: async (id: string): Promise<{ status: Order['status'] }> => {
    const res = await api.get(`/orders/${id}`); 
    return { status: res.data.status };
  },

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

  getAllOrders: async (params?: { status?: string }): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/admin/all', { params });
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  cancelByAdmin: async (id: string): Promise<void> => {
    await api.delete(`/orders/admin/${id}/cancel`);
  }
};