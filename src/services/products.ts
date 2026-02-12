// src/services/products.ts
'use client';

import api from '@/lib/api';
import { Product as APIProduct } from '@/types/api';
import { Product } from '@/types/product';
import { categoriesService, Category } from '@/services/categories';

// Cache de categorias para evitar múltiplas requisições
let categoryCache: { data: Category[]; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 segundos

// Busca categorias com cache
const getCategoriesWithCache = async (): Promise<Category[]> => {
  const now = Date.now();
  
  // Retorna cache se ainda válido
  if (categoryCache && now - categoryCache.timestamp < CACHE_TTL) {
    return categoryCache.data;
  }
  
  try {
    const categories = await categoriesService.getAll();
    categoryCache = { data: categories, timestamp: now };
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return categoryCache?.data || [];
  }
};

// Cria um slug normalizado da categoria (para usar como ID no frontend)
const createCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-'); // Substitui espaços por hífens
};

// Mapeia categoria do backend para o formato do frontend
interface CategoryMapping {
  id: string; // UUID do backend
  slug: string; // Slug para usar no frontend
  name: string; // Nome original
}

const buildCategoryMapping = async (): Promise<CategoryMapping[]> => {
  const categories = await getCategoriesWithCache();
  
  return categories.map(cat => ({
    id: cat.id,
    slug: createCategorySlug(cat.name),
    name: cat.name
  }));
};

// Encontra a categoria pelo UUID ou pelo nome
const findCategorySlug = async (categoryIdOrName: string): Promise<string> => {
  const mappings = await buildCategoryMapping();
  
  // Tenta encontrar por UUID
  let found = mappings.find(m => m.id === categoryIdOrName);
  
  // Se não encontrou, tenta encontrar por nome normalizado
  if (!found) {
    const normalized = createCategorySlug(categoryIdOrName);
    found = mappings.find(m => m.slug === normalized);
  }
  
  // Retorna o slug ou usa o normalizado como fallback
  return found?.slug || createCategorySlug(categoryIdOrName);
};

// Mapeia produto da API para o formato do frontend
const mapProductFromAPI = async (p: any): Promise<Product> => {
  // 1. Extrai categoryId prioritariamente
  const categoryId = p.categoryId || p.category?.id || '';
  
  // 2. Extrai categoryName
  let categoryName = '';
  if (p.category) {
    categoryName = typeof p.category === 'object' ? p.category.name : p.category;
  }
  
  // 3. Busca o slug correto dinamicamente
  const categorySlug = categoryId 
    ? await findCategorySlug(categoryId)
    : categoryName 
      ? await findCategorySlug(categoryName)
      : 'sem-categoria';
  
  // 4. Mapeia o produto
  return {
    id: p.id,
    name: p.name,
    description: p.description || 'Produto delicioso e fresquinho',
    price: typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0,
    imageUrl: p.imageUrl || '/placeholder-product.jpg',
    available: p.available ?? true,
    category: categorySlug as any, // O slug dinâmico
    originalPrice: p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : Number(p.originalPrice)) : undefined,
    hasPromo: p.hasPromo ?? false,
    promoText: p.promoText,
    isCombo: p.isCombo ?? false,
    isCustomizable: p.isCustomizable ?? true,
    highlight: p.highlight,
    // API pode mandar `sizeId` ou `size: { id, name }` (docs: GET /products/:id retorna `size`)
    sizeId: p.sizeId ?? p.size?.id,
    sizeGroup: p.sizeGroup,
  };
};

export const productsService = {
  // --- MÉTODOS DE LEITURA (PÚBLICOS) ---

  getAll: async (availableOnly: boolean = true): Promise<Product[]> => {
    const params = availableOnly ? { availableOnly: 'true' } : {};
    const res = await api.get('/products', { params });
    
    // Mapeia todos os produtos em paralelo
    const products = await Promise.all(
      res.data.map((p: any) => mapProductFromAPI(p))
    );
    
    return products;
  },

  getHighlights: async (): Promise<Product[]> => {
    const res = await api.get('/products/highlights');
    
    const products = await Promise.all(
      (res.data || []).map((p: any) => mapProductFromAPI(p))
    );
    
    return products.filter(p => p.available);
  },

  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  getByCategory: async (categorySlugOrId: string): Promise<Product[]> => {
    // Busca todas as categorias para encontrar o UUID correto
    const categories = await getCategoriesWithCache();
    
    // Tenta encontrar a categoria pelo slug ou UUID
    const category = categories.find(cat => 
      cat.id === categorySlugOrId || 
      createCategorySlug(cat.name) === categorySlugOrId
    );
    
    // Usa o UUID da categoria se encontrado, senão usa o parâmetro original
    const categoryParam = category?.id || categorySlugOrId;
    
    const res = await api.get('/products', { params: { category: categoryParam } });
    
    return await Promise.all(
      res.data.map((p: any) => mapProductFromAPI(p))
    );
  },

  getOne: async (id: string): Promise<Product> => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('[productsService.getOne] Buscando produto:', id);
    }
    
    try {
      const res = await api.get(`/products/${id}`);
      
      if (isDev) {
        console.log('[productsService.getOne] Resposta da API:', res.data);
      }
      
      const mapped = await mapProductFromAPI(res.data);
      
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

  /**
   * Busca lista de tamanhos disponíveis
   * GET /products/sizes
   */
  getSizes: async (): Promise<Array<{ id: string; name: string; ml?: number; order?: number }>> => {
    const isDev = process.env.NODE_ENV === 'development';
    try {
      const res = await api.get('/products/sizes');
      if (isDev) {
        console.log('[productsService.getSizes] Tamanhos recebidos:', res.data);
      }
      return res.data || [];
    } catch (error: any) {
      if (isDev) {
        console.warn('[productsService.getSizes] Erro ao buscar tamanhos:', {
          error: error.message,
          response: error.response?.data,
        });
      }
      return [];
    }
  },

  // --- MÉTODOS DE ADMINISTRAÇÃO (PRIVADOS/ADMIN) ---

  create: async (data: any): Promise<Product> => {
    const response = await api.post<any>('/products', data);
    return mapProductFromAPI(response.data);
  },

  update: async (id: string, data: any): Promise<Product> => {
    const response = await api.patch<any>(`/products/${id}`, data);
    return mapProductFromAPI(response.data);
  },

  toggle: async (id: string): Promise<{ id: string; available: boolean }> => {
    const response = await api.patch<{ id: string; available: boolean }>(`/products/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  
  // Novo método para invalidar cache de categorias
  invalidateCategoryCache: () => {
    categoryCache = null;
  }
};
