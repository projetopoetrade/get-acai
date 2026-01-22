# 🔌 Guia de Integração com Backend - GetAçaí

> **Última atualização:** Janeiro 2026  
> **Status:** Frontend completo, aguardando backend

Este documento descreve como integrar o frontend do GetAçaí com a API backend. Cada seção contém os endpoints necessários, estrutura de dados e exemplos de implementação.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Endpoints Necessários](#endpoints-necessários)
4. [Integração por Feature](#integração-por-feature)
   - [Produtos](#1-produtos)
   - [Toppings/Acompanhamentos](#2-toppingsacompanhamentos)
   - [Carrinho](#3-carrinho)
   - [Pedidos](#4-pedidos)
   - [Configurações da Loja](#5-configurações-da-loja)
   - [Autenticação (futuro)](#6-autenticação-futuro)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Checklist de Integração](#checklist-de-integração)

---

## Visão Geral

### Arquitetura Atual

```
Frontend (Next.js)
├── Dados mockados em /src/data/
├── Estado global com Zustand (carrinho)
├── Tipos TypeScript em /src/types/
└── Helpers prontos para substituição por API calls
```

### Fluxo de Integração

1. Criar endpoints no backend seguindo a estrutura documentada
2. Configurar variáveis de ambiente
3. Substituir imports de mock por chamadas fetch/axios
4. Testar cada feature individualmente

---

## Configuração Inicial

### 1. Criar arquivo de ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WHATSAPP_NUMBER=5585999999999
```

### 2. Criar cliente HTTP (sugestão)

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na requisição');
  }

  return response.json();
}

// Helpers
export const apiGet = <T>(endpoint: string) => api<T>(endpoint);
export const apiPost = <T>(endpoint: string, data: unknown) => 
  api<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const apiPut = <T>(endpoint: string, data: unknown) => 
  api<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = <T>(endpoint: string) => 
  api<T>(endpoint, { method: 'DELETE' });
```

---

## Endpoints Necessários

### Endpoints Públicos (Cliente)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Lista produtos (com filtros) |
| GET | `/products/:id` | Detalhes do produto |
| GET | `/products/highlights` | Produtos em destaque |
| GET | `/toppings` | Lista toppings disponíveis |
| GET | `/toppings/config` | Limites por tamanho |
| GET | `/store/config` | Configurações da loja |
| GET | `/store/status` | Se está aberta/fechada |
| POST | `/coupons/validate` | Validar cupom |
| POST | `/delivery/calculate` | Calcular frete |
| POST | `/orders` | Criar pedido |
| GET | `/orders/:id` | Detalhes do pedido |
| GET | `/orders/:id/status` | Status (para polling) |

### Endpoints Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/products` | Lista todos (incluindo indisponíveis) |
| POST | `/admin/products` | Criar produto |
| PUT | `/admin/products/:id` | Atualizar produto |
| DELETE | `/admin/products/:id` | Remover produto |
| PATCH | `/admin/products/:id/available` | Toggle disponibilidade |
| GET | `/admin/toppings` | Lista todos toppings |
| POST | `/admin/toppings` | Criar topping |
| PUT | `/admin/toppings/:id` | Atualizar topping |
| PATCH | `/admin/toppings/:id/stock` | Atualizar estoque |
| PUT | `/admin/toppings-config` | Atualizar limites |
| GET | `/admin/orders` | Lista pedidos |
| PATCH | `/admin/orders/:id/status` | Atualizar status |
| GET | `/admin/dashboard` | Estatísticas |

---

## Integração por Feature

### 1. Produtos

#### Arquivo atual: `src/data/products.ts`

#### Estrutura esperada da API:

```typescript
// GET /products
interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// GET /products/:id
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'combos' | 'monte-seu' | 'classicos';
  imageUrl: string;
  available: boolean;
  isCombo?: boolean;
  isCustomizable?: boolean;
  hasPromo?: boolean;
  promoText?: string;
  includedToppings?: string[];
  highlight?: {
    type: 'promo' | 'bestseller' | 'new' | 'limited';
    label: string;
    order: number;
  };
  sizeId?: 'pequeno' | 'medio' | 'grande';
  sizeGroup?: string;
}
```

#### Como integrar:

```typescript
// src/data/products.ts - ANTES (mock)
export const mockProducts: Product[] = [...];
export function getProducts() {
  return mockProducts.filter(p => p.available);
}

// src/data/products.ts - DEPOIS (API)
import { api } from '@/lib/api';

export async function getProducts(filters?: ProductFilters) {
  const params = new URLSearchParams(filters as Record<string, string>);
  return api<ProductsResponse>(`/products?${params}`);
}

export async function getProductById(id: string) {
  return api<Product>(`/products/${id}`);
}

export async function getHighlightedProducts() {
  return api<Product[]>('/products/highlights');
}
```

#### Componentes que precisam atualizar:

- `src/app/page.tsx` → usar `useEffect` + `useState` para carregar produtos
- `src/app/produto/[id]/page.tsx` → carregar produto por ID
- `src/components/menu/highlights-carousel.tsx` → carregar destaques

#### Exemplo de atualização (page.tsx):

```typescript
// ANTES
import { mockProducts } from '@/data/products';
const products = mockProducts.filter(p => p.category === categoryId);

// DEPOIS
import { getProducts } from '@/data/products';
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  getProducts().then(res => {
    setProducts(res.products);
    setLoading(false);
  });
}, []);
```

---

### 2. Toppings/Acompanhamentos

#### Arquivo atual: `src/data/toppings-config.ts`

#### Estrutura esperada da API:

```typescript
// GET /toppings
interface Topping {
  id: string;
  name: string;
  description?: string;
  category: 'frutas' | 'complementos' | 'cremes' | 'caldas' | 'extras';
  price: number;
  imageUrl?: string;
  inStock: boolean;
  order: number;
}

// GET /toppings/config
interface ToppingsConfig {
  sizes: Array<{
    id: 'pequeno' | 'medio' | 'grande';
    name: string;
    ml: number;
    limits: {
      frutas: number;
      complementos: number;
      cremes: number;
      caldas: number;
      extras: number;
    };
  }>;
  defaultLimits: {
    frutas: number;
    complementos: number;
    cremes: number;
    caldas: number;
    extras: number;
  };
  categoryLabels: Record<string, string>;
  categoryOrder: string[];
}
```

#### Como integrar:

```typescript
// src/data/toppings-config.ts - DEPOIS
import { api } from '@/lib/api';

let cachedConfig: ToppingsConfig | null = null;
let cachedToppings: Topping[] | null = null;

export async function getToppingsConfig() {
  if (!cachedConfig) {
    cachedConfig = await api<ToppingsConfig>('/toppings/config');
  }
  return cachedConfig;
}

export async function getToppings() {
  if (!cachedToppings) {
    cachedToppings = await api<Topping[]>('/toppings');
  }
  return cachedToppings;
}

export async function getToppingsByCategory(category: ToppingCategory) {
  const toppings = await getToppings();
  return toppings
    .filter(t => t.category === category && t.inStock)
    .sort((a, b) => a.order - b.order);
}
```

---

### 3. Carrinho

#### Arquivo atual: `src/hooks/useCart.ts`

O carrinho usa **Zustand com persistência local**. Para integrar com backend:

#### Opção A: Manter local + sincronizar ao criar pedido

```typescript
// Ao criar pedido, enviar carrinho completo
const createOrder = async () => {
  const cart = useCart.getState();
  
  const payload = {
    items: cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      customization: item.customization,
    })),
    // ... outros dados
  };

  const order = await api('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  cart.clearCart();
  return order;
};
```

#### Opção B: Sincronizar carrinho em tempo real (usuário logado)

```typescript
// Adicionar métodos de sync ao store
syncWithServer: async () => {
  const serverCart = await api<Cart>('/cart');
  set(serverCart);
},

addItemWithSync: async (product, quantity, customization) => {
  // Adiciona localmente
  get().addItem(product, quantity, customization);
  
  // Sincroniza com servidor
  await api('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId: product.id, quantity, customization }),
  });
},
```

---

### 4. Pedidos

#### Arquivo atual: `src/app/pedidos/page.tsx`

#### Estrutura esperada da API:

```typescript
// POST /orders
interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    customization?: {
      sizeId?: string;
      toppings: Array<{
        toppingId: string;
        quantity: number;
      }>;
      wantsCutlery: boolean;
      observations?: string;
    };
  }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    reference?: string;
  };
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash';
  changeFor?: number;
  couponCode?: string;
}

// GET /orders/:id
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  customer: CustomerInfo;
  deliveryType: string;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  estimatedDeliveryTime?: string;
}
```

#### Como integrar:

```typescript
// src/app/pedidos/page.tsx - DEPOIS
import { api } from '@/lib/api';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar pedidos do usuário (por telefone ou token)
    api<Order[]>('/orders?phone=85999999999')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // Polling para pedidos ativos
  useEffect(() => {
    const activeOrders = orders.filter(o => 
      ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(o.status)
    );

    if (activeOrders.length === 0) return;

    const interval = setInterval(() => {
      activeOrders.forEach(order => {
        api<{ status: string }>(`/orders/${order.id}/status`)
          .then(({ status }) => {
            if (status !== order.status) {
              // Atualizar pedido na lista
              setOrders(prev => prev.map(o => 
                o.id === order.id ? { ...o, status } : o
              ));
            }
          });
      });
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [orders]);

  // ...
}
```

---

### 5. Configurações da Loja

#### Estrutura esperada:

```typescript
// GET /store/config
interface StoreConfig {
  name: string;
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  businessHours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  orderSettings: {
    minOrderValue: number;
    estimatedPrepTime: number;
  };
  deliverySettings: {
    enabled: boolean;
    freeDeliveryMinValue?: number;
    fixedDeliveryFee?: number;
  };
  isOpen: boolean;
}
```

#### Como integrar no Header:

```typescript
// src/components/layout/header.tsx
const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);

useEffect(() => {
  api<StoreConfig>('/store/config').then(setStoreConfig);
}, []);

// Usar storeConfig.isOpen para mostrar "Aberto" ou "Fechado"
// Usar storeConfig.whatsapp para links do WhatsApp
```

---

### 6. Autenticação (Futuro)

#### Fluxo sugerido: OTP via SMS/WhatsApp

```typescript
// POST /auth/login
{ phone: "85999999999" }
// Response: { message: "Código enviado", expiresIn: 300 }

// POST /auth/verify
{ phone: "85999999999", code: "123456" }
// Response: { user: {...}, token: "jwt...", expiresAt: "..." }

// Usar token no header:
// Authorization: Bearer <token>
```

#### Criar contexto de auth:

```typescript
// src/contexts/AuthContext.tsx
interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  verify: (phone: string, code: string) => Promise<void>;
  logout: () => void;
}
```

---

## Variáveis de Ambiente

```bash
# .env.local

# API
NEXT_PUBLIC_API_URL=https://api.getacai.com.br

# WhatsApp (fallback se não vier da API)
NEXT_PUBLIC_WHATSAPP_NUMBER=5585999999999

# Ambiente
NEXT_PUBLIC_ENV=production
```

---

## Checklist de Integração

### Fase 1: Básico (MVP)
- [ ] Configurar variáveis de ambiente
- [ ] Criar cliente HTTP (`src/lib/api.ts`)
- [ ] Integrar lista de produtos
- [ ] Integrar detalhes do produto
- [ ] Integrar lista de toppings
- [ ] Integrar configuração de limites
- [ ] Criar pedido via API
- [ ] Buscar pedidos do usuário
- [ ] Validar cupom via API
- [ ] Calcular frete via API

### Fase 2: Melhorias
- [ ] Integrar status da loja (aberto/fechado)
- [ ] Integrar cálculo de frete
- [ ] Integrar validação de cupom
- [ ] Implementar polling de status do pedido
- [ ] Cache de dados com SWR ou React Query

### Fase 3: Autenticação
- [ ] Criar fluxo de login por OTP
- [ ] Persistir token
- [ ] Proteger rotas de pedidos
- [ ] Histórico de pedidos do usuário
- [ ] Endereços salvos

### Fase 4: Admin
- [ ] Dashboard de pedidos
- [ ] CRUD de produtos
- [ ] CRUD de toppings
- [ ] Configurações da loja
- [ ] Relatórios

---

## Notas de Desenvolvimento

### Tratamento de Erros

```typescript
// Criar hook para erros
function useApiError() {
  const handleError = (error: Error) => {
    toast.error(error.message || 'Erro ao processar requisição');
  };
  return { handleError };
}
```

### Loading States

```typescript
// Usar Suspense ou estado local
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

// Ou com React Query
const { data, isLoading, error } = useQuery(['products'], getProducts);
```

### Cache

Recomendo usar **SWR** ou **React Query** para:
- Cache automático
- Revalidação em foco
- Retry automático
- Estados de loading/error

```bash
npm install @tanstack/react-query
# ou
npm install swr
```

---

## Histórico de Atualizações

| Data | Feature | Descrição |
|------|---------|-----------|
| Jan 2026 | Inicial | Documentação base criada |
| Jan 2026 | Pedidos | Adicionada página de pedidos com WhatsApp |
| Jan 2026 | Carrinho | Página completa com cupom, resumo e endereço |
| Jan 2026 | Checkout | Página de finalização com endereço, pagamento e modal de novo endereço |
| - | - | - |

---

> **Dúvidas?** Entre em contato com a equipe de desenvolvimento.
