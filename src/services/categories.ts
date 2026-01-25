'use client';

import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const res = await api.get('/products/categories');
      // Garante que retorna um array
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  },
};
