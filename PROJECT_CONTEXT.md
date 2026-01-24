# 📱 Contexto Geral do Projeto Frontend - GetAçaí

> **Data:** 23 de Janeiro de 2026  
> **Status:** Em desenvolvimento ativo - Integração com backend em andamento  
> **Framework:** Next.js 16.1.4 com React 19.2.3

---

## 🎯 Visão Geral

**GetAçaí** é uma aplicação web de delivery de açaí desenvolvida em Next.js. O projeto está na fase de integração com o backend NestJS, com a maioria das funcionalidades já implementadas no frontend e sendo gradualmente conectadas à API real.

### Objetivo
Criar uma experiência completa de pedidos online, desde a visualização do cardápio até o acompanhamento do pedido, com suporte a personalização de produtos (toppings), cupons de desconto, múltiplas formas de pagamento e entrega/retirada.

---

## 🛠️ Stack Tecnológico

### Core
- **Next.js 16.1.4** - Framework React com App Router
- **React 19.2.3** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização

### Gerenciamento de Estado
- **Zustand 5.0.10** - Estado global (carrinho com persistência local)
- **React Hooks** - Estado local dos componentes

### HTTP Client
- **Axios 1.13.2** - Cliente HTTP com interceptors configurados

### Validação
- **Zod 4.3.6** - Validação de schemas
- **React Hook Form 7.71.1** - Gerenciamento de formulários

### UI Components
- **Radix UI** - Componentes acessíveis (Alert Dialog, Tabs, Label, etc.)
- **Lucide React** - Ícones
- **Sonner** - Notificações toast
- **next-themes** - Suporte a dark mode

### Outras Bibliotecas
- **class-variance-authority** - Variantes de componentes
- **clsx** + **tailwind-merge** - Utilitários CSS

---

## 📁 Estrutura do Projeto

```
get-acai/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── page.tsx            # ✅ Homepage (produtos integrados)
│   │   ├── layout.tsx          # Layout principal
│   │   ├── login/              # ✅ Página de login
│   │   ├── cadastro/           # ✅ Página de cadastro
│   │   ├── produto/[id]/       # ✅ Página de produto (toppings integrados)
│   │   ├── carrinho/           # ✅ Carrinho (cupom integrado)
│   │   ├── checkout/           # ✅ Checkout (criar pedido integrado)
│   │   ├── pedidos/            # ✅ Lista de pedidos (API integrada)
│   │   └── perfil/             # ✅ Perfil do usuário
│   │
│   ├── components/             # Componentes React
│   │   ├── layout/             # Header, BottomNav
│   │   ├── menu/               # ProductCard, CategoryTabs, HighlightsCarousel
│   │   ├── produto/            # ToppingItem
│   │   ├── cart/               # CartFloatingButton
│   │   ├── profile/            # ProfileForm, ChangePasswordForm, LogoutButton
│   │   └── ui/                 # Componentes base (Button, Card, Badge, etc.)
│   │
│   ├── services/               # ✅ Serviços de integração com API
│   │   ├── products.ts         # ✅ GET /products, /products/:id, /products/highlights
│   │   ├── categories.ts       # ✅ GET /products/categories
│   │   ├── toppings.ts         # ✅ GET /toppings (filtro no frontend)
│   │   ├── orders.ts           # ✅ POST /orders, GET /orders, GET /orders/:id/status
│   │   ├── coupons.ts          # ✅ POST /coupons/validate
│   │   ├── delivery.ts         # ⚠️ POST /delivery/calculate (criado, não integrado)
│   │   └── store.ts            # ⚠️ GET /store/config, /store/status (criado, não integrado)
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useCart.ts          # ✅ Carrinho com Zustand (persistência local)
│   │   └── useAuth.ts          # Hook de autenticação
│   │
│   ├── lib/                    # Utilitários e helpers
│   │   ├── api.ts              # ✅ Cliente Axios configurado (JWT interceptor)
│   │   ├── auth.ts             # ✅ Server actions de autenticação
│   │   ├── auth-client.ts      # ✅ Helpers client-side de auth
│   │   ├── validations.ts      # ✅ Schemas Zod
│   │   ├── sanitize.ts         # ✅ Funções de sanitização de inputs
│   │   ├── phone-format.ts     # ✅ Formatação de telefone
│   │   └── utils.ts            # Utilitários gerais
│   │
│   ├── types/                  # TypeScript types
│   │   ├── api.ts              # ✅ Tipos da API (Product, Order, Coupon, etc.)
│   │   ├── product.ts          # Tipos de produto
│   │   ├── cart.ts             # Tipos de carrinho
│   │   └── auth.ts             # Tipos de autenticação
│   │
│   └── data/                   # ⚠️ Dados mock (sendo substituídos)
│       ├── products.ts         # Mock de produtos (não usado mais)
│       └── toppings-config.ts # Mock de toppings (não usado mais)
│
├── public/                     # Arquivos estáticos
├── .env.local                  # ✅ Variáveis de ambiente (NEXT_PUBLIC_API_URL)
├── next.config.ts              # ✅ Config Next.js (imagens configuradas)
├── middleware.ts               # ✅ Proteção de rotas
└── package.json                # Dependências
```

