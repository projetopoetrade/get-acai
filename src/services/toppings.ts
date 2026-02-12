'use client';

import api from '@/lib/api';

export interface Topping {
  id: string;
  name: string;
  description?: string;
  category: 'frutas' | 'complementos' | 'cremes' | 'caldas' | 'extras';
  categoryId?: string; // ID da categoria da API
  categoryName?: string; // Nome da categoria da API
  price: number;
  imageUrl?: string;
  icon?: string;
  inStock: boolean;
  available?: boolean; // Alias para inStock
  order: number;
  isFree?: boolean;
  isPopular?: boolean;
  isPremium?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  calories?: number;
}

export interface ToppingLimits {
  frutas: number;
  complementos: number;
  cremes: number;
  caldas: number;
  extras: number;
}

export interface SizeConfig {
  id: 'pequeno' | 'medio' | 'grande';
  name: string;
  ml: number;
  limits: ToppingLimits;
}

export interface ToppingsConfig {
  sizes: SizeConfig[];
  defaultLimits: ToppingLimits;
  categoryLabels: Record<string, string>;
  categoryOrder: string[];
}


// Mapear categoria da API para formato interno
const mapCategoryFromAPI = (category: any): 'frutas' | 'complementos' | 'cremes' | 'caldas' | 'extras' => {
  if (typeof category === 'string') {
    const normalized = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('fruta')) return 'frutas';
    if (normalized.includes('complemento')) return 'complementos';
    if (normalized.includes('creme')) return 'cremes';
    if (normalized.includes('calda')) return 'caldas';
    if (normalized.includes('extra') || normalized.includes('premium')) return 'extras';
  }
  if (category?.name) {
    return mapCategoryFromAPI(category.name);
  }
  return 'complementos'; // default
};

export const toppingsService = {

  
  /**
   * Busca todos os toppings disponíveis
   * Nota: Não passamos availableOnly como parâmetro porque o backend espera boolean
   * mas query strings sempre vêm como string. Filtramos no frontend.
   */
  getAll: async (): Promise<Topping[]> => {
    // Nota: Não usamos availableOnly na query porque o backend espera boolean
    // mas query strings sempre vêm como string. Filtramos no frontend.
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('[toppingsService.getAll] Buscando todos os toppings...');
    }
    
    const res = await api.get('/toppings');
    
    if (isDev) {
      console.log('[toppingsService.getAll] Resposta da API (total):', res.data?.length || 0, 'itens');
    }
    
    // Filtrar apenas disponíveis no frontend
    const availableToppings = (res.data || []).filter((t: any) => 
      t.available !== false && t.inStock !== false
    );
    
    if (isDev) {
      console.log('[toppingsService.getAll] Toppings disponíveis:', availableToppings.length, 'itens');
    }
    
    return availableToppings.map((t: any): Topping => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: mapCategoryFromAPI(t.category),
      categoryId: typeof t.category === 'object' ? t.category.id : undefined,
      categoryName: typeof t.category === 'object' ? t.category.name : t.category,
      price: typeof t.price === 'string' ? parseFloat(t.price) : Number(t.price) || 0,
      imageUrl: t.imageUrl,
      icon: t.icon,
      inStock: t.available ?? t.inStock ?? true,
      available: t.available ?? t.inStock ?? true,
      order: t.order || 0,
      isFree: t.isFree ?? false,
      isPopular: t.isPopular ?? false,
      isPremium: t.isPremium ?? false,
      isVegan: t.isVegan,
      isGlutenFree: t.isGlutenFree,
      calories: t.calories,
    }));
  },

  /**
   * Busca configuração de limites por tamanho
   * Nota: Se o endpoint /toppings/config não existir, pode usar /products/sizes/:sizeId/topping-limits
   */
  getConfig: async (): Promise<ToppingsConfig | null> => {
    try {
      const res = await api.get('/toppings/config');
      return res.data;
    } catch {
      // Se não existir, retorna null e usa limites padrão
      return null;
    }
  },

  /**
   * Busca limites de toppings grátis para um produto específico
   */
  getProductLimits: async (
    productId: string
  ): Promise<
    | Array<{
        sizeId: string;
        sizeName: string;
        toppingCategoryId: string;
        toppingCategoryName: string;
        maxQuantity: number;
      }>
    | Partial<Record<Topping['category'], number>>
  > => {
    const isDev = process.env.NODE_ENV === 'development';
    
    try {
      if (isDev) {
        console.log('[toppingsService.getProductLimits] Buscando limites para produto:', productId);
      }
      const res = await api.get(`/products/${productId}/free-topping-limits`);
      if (isDev) {
        console.log('[toppingsService.getProductLimits] Limites recebidos:', res.data);
      }
      return res.data;
    } catch (error: any) {
      if (isDev) {
        console.warn('[toppingsService.getProductLimits] Erro ao buscar limites (usando padrão):', {
          productId,
          error: error.message,
          response: error.response?.data,
        });
      }
      return [];
    }
  },

  /**
   * Busca limites de toppings por tamanho
   */
  getSizeLimits: async (sizeId: string): Promise<Array<{
    toppingCategoryId: string;
    toppingCategoryName: string;
    maxQuantity: number;
  }>> => {
    try {
      const res = await api.get(`/products/sizes/${sizeId}/topping-limits`);
      return res.data;
    } catch {
      return [];
    }
  },

  /**
   * Busca toppings por categoria
   */
  getByCategory: async (category: Topping['category']): Promise<Topping[]> => {
    const allToppings = await toppingsService.getAll();
    return allToppings
      .filter(t => t.category === category && (t.inStock || t.available))
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Busca categorias de toppings
   */
  getCategories: async () => {
    try {
      const res = await api.get('/toppings/categories');
      return res.data;
    } catch {
      return [];
    }
  },
};
