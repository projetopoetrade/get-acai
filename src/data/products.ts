// src/data/products.ts
// =====================================================
// DADOS DE PRODUTOS - Preparado para integração com API
// =====================================================
// TODO: Substituir por chamadas à API quando o backend estiver pronto
// Exemplo: const products = await fetch('/api/products').then(r => r.json())

import { Product, SizeId, ProductCategory } from '@/types/product';

// =====================================================
// CONFIGURAÇÃO DE TAMANHOS
// =====================================================

export interface SizeLabel {
  name: string;
  ml: number;
}

export const SIZE_LABELS: Record<SizeId, SizeLabel> = {
  pequeno: { name: 'Pequeno', ml: 300 },
  medio: { name: 'Médio', ml: 500 },
  grande: { name: 'Grande', ml: 700 },
};

// =====================================================
// CONFIGURAÇÃO DE CATEGORIAS
// =====================================================

export interface CategoryConfig {
  id: ProductCategory;
  name: string;
  description?: string;
  order: number;
  visible: boolean;
}

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  { id: 'combos', name: 'Combos', description: 'Promoções especiais', order: 1, visible: true },
  { id: 'monte-seu', name: 'Monte o Seu', description: 'Personalize seu açaí', order: 2, visible: true },
  { id: 'classicos', name: 'Clássicos', description: 'Açaís pré-montados', order: 3, visible: true },
];

// =====================================================
// 🍇 DADOS DOS PRODUTOS (MOCK)
// =====================================================
// Esta lista será substituída por dados da API

