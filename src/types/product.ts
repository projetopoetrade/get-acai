// src/types/product.ts
// =====================================================
// TIPOS DE PRODUTO - Preparado para integração com API
// =====================================================

export type HighlightType = 'promo' | 'bestseller' | 'new' | 'limited';
export type SizeId = 'pequeno' | 'medio' | 'grande';
export type ProductCategory = 'combos' | 'monte-seu' | 'classicos' | 'complemento' | 'bebidas';

export interface ProductHighlight {
  type: HighlightType;
  label?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  imageUrl: string;
  available: boolean;
  isCombo?: boolean;
  isCustomizable?: boolean;
  hasPromo?: boolean;
  promoText?: string;
  includedToppings?: string[];
  highlight?: ProductHighlight;
  sizeId?: SizeId;
  sizeGroup?: string;
  // Campos para integração com backend
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================
// TIPOS PARA API
// =====================================================

// Resposta da API de produtos
export interface ProductsAPIResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Filtros para busca de produtos
export interface ProductFilters {
  category?: ProductCategory;
  available?: boolean;
  hasPromo?: boolean;
  search?: string;
}

// Payload para criar/atualizar produto
export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  imageUrl: string;
  available: boolean;
  isCombo?: boolean;
  isCustomizable?: boolean;
  hasPromo?: boolean;
  promoText?: string;
  includedToppings?: string[];
  highlight?: ProductHighlight;
  sizeId?: SizeId;
  sizeGroup?: string;
}

/*
ENDPOINTS SUGERIDOS:

GET    /api/products              → Lista produtos (com filtros)
GET    /api/products/:id          → Detalhes do produto
GET    /api/products/highlights   → Produtos em destaque
GET    /api/products/category/:cat → Produtos por categoria

ADMIN:
POST   /api/admin/products        → Criar produto
PUT    /api/admin/products/:id    → Atualizar produto
DELETE /api/admin/products/:id    → Remover produto
PATCH  /api/admin/products/:id/availability → Atualizar disponibilidade
*/
