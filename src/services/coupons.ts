import api from "@/lib/api";


export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed'; 
  value: number;
  minOrderValue: number;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;
}

export interface CreateCouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxUsage?: number;
}

export const couponsService = {
  // Validar (Usado no Carrinho)
  validate: async (data: { code: string; subtotal: number; productIds: string[] }) => {
    const response = await api.get('/coupons/validate', {
      params: { code: data.code, value: data.subtotal }
    });
    return {
      valid: true,
      coupon: response.data.couponCode ? { ...response.data, code: response.data.couponCode } : null,
      discountAmount: response.data.discountAmount,
      message: 'Cupom aplicado com sucesso'
    };
  },

  // ADMIN: Listar todos
  findAll: async () => {
    const response = await api.get<Coupon[]>('/coupons');
    return response.data;
  },

  // ADMIN: Criar
  create: async (data: CreateCouponData) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  // ADMIN: Deletar
  delete: async (id: string) => {
    await api.delete(`/coupons/${id}`);
  }
};