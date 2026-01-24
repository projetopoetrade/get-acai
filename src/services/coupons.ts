'use client';

import api from '@/lib/api';
import { ValidateCouponRequest, ValidateCouponResponse } from '@/types/api';

export const couponsService = {
  /**
   * Valida um cupom de desconto
   */
  validate: async (request: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
    const res = await api.post('/coupons/validate', request);
    return res.data;
  },
};
