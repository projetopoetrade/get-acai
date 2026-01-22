// src/data/toppings-config.ts
// =====================================================
// CONFIGURAÇÃO DE ACOMPANHAMENTOS
// Estrutura preparada para integração com painel admin
// =====================================================

import { SizeId } from '@/types/product';

// =====================================================
// TIPOS
// =====================================================

export type ToppingCategory = 'frutas' | 'complementos' | 'cremes' | 'caldas' | 'extras';

export interface Topping {
  id: string;
  name: string;
  description?: string;
  category: ToppingCategory;
  price: number;
  imageUrl?: string;
  inStock?: boolean; // Vem do backend
  order?: number; // Ordem de exibição
}

export interface ToppingLimits {
  frutas: number;
  complementos: number;
  cremes: number;
  caldas: number;
  extras: number;
}

export interface SizeConfig {
  id: SizeId;
  name: string;
  ml: number;
  limits: ToppingLimits;
}

// =====================================================
// 🎛️ CONFIGURAÇÃO PRINCIPAL - EDITÁVEL VIA ADMIN
// =====================================================
// Esta estrutura pode ser salva/carregada do banco de dados
// Basta substituir por uma chamada API: const CONFIG = await fetch('/api/config')

export const TOPPINGS_CONFIG = {
  // Configuração de tamanhos e seus limites
  sizes: [
    {
      id: 'pequeno' as SizeId,
      name: 'Pequeno',
      ml: 300,
      limits: {
        frutas: 2,
        complementos: 2,
        cremes: 1,
        caldas: 1,
        extras: 0,
      },
    },
    {
      id: 'medio' as SizeId,
      name: 'Médio',
      ml: 500,
      limits: {
        frutas: 3,
        complementos: 3,
        cremes: 1,
        caldas: 2,
        extras: 0,
      },
    },
    {
      id: 'grande' as SizeId,
      name: 'Grande',
      ml: 700,
      limits: {
        frutas: 4,
        complementos: 4,
        cremes: 2,
        caldas: 2,
        extras: 0,
      },
    },
  ] as SizeConfig[],

  // Limites padrão (para produtos sem tamanho definido)
  defaultLimits: {
    frutas: 2,
    complementos: 2,
    cremes: 1,
    caldas: 1,
    extras: 0,
  } as ToppingLimits,

  // Labels das categorias
  categoryLabels: {
    frutas: 'Frutas',
    complementos: 'Complementos',
    cremes: 'Cremes',
    caldas: 'Caldas',
    extras: 'Extras Premium',
  } as Record<ToppingCategory, string>,

  // Ordem de exibição das categorias
  categoryOrder: ['frutas', 'complementos', 'cremes', 'caldas', 'extras'] as ToppingCategory[],
};

// =====================================================
// 🍓 LISTA DE TOPPINGS - EDITÁVEL VIA ADMIN
// =====================================================
// Esta lista pode ser carregada do banco de dados

