'use client';

import api from '@/lib/api';

export const categoriesService = {
  getAll: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },
};