export const mockProducts: Product[] = [
  // ==================== COMBOS ====================
  {
    id: 'combo-1',
    name: 'Promoção de 2 copos de 500ml',
    description: 'Não alteramos a composição dos itens',
    price: 46.90,
    originalPrice: 58.62,
    category: 'combos',
    imageUrl: '/images/products/combo-500ml.jpg',
    available: true,
    isCombo: true,
    hasPromo: true,
    promoText: '20% OFF',
    highlight: {
      type: 'promo',
      label: 'Super Promoção',
      order: 1,
    },
  },
  {
    id: 'combo-2',
    name: 'Combo de sorvetes - 3 de 250ml',
    description: 'Escolha seus sabores favoritos',
    price: 34.90,
    originalPrice: 43.62,
    category: 'combos',
    imageUrl: '/images/products/combo-sorvete.jpg',
    available: true,
    isCombo: true,
    hasPromo: true,
    promoText: '20% OFF',
  },
  {
    id: 'combo-3',
    name: 'Promoção de 2 copos de 330ml',
    description: 'Não alteramos a composição dos itens',
    price: 30.90,
    originalPrice: 38.62,
    category: 'combos',
    imageUrl: '/images/products/combo-330ml.jpg',
    available: true,
    isCombo: true,
    hasPromo: true,
    promoText: '20% OFF',
  },

  // ==================== MONTE O SEU ====================
  {
    id: 'monte-seu-300',
    name: 'Açaí 300ml',
    description: 'Monte seu açaí com acompanhamentos grátis',
    price: 15.00,
    category: 'monte-seu',
    imageUrl: '/images/products/acai-300ml.jpg',
    available: true,
    isCustomizable: true,
    sizeId: 'pequeno',
    sizeGroup: 'monte-seu-acai',
  },
  {
    id: 'monte-seu-500',
    name: 'Açaí 500ml',
    description: 'Monte seu açaí com acompanhamentos grátis',
    price: 22.00,
    category: 'monte-seu',
    imageUrl: '/images/products/acai-500ml.jpg',
    available: true,
    isCustomizable: true,
    sizeId: 'medio',
    sizeGroup: 'monte-seu-acai',
    highlight: {
      type: 'bestseller',
      label: 'Mais Vendido',
      order: 2,
    },
  },
  {
    id: 'monte-seu-700',
    name: 'Açaí 700ml',
    description: 'Monte seu açaí com acompanhamentos grátis',
    price: 28.00,
    category: 'monte-seu',
    imageUrl: '/images/products/acai-700ml.jpg',
    available: true,
    isCustomizable: true,
    sizeId: 'grande',
    sizeGroup: 'monte-seu-acai',
  },

  // ==================== CLÁSSICOS ====================
  {
    id: 'classico-tropical',
    name: 'Açaí Tropical',
    description: 'Açaí com banana, granola e mel',
    price: 18.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-tropical.jpg',
    available: true,
    includedToppings: ['Banana', 'Granola', 'Mel'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-tropical',
    highlight: {
      type: 'bestseller',
      label: 'Mais Vendido',
      order: 3,
    },
  },
  {
    id: 'classico-morango',
    name: 'Açaí Morango Love',
    description: 'Açaí com morango, leite condensado e granola',
    price: 20.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-morango.jpg',
    available: true,
    includedToppings: ['Morango', 'Leite condensado', 'Granola'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-morango',
  },
  {
    id: 'classico-ninho',
    name: 'Açaí Ninho',
    description: 'Açaí com leite em pó Ninho, banana e leite condensado',
    price: 19.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-ninho.jpg',
    available: true,
    includedToppings: ['Leite em pó', 'Banana', 'Leite condensado'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-ninho',
  },
  {
    id: 'classico-nutella',
    name: 'Açaí Nutella',
    description: 'Açaí com Nutella, morango e granola',
    price: 24.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-nutella.jpg',
    available: true,
    hasPromo: false,
    includedToppings: ['Nutella', 'Morango', 'Granola'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-nutella',
    highlight: {
      type: 'new',
      label: 'Novidade',
      order: 4,
    },
  },
  {
    id: 'classico-pacoca',
    name: 'Açaí Paçoquinha',
    description: 'Açaí com paçoca, amendoim e leite condensado',
    price: 19.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-pacoca.jpg',
    available: true,
    includedToppings: ['Paçoca', 'Amendoim', 'Leite condensado'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-pacoca',
  },
  {
    id: 'classico-fitness',
    name: 'Açaí Fitness',
    description: 'Açaí com banana, aveia, granola e mel',
    price: 21.00,
    category: 'classicos',
    imageUrl: '/images/products/acai-fitness.jpg',
    available: true,
    includedToppings: ['Banana', 'Aveia', 'Granola', 'Mel'],
    sizeId: 'pequeno',
    sizeGroup: 'classico-fitness',
    highlight: {
      type: 'limited',
      label: 'Tempo Limitado',
      order: 5,
    },
  },
];

// =====================================================
// HELPERS (serão substituídos por chamadas à API)
// =====================================================

// Obter todos os produtos
// TODO: GET /api/products
export function getProducts(): Product[] {
  return mockProducts.filter(p => p.available);
}

// Obter produtos por categoria
// TODO: GET /api/products?category=:category
export function getProductsByCategory(category: ProductCategory): Product[] {
  return mockProducts.filter(p => p.category === category && p.available);
}

// Obter produto por ID
// TODO: GET /api/products/:id
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

// Obter produtos em destaque
// TODO: GET /api/products/highlights
export function getHighlightedProducts(): Product[] {
  return mockProducts
    .filter(p => p.highlight && p.available)
    .sort((a, b) => (a.highlight?.order ?? 99) - (b.highlight?.order ?? 99));
}

// Obter variantes de tamanho de um produto
// TODO: GET /api/products/:id/variants ou incluir no response do produto
export function getSizeVariants(product: Product): Product[] {
  if (!product.sizeGroup) {
    return [product];
  }

  return mockProducts
    .filter(p => p.sizeGroup === product.sizeGroup && p.available)
    .sort((a, b) => {
      const order: Record<SizeId, number> = { pequeno: 1, medio: 2, grande: 3 };
      return (order[a.sizeId!] || 99) - (order[b.sizeId!] || 99);
    });
}

// Obter categorias visíveis
// TODO: GET /api/categories
export function getVisibleCategories(): CategoryConfig[] {
  return CATEGORIES_CONFIG.filter(c => c.visible).sort((a, b) => a.order - b.order);
}

// Buscar produtos
// TODO: GET /api/products?search=:query
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter(p => 
    p.available && (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    )
  );
}

/*
ENDPOINTS SUGERIDOS PARA O ADMIN:

GET    /api/admin/products              → Lista todos (incluindo indisponíveis)
POST   /api/admin/products              → Criar produto
PUT    /api/admin/products/:id          → Atualizar produto
DELETE /api/admin/products/:id          → Remover produto
PATCH  /api/admin/products/:id/available → Toggle disponibilidade
POST   /api/admin/products/:id/duplicate → Duplicar produto

GET    /api/admin/categories            → Lista categorias
PUT    /api/admin/categories/:id        → Atualizar categoria
POST   /api/admin/categories/reorder    → Reordenar categorias
*/