export const TOPPINGS: Topping[] = [
  // ==================== FRUTAS ====================
  {
    id: 'topping-morango',
    name: 'Morango',
    description: 'Morangos frescos fatiados',
    category: 'frutas',
    price: 4.00,
    imageUrl: '/images/toppings/morango.jpg',
    inStock: true,
    order: 1,
  },
  {
    id: 'topping-banana',
    name: 'Banana',
    description: 'Banana nanica em rodelas',
    category: 'frutas',
    price: 2.00,
    imageUrl: '/images/toppings/banana.jpg',
    inStock: true,
    order: 2,
  },
  {
    id: 'topping-kiwi',
    name: 'Kiwi',
    description: 'Kiwi fresco picado',
    category: 'frutas',
    price: 5.00,
    imageUrl: '/images/toppings/kiwi.jpg',
    inStock: true,
    order: 3,
  },
  {
    id: 'topping-manga',
    name: 'Manga',
    description: 'Manga palmer em cubos',
    category: 'frutas',
    price: 4.00,
    imageUrl: '/images/toppings/manga.jpg',
    inStock: true,
    order: 4,
  },
  {
    id: 'topping-uva',
    name: 'Uva',
    description: 'Uvas verdes sem sementes',
    category: 'frutas',
    price: 4.00,
    imageUrl: '/images/toppings/uva.jpg',
    inStock: true,
    order: 5,
  },

  // ==================== COMPLEMENTOS ====================
  {
    id: 'topping-granola',
    name: 'Granola',
    description: 'Granola crocante artesanal',
    category: 'complementos',
    price: 3.00,
    imageUrl: '/images/toppings/granola.jpg',
    inStock: true,
    order: 1,
  },
  {
    id: 'topping-leite-po',
    name: 'Leite em pó',
    description: 'Leite Ninho cremoso',
    category: 'complementos',
    price: 2.50,
    imageUrl: '/images/toppings/leite-po.jpg',
    inStock: true,
    order: 2,
  },
  {
    id: 'topping-pacoca',
    name: 'Paçoca',
    description: 'Paçoca triturada na hora',
    category: 'complementos',
    price: 2.00,
    imageUrl: '/images/toppings/pacoca.jpg',
    inStock: true,
    order: 3,
  },
  {
    id: 'topping-amendoim',
    name: 'Amendoim',
    description: 'Amendoim torrado crocante',
    category: 'complementos',
    price: 2.00,
    imageUrl: '/images/toppings/amendoim.jpg',
    inStock: true,
    order: 4,
  },
  {
    id: 'topping-aveia',
    name: 'Aveia',
    description: 'Aveia em flocos finos',
    category: 'complementos',
    price: 2.00,
    imageUrl: '/images/toppings/aveia.jpg',
    inStock: true,
    order: 5,
  },
  {
    id: 'topping-coco-ralado',
    name: 'Coco ralado',
    description: 'Coco fresco ralado',
    category: 'complementos',
    price: 2.50,
    imageUrl: '/images/toppings/coco-ralado.jpg',
    inStock: true,
    order: 6,
  },

  // ==================== CREMES ====================
  {
    id: 'topping-leite-condensado',
    name: 'Leite condensado',
    description: 'Leite Moça tradicional',
    category: 'cremes',
    price: 3.00,
    imageUrl: '/images/toppings/leite-condensado.jpg',
    inStock: true,
    order: 1,
  },
  {
    id: 'topping-creme-ninho',
    name: 'Creme de Ninho',
    description: 'Creme especial de leite Ninho',
    category: 'cremes',
    price: 4.00,
    imageUrl: '/images/toppings/creme-ninho.jpg',
    inStock: true,
    order: 2,
  },
  {
    id: 'topping-creme-morango',
    name: 'Creme de morango',
    description: 'Creme rosé de morango',
    category: 'cremes',
    price: 3.50,
    imageUrl: '/images/toppings/creme-morango.jpg',
    inStock: true,
    order: 3,
  },
  {
    id: 'topping-creme-chocolate',
    name: 'Creme de chocolate',
    description: 'Creme belga de chocolate',
    category: 'cremes',
    price: 4.00,
    imageUrl: '/images/toppings/creme-chocolate.jpg',
    inStock: true,
    order: 4,
  },
  {
    id: 'topping-nutella',
    name: 'Nutella',
    description: 'Creme de avelã original',
    category: 'cremes',
    price: 6.00,
    imageUrl: '/images/toppings/nutella.jpg',
    inStock: true,
    order: 5,
  },

  // ==================== CALDAS ====================
  {
    id: 'topping-mel',
    name: 'Mel',
    description: 'Mel puro de abelha',
    category: 'caldas',
    price: 3.00,
    imageUrl: '/images/toppings/mel.jpg',
    inStock: true,
    order: 1,
  },
  {
    id: 'topping-calda-chocolate',
    name: 'Calda de chocolate',
    description: 'Chocolate belga derretido',
    category: 'caldas',
    price: 3.50,
    imageUrl: '/images/toppings/chocolate.jpg',
    inStock: true,
    order: 2,
  },
  {
    id: 'topping-calda-morango',
    name: 'Calda de morango',
    description: 'Geleia artesanal de morango',
    category: 'caldas',
    price: 3.50,
    imageUrl: '/images/toppings/calda-morango.jpg',
    inStock: true,
    order: 3,
  },
  {
    id: 'topping-calda-caramelo',
    name: 'Calda de caramelo',
    description: 'Caramelo cremoso artesanal',
    category: 'caldas',
    price: 3.50,
    imageUrl: '/images/toppings/calda-caramelo.jpg',
    inStock: true,
    order: 4,
  },

  // ==================== EXTRAS PREMIUM ====================
  {
    id: 'topping-bis',
    name: 'Bis',
    description: 'Chocolate Bis triturado',
    category: 'extras',
    price: 4.00,
    imageUrl: '/images/toppings/bis.jpg',
    inStock: true,
    order: 1,
  },
  {
    id: 'topping-kitkat',
    name: 'KitKat',
    description: 'KitKat em pedaços',
    category: 'extras',
    price: 5.00,
    imageUrl: '/images/toppings/kitkat.jpg',
    inStock: true,
    order: 2,
  },
  {
    id: 'topping-confete',
    name: 'Confete',
    description: 'Confete colorido crocante',
    category: 'extras',
    price: 3.00,
    imageUrl: '/images/toppings/confete.jpg',
    inStock: true,
    order: 3,
  },
  {
    id: 'topping-choco-ball',
    name: 'Choco Ball',
    description: 'Bolinhas de chocolate crocantes',
    category: 'extras',
    price: 3.50,
    imageUrl: '/images/toppings/choco-ball.jpg',
    inStock: true,
    order: 4,
  },
  {
    id: 'topping-oreo',
    name: 'Oreo',
    description: 'Biscoito Oreo triturado',
    category: 'extras',
    price: 4.50,
    imageUrl: '/images/toppings/oreo.jpg',
    inStock: true,
    order: 5,
  },
];