---

## ✅ Estado Atual das Integrações

### Completamente Integrado

1. **Página Principal (`src/app/page.tsx`)**
   - ✅ Carrega produtos do backend via `productsService.getAll()`
   - ✅ Filtra produtos por categoria
   - ✅ Estados de loading e erro
   - ✅ Normalização de categorias (remove acentos, case-insensitive)

2. **Carrinho (`src/app/carrinho/page.tsx`)**
   - ✅ Validação de cupom via `couponsService.validate()`
   - ✅ Mapeia resposta da API para formato do carrinho
   - ✅ Tratamento de erros

3. **Checkout (`src/app/checkout/page.tsx`)**
   - ✅ Cria pedido via `ordersService.create()`
   - ✅ Mapeia itens do carrinho para formato da API
   - ✅ Envia dados de pagamento, entrega e endereço
   - ✅ Tratamento de erros

4. **Pedidos (`src/app/pedidos/page.tsx`)**
   - ✅ Busca pedidos via `ordersService.getMyOrders()`
   - ✅ Polling automático de status (a cada 30s)
   - ✅ Estados de loading e erro
   - ✅ Fallback para mock em caso de erro

5. **Página de Produto (`src/app/produto/[id]/page.tsx`)**
   - ✅ Carrega produto via `productsService.getOne()`
   - ✅ Carrega toppings via `toppingsService.getAll()`
   - ✅ Carrega limites de toppings via `toppingsService.getProductLimits()`
   - ✅ Carrega variantes de tamanho (se houver `sizeGroup`)
   - ✅ Estados de loading e erro
   - ✅ Mapeamento de dados da API

### Parcialmente Integrado / Pendente

1. **Cálculo de Frete**
   - ⚠️ Serviço criado (`deliveryService.calculate()`)
   - ⚠️ Não integrado no checkout (taxa fixa `DELIVERY_FEE = 5.00`)
   - **O que falta:** Chamar API quando CEP mudar no checkout

2. **Configuração da Loja**
   - ⚠️ Serviço criado (`storeService.getConfig()`)
   - ⚠️ Não integrado no header (valores hardcoded)
   - **O que falta:** Carregar config no header e usar para WhatsApp/status

3. **Endereços do Usuário**
   - ⚠️ Mock local no checkout
   - **O que falta:** Integrar com endpoints `/auth/addresses` (se existirem)

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Cliente HTTP (`src/lib/api.ts`)

- Base URL configurada via `NEXT_PUBLIC_API_URL`
- Interceptor adiciona JWT automaticamente do `localStorage`
- Interceptor trata 401 (redireciona para login)
- **Nota:** Token está em `localStorage`, mas auth usa cookies (pode precisar ajuste)

### Autenticação

- **Server Actions:** `src/lib/auth.ts` (login, register, getCurrentUser, logout)
- **Client Helpers:** `src/lib/auth-client.ts` (getUserFromCookie)
- **Middleware:** `middleware.ts` protege rotas `/pedidos`, `/perfil`, `/checkout`
- **Token:** JWT armazenado em cookie `access_token` (httpOnly) e `user` (não httpOnly)

---

## 🎨 Decisões Arquiteturais

### 1. Gerenciamento de Estado

**Carrinho:** Zustand com persistência local
- Persiste no `localStorage`
- Não sincroniza com backend (apenas ao criar pedido)
- **Razão:** Melhor UX, funciona offline, mais rápido

**Estado Local:** React `useState` e `useEffect`
- Cada página gerencia seu próprio estado
- Carregamento de dados via `useEffect`

### 2. Validação de Dados

