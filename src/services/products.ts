'use client';

import api from '@/lib/api';
import { Product } from '@/types/api';

// Normalizar categoria (remove acentos e converte para minúsculas)
const normalizeCategory = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

export const productsService = {
    getAll: async (): Promise<Product[]> => {
      const res = await api.get('/products');
      
      // ✅ Retorna EXATAMENTE o tipo que ProductCard espera
      return res.data.map((p: any): Product => ({
        id: p.id,
        name: p.name,
        description: p.description || 'Produto delicioso e fresquinho',
        price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
        imageUrl: p.imageUrl || '/placeholder-product.jpg',
        available: p.available ?? true,
        category: normalizeCategory(p.categoryId || p.category || 'monte-seu'),
        categoryName: p.categoryName || 'Monte seu açaí',
        size: p.size || { id: 'default', name: 'Padrão' },
        stock: p.stock ?? null,
      }));
    },

  getHighlights: async () => {
    const res = await api.get('/products/highlights');
    return res.data.map((p: any) => ({
      ...p,
      price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
    })) as Product[];
  },

  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  getByCategory: async (category: string) => {
    const res = await api.get('/products', { params: { category } });
    return res.data.map((p: any) => ({
      // mesmo mapeamento
      id: p.id,
      name: p.name,
      description: p.description || 'Produto delicioso e fresquinho',
      price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
      imageUrl: p.imageUrl || '/placeholder-product.jpg',
      available: p.available,
      category: p.categoryId || p.category || category,
      categoryName: p.categoryName || category,
      size: p.size || { id: 'default', name: 'Padrão' },
      stock: p.stock,
    })) as Product[];
  },

  getOne: async (id: string) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('[productsService.getOne] Buscando produto:', id);
    }
    
    try {
      const res = await api.get(`/products/${id}`);
      
      if (isDev) {
        console.log('[productsService.getOne] Resposta da API:', res.data);
      }
      
      const p = res.data;
      const mapped = {
        ...p,
        price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
      } as Product;
      
      if (isDev) {
        console.log('[productsService.getOne] Produto mapeado:', mapped);
      }
      
      return mapped;
    } catch (error: any) {
      // Sempre logar erros (importante para debug)
      console.error('[productsService.getOne] Erro ao buscar produto:', {
        id,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};