// =====================================================
// HELPERS (usados pelo frontend)
// =====================================================

// Exporta labels para uso direto
export const TOPPING_CATEGORY_LABELS = TOPPINGS_CONFIG.categoryLabels;

// Obter limite por tamanho e categoria
export function getToppingLimit(sizeId: SizeId | undefined, category: ToppingCategory): number {
  if (!sizeId) return TOPPINGS_CONFIG.defaultLimits[category];
  
  const sizeConfig = TOPPINGS_CONFIG.sizes.find(s => s.id === sizeId);
  return sizeConfig?.limits[category] ?? TOPPINGS_CONFIG.defaultLimits[category];
}

// Obter toppings por categoria (filtra por estoque)
export function getToppingsByCategory(category: ToppingCategory, includeOutOfStock = false): Topping[] {
  return TOPPINGS
    .filter((t) => {
      const matchCategory = t.category === category;
      const inStock = includeOutOfStock || t.inStock !== false;
      return matchCategory && inStock;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// Obter todas as categorias na ordem correta
export function getAllToppingCategories(): ToppingCategory[] {
  return TOPPINGS_CONFIG.categoryOrder;
}

// Obter topping por ID
export function getToppingById(id: string): Topping | undefined {
  return TOPPINGS.find((t) => t.id === id);
}

// Verificar se topping está disponível
export function isToppingAvailable(topping: Topping): boolean {
  return topping.inStock !== false;
}

// =====================================================
// TIPOS PARA API DO ADMIN
// =====================================================
// Use estes tipos ao criar os endpoints do painel admin

export type ToppingsConfigAPI = typeof TOPPINGS_CONFIG;
export type ToppingAPI = Topping;

/*
EXEMPLO DE ENDPOINTS PARA O ADMIN:

GET  /api/admin/toppings-config     → Retorna TOPPINGS_CONFIG
PUT  /api/admin/toppings-config     → Atualiza TOPPINGS_CONFIG (limites, labels, etc.)

GET  /api/admin/toppings            → Lista todos os toppings
POST /api/admin/toppings            → Cria novo topping
PUT  /api/admin/toppings/:id        → Atualiza topping
DELETE /api/admin/toppings/:id      → Remove topping

PATCH /api/admin/toppings/:id/stock → Atualiza estoque (inStock: true/false)
*/