- **Frontend:** Zod schemas em `src/lib/validations.ts`
- **Sanitização:** Funções em `src/lib/sanitize.ts`
- **Backend:** Espera-se que valide também (defesa em camadas)

### 3. Tratamento de Erros

- **Toast notifications:** Usando Sonner
- **Logs:** Condicionados a `NODE_ENV === 'development'`
- **Fallbacks:** Mock data quando API falha (em desenvolvimento)

### 4. Mapeamento de Dados

- **API → Frontend:** Serviços fazem mapeamento necessário
- **Conversão de tipos:** Preços (string → number), categorias (normalização)
- **Fallbacks:** Valores padrão quando dados faltam

### 5. Normalização de Categorias

- Remove acentos e converte para minúsculas
- Permite comparação case-insensitive
- **Razão:** Backend pode retornar "Clássicos" mas frontend usa "classicos"

---

## ⚠️ Problemas Conhecidos e Soluções

### 1. Parâmetro `availableOnly` como Boolean

**Problema:** Backend espera boolean, mas query strings sempre vêm como string.

**Solução Atual:** 
- Não passamos o parâmetro
- Filtramos no frontend após receber todos os toppings

**Solução Ideal (Backend):**
- Usar `@Transform` no DTO ou `ParseBoolPipe` no controller
- Ver `BACKEND_FIX_GUIDE.md` para detalhes

### 2. Preços como String

**Problema:** Backend pode retornar preços como string.

**Solução:** 
- Conversão automática em todos os serviços: `typeof price === 'string' ? parseFloat(price) : Number(price)`
- Verificação de segurança nos componentes: `Number(price || 0).toFixed(2)`

### 3. Mapeamento de `sizeId`

**Problema:** Backend retorna UUID, frontend espera 'pequeno'/'medio'/'grande'.

**Solução:**
- Mapeamento por nome do tamanho (ex: "300ml" → "pequeno")
- Fallback para undefined se não reconhecer

### 4. Categorias de Toppings

**Problema:** Backend retorna objeto `{id, name}`, frontend espera string.

**Solução:**
- Função `mapCategoryFromAPI()` que normaliza
- Mapeia por nome da categoria (ex: "Frutas" → "frutas")

---

## 📋 Convenções de Código

### Nomenclatura

- **Componentes:** PascalCase (`ProductCard.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useCart.ts`)
- **Serviços:** camelCase (`productsService.ts`)
- **Tipos:** PascalCase (`Product`, `Order`)
- **Arquivos:** kebab-case ou camelCase (seguindo padrão do diretório)

### Estrutura de Componentes

```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Componente principal
// 4. Sub-componentes (se houver)
// 5. Helpers (se houver)
```

### Serviços

```typescript
export const serviceName = {
  method1: async (): Promise<Type> => {
    // Logs apenas em dev
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log('...');
    
    const res = await api.get('/endpoint');
    return res.data.map(/* mapeamento */);
  },
};
```

### Tratamento de Erros

```typescript
try {
  // operação
} catch (err: any) {
  console.error('[Context] Erro:', err);
  const errorMessage = err.response?.data?.message || err.message;
  // mostrar erro ao usuário
  throw err; // ou retornar fallback
}
```

---

## 🔌 Integração com Backend

### Base URL
```
http://localhost:3001/api
```

### Autenticação
- **Token:** JWT no header `Authorization: Bearer <token>`
- **Armazenamento:** Cookie `access_token` (httpOnly) + `user` (não httpOnly)
- **Interceptor:** Adiciona token automaticamente do `localStorage` (pode precisar ajuste)

### Endpoints Principais

**Públicos:**
- `GET /products` - Lista produtos
- `GET /products/:id` - Detalhes do produto
- `GET /products/highlights` - Produtos em destaque
- `GET /toppings` - Lista toppings (sem filtro, filtra no frontend)
- `GET /products/:id/free-topping-limits` - Limites de toppings
- `POST /coupons/validate` - Validar cupom
- `POST /orders` - Criar pedido
- `GET /orders` - Listar pedidos
- `GET /orders/:id/status` - Status do pedido

**Autenticados:**
- `GET /auth/me` - Dados do usuário
- `POST /auth/login` - Login
- `POST /auth/register` - Registro

### Formato de Dados

