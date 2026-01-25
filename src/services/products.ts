// src/services/products.ts
'use client';

import api from '@/lib/api';
import { Product as APIProduct } from '@/types/api';
import { Product } from '@/types/product';
import { categoriesService, Category } from '@/services/categories';

// Normalizar categoria (remove acentos e converte para minúsculas)
const normalizeCategory = (category: string): string => {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

// Mapeia nome da categoria do backend para o ID esperado pelo frontend
const mapCategoryNameToId = (categoryName: string): 'combos' | 'monte-seu' | 'classicos' | 'complemento' | 'bebidas' => {
  const normalized = normalizeCategory(categoryName);
  
  // Mapeamentos possíveis
  if (normalized.includes('combo') || normalized === 'combos') {
    return 'combos';
  }
  if (normalized.includes('monte') || normalized.includes('personaliz') || normalized === 'monte-seu' || normalized === 'monte seu') {
    return 'monte-seu';
  }
  if (normalized.includes('classic') || normalized === 'classicos') {
    return 'classicos';
  }
  if (normalized.includes('bebida') || normalized === 'bebidas') {
    return 'bebidas';
  }
  if (normalized.includes('complement')) {
    return 'complemento';
  }
  
  // Default
  return 'monte-seu';
};

// Busca categorias e cria um mapa UUID -> nome (sem cache)
const getCategoryMap = async (): Promise<Map<string, string>> => {
  try {
    const categories = await categoriesService.getAll();
    const map = new Map<string, string>();
    if (categories && categories.length > 0) {
      categories.forEach((cat: Category) => {
        map.set(cat.id, cat.name);
      });
    }
    return map;
  } catch (error) {
    console.error('Erro ao buscar categorias para mapeamento:', error);
    return new Map();
  }
};

export const productsService = {
  // --- MÉTODOS DE LEITURA (PÚBLICOS) ---

  getAll: async (availableOnly: boolean = true): Promise<Product[]> => {
    const params = availableOnly ? { availableOnly: 'true' } : {};
    const res = await api.get('/products', { params });
    
    // Busca o mapa de categorias para resolver UUIDs
    const categoryMap = await getCategoryMap();
    
    // ✅ Retorna EXATAMENTE o tipo que ProductCard espera
    return res.data.map((p: any): Product => {
      // ✅ PRIORIDADE: categoryId sempre tem precedência sobre category (pode estar desatualizado)
      let categoryId: string = '';
      let categoryName: string = '';
      
      // ✅ PRIORIDADE ABSOLUTA: categoryId sempre tem precedência
      // O objeto category pode estar desatualizado após atualizações
      if (p.categoryId) {
        categoryId = p.categoryId;
      }
      
      // Se temos categoryId (UUID), busca o nome no mapa de categorias
      // Isso garante que sempre temos o nome correto, mesmo se o objeto category estiver desatualizado
      if (categoryId && categoryMap.has(categoryId)) {
        categoryName = categoryMap.get(categoryId) || '';
      }
      
      // Fallback: Se não encontrou no mapa, tenta usar o objeto category
      // Mas só se o category.id corresponder ao categoryId (para evitar dados desatualizados)
      if (!categoryName && p.category) {
        if (typeof p.category === 'object' && p.category !== null) {
          // Só usa se o ID corresponder (evita dados desatualizados)
          if (p.category.id === categoryId) {
            categoryName = p.category.name || '';
          } else if (!categoryId) {
            // Se não temos categoryId, usa o category.id como fallback
            categoryId = p.category.id || '';
            categoryName = p.category.name || '';
          }
        } else {
          // Se category é uma string, usa como nome
          categoryName = p.category;
        }
      }
      
      // Se temos categoryName mas não categoryId, usa o nome para mapear
      if (categoryName && !categoryId) {
        // Tenta mapear o nome para um ID conhecido
        categoryId = categoryName;
      }
      
      // 4. Mapeia para o ID esperado pelo frontend
      // Se temos categoryName, usa ele. Se não, tenta usar categoryId (pode ser UUID ou nome)
      const categoryNameToMap = categoryName || categoryId || '';
      const mappedCategory = categoryNameToMap ? mapCategoryNameToId(categoryNameToMap) : 'monte-seu';
      
      // 5. Se ainda não temos categoryName, tenta obter do objeto category (fallback)
      if (!categoryName && p.category && typeof p.category === 'object') {
        categoryName = p.category.name || '';
      }
      
      // Se ainda não temos categoryName, usa o mapeado
      if (!categoryName) {
        categoryName = mappedCategory === 'combos' ? 'Combos' : 
                      mappedCategory === 'monte-seu' ? 'Monte o Seu' :
                      mappedCategory === 'classicos' ? 'Clássicos' : 'Monte seu açaí';
      }
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || 'Produto delicioso e fresquinho',
        price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
        imageUrl: p.imageUrl || '/placeholder-product.jpg',
        available: p.available ?? true,
        category: mappedCategory, // Já mapeado para ProductCategory
        // Campos adicionais que podem vir do backend
        originalPrice: p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : Number(p.originalPrice)) : undefined,
        hasPromo: p.hasPromo ?? false,
        promoText: p.promoText,
        isCombo: p.isCombo ?? false,
        isCustomizable: p.isCustomizable ?? true,
        highlight: p.highlight,
        sizeId: p.sizeId,
        sizeGroup: p.sizeGroup,
      };
    });
  },
  getHighlights: async (): Promise<Product[]> => {
    const res = await api.get('/products/highlights');
    
    // O restante do código continua igual
    return res.data.map((p: any): Product => {
      // Extrai categoryId e categoryName de diferentes formatos possíveis
      let categoryId: string = '';
      let categoryName: string = '';
      
      if (p.categoryId) {
        categoryId = p.categoryId;
      }
      
      if (p.category) {
        // Se category é um objeto, pega o id e name
        if (typeof p.category === 'object' && p.category !== null) {
          categoryId = p.category.id || categoryId;
          categoryName = p.category.name || categoryName;
        } else {
          // Se category é uma string, usa como nome
          categoryName = p.category;
        }
      }
      
      // Se temos categoryName mas não categoryId, usa o nome para mapear
      if (categoryName && !categoryId) {
        categoryId = categoryName;
      }
      
      // Se temos categoryName, mapeia para o ID esperado pelo frontend
      const categoryNameToMap = categoryName || categoryId || '';
      const mappedCategory = categoryNameToMap ? mapCategoryNameToId(categoryNameToMap) : 'monte-seu';
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || 'Produto delicioso e fresquinho',
        price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
        imageUrl: p.imageUrl || '/placeholder-product.jpg',
        available: p.available ?? true,
        category: mappedCategory,
        originalPrice: p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : Number(p.originalPrice)) : undefined,
        hasPromo: p.hasPromo ?? false,
        promoText: p.promoText,
        isCombo: p.isCombo ?? false,
        isCustomizable: p.isCustomizable ?? true,
        highlight: p.highlight,
        sizeId: p.sizeId,
        sizeGroup: p.sizeGroup,
      };
    });
  },

  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  getByCategory: async (category: string) => {
    const res = await api.get('/products', { params: { category } });
    return res.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || 'Produto delicioso e fresquinho',
      price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
      imageUrl: p.imageUrl || '/placeholder-product.jpg',
      available: p.available,
      category: p.categoryId || p.category || category,
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
      console.error('[productsService.getOne] Erro ao buscar produto:', {
        id,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  // --- NOVOS MÉTODOS DE ADMINISTRAÇÃO (PRIVADOS/ADMIN) ---

  create: async (data: any): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  toggle: async (id: string): Promise<{ id: string; available: boolean }> => {
    const response = await api.patch<{ id: string; available: boolean }>(`/products/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};