**Produto:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  price: number | string; // Pode vir como string
  imageUrl?: string;
  available: boolean;
  category: { id: string; name: string } | string;
  size?: { id: string; name: string };
  sizeGroup?: string;
}
```

**Topping:**
```typescript
{
  id: string;
  name: string;
  price: number | string;
  category: { id: string; name: string } | string;
  available: boolean;
  inStock?: boolean;
  order: number;
}
```

**Pedido:**
```typescript
{
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  // ... outros campos
}
```

---

## 🚀 Próximos Passos Recomendados

### Prioridade Alta

1. **Integrar cálculo de frete dinâmico**
   - Chamar `deliveryService.calculate()` quando CEP mudar no checkout
   - Atualizar taxa de entrega no carrinho

2. **Integrar configuração da loja**
   - Carregar `storeService.getConfig()` no header
   - Usar para WhatsApp e status aberto/fechado
   - Usar endereço da loja no checkout (retirada)

3. **Corrigir autenticação**
   - Verificar se token está sendo lido corretamente (cookie vs localStorage)
   - Ajustar interceptor se necessário

### Prioridade Média

4. **Cache de dados**
   - Implementar cache para produtos e toppings
   - Usar React Query ou SWR (opcional)

5. **Melhorar tratamento de erros**
   - Retry automático em caso de falha de rede
   - Mensagens de erro mais amigáveis

6. **Otimizações de performance**
   - Lazy loading de imagens
   - Code splitting de rotas
   - Otimização de re-renders

### Prioridade Baixa

7. **Testes**
   - Testes unitários dos serviços
   - Testes de integração dos fluxos principais

8. **Acessibilidade**
   - Revisar ARIA labels
   - Testar navegação por teclado

---

## 📝 Notas Importantes

### Logs de Debug

- Todos os logs estão condicionados a `NODE_ENV === 'development'`
- Erros sempre são logados (importante para debug)
- Logs seguem padrão: `[Context] Mensagem`

### Imagens

- Configurado no `next.config.ts` para permitir:
  - `via.placeholder.com`
  - AWS S3/CloudFront
  - `localhost`
- Adicionar novos domínios conforme necessário

### Dark Mode

- Suportado via `next-themes`
- Toggle no header
- Persiste preferência do usuário

### Responsividade

- Mobile-first design
- Breakpoints Tailwind padrão
- Testado em diferentes tamanhos de tela

---

## 🐛 Problemas Conhecidos

1. **Token em localStorage vs Cookie**
   - Interceptor lê de `localStorage`, mas auth salva em cookie
   - **Status:** Funciona, mas pode precisar ajuste se backend mudar

2. **Filtro de toppings no frontend**
   - Funciona, mas ideal seria no backend
   - **Impacto:** Mínimo (poucos toppings)

3. **Mapeamento de sizeId**
   - Pode falhar se backend usar IDs diferentes
   - **Status:** Funciona para casos comuns

---

## 📚 Documentação Relacionada

- `BACKEND_INTEGRATION.md` - Guia completo de integração
- `API_DOCUMENTATION.md` - Documentação da API do backend
- `INTEGRATION_STATUS.md` - Status detalhado das integrações
- `BACKEND_FIX_GUIDE.md` - Como corrigir `availableOnly` no backend
- `CHANGES_REVIEW.md` - Análise de mudanças recentes

---

## 💡 Dicas para Continuar

1. **Sempre verificar tipos:** Use `src/types/api.ts` como referência
2. **Seguir padrão dos serviços:** Veja `src/services/products.ts` como exemplo
3. **Logs em dev apenas:** Use `process.env.NODE_ENV === 'development'`
4. **Tratar erros:** Sempre try/catch e feedback ao usuário
5. **Mapear dados:** API pode retornar formatos diferentes, sempre mapear
6. **Normalizar:** Categorias, preços, etc. podem precisar normalização

---

## 🎯 Objetivo Final

Ter uma aplicação completamente funcional onde:
- ✅ Usuário navega pelo cardápio
- ✅ Personaliza produtos (toppings)
- ✅ Adiciona ao carrinho
- ✅ Aplica cupons
- ✅ Calcula frete dinamicamente
- ✅ Finaliza pedido
- ✅ Acompanha status em tempo real
- ✅ Gerencia perfil e endereços

**Status Atual:** ~85% completo. Falta principalmente integrações menores (frete, config da loja) e otimizações.

---

> **Última atualização:** 23 de Janeiro de 2026  
> **Próxima revisão:** Após completar integrações pendentes
