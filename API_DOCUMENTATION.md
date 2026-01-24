# 📚 Documentação da API - GetAçaí Backend

## 🔗 Base URL

```
http://localhost:3001/api
```

## 🔐 Autenticação

A maioria das rotas requer autenticação via JWT. Para obter o token:

1. Faça login ou registro
2. Use o token retornado no header `Authorization: Bearer {token}`

### Exemplo de uso:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Índice

- [Autenticação](#-autenticação)
- [Usuários](#-usuários)
- [Produtos](#-produtos)
- [Toppings](#-toppings)
- [Pedidos](#-pedidos)
- [Endereços](#-endereços)
- [Bairros](#-bairros)
- [Configurações](#-configurações)

---

## 🔑 Autenticação

### POST `/auth/register`
Registrar novo usuário (Público)

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "71999999999" // opcional
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "71999999999"
  }
}
```

---

### POST `/auth/login`
Fazer login (Público)

**Request Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "71999999999"
  }
}
```

---

### GET `/auth/me`
Obter perfil do usuário logado (Requer JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "71999999999",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 👤 Usuários

### PATCH `/users/profile`
Atualizar perfil do usuário (Requer JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "João Silva Santos", // opcional
  "phone": "71988888888" // opcional
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "João Silva Santos",
  "email": "joao@example.com",
  "phone": "71988888888",
  "role": "user"
}
```

---

### POST `/users/change-password`
Alterar senha (Requer JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

**Response (200):**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 🍧 Produtos

### GET `/products`
Listar todos os produtos (Público)

**Query Parameters:**
- `category` (string, opcional): Filtrar por categoria
- `sizeGroup` (string, opcional): Filtrar por grupo de tamanho
- `availableOnly` (boolean, opcional): Apenas produtos disponíveis
- `highlightsOnly` (boolean, opcional): Apenas produtos em destaque

**Exemplo:**
```
GET /api/products?availableOnly=true&category=acai
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Açaí 300ml",
    "description": "Açaí cremoso com 300ml",
    "price": 12.50,
    "originalPrice": 15.00,
    "imageUrl": "https://...",
    "available": true,
    "isCombo": false,
    "isCustomizable": true,
    "hasPromo": true,
    "promoText": "10% OFF",
    "highlightType": "promo",
    "highlightLabel": "Promoção",
    "category": {
      "id": "uuid",
      "name": "Açaí"
    },
    "size": {
      "id": "uuid",
      "name": "300ml"
    }
  }
]
```

---

### GET `/products/highlights`
Listar produtos em destaque (Público)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Açaí 300ml",
    "highlightType": "promo",
    "highlightLabel": "Promoção",
    ...
  }
]
```

---

### GET `/products/categories`
Listar categorias (Público)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Açaí",
    "description": "Açaís cremosos",
    "order": 1
  }
]
```

---

### GET `/products/sizes`
Listar tamanhos disponíveis (Público)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "300ml",
    "description": "Tamanho pequeno",
    "order": 1
  }
]
```

---

### GET `/products/category/:category`
Listar produtos por categoria (Público)

**Exemplo:**
```
GET /api/products/category/acai
```

---

### GET `/products/:id`
Buscar produto por ID (Público)

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Açaí 300ml",
  "description": "Açaí cremoso",
  "price": 12.50,
  "imageUrl": "https://...",
  "available": true,
  "category": { ... },
  "size": { ... }
}
```

---

### GET `/products/:id/free-topping-limits`
Obter limites de toppings grátis por produto (Público)

**Response (200):**
```json
[
  {
    "sizeId": "uuid",
    "sizeName": "300ml",
    "toppingCategoryId": "uuid",
    "toppingCategoryName": "Frutas",
    "maxQuantity": 3
  }
]
```

---

### GET `/products/sizes/:sizeId/topping-limits`
Obter limites de toppings por tamanho (Público)

**Response (200):**
```json
[
  {
    "toppingCategoryId": "uuid",
    "toppingCategoryName": "Frutas",
    "maxQuantity": 3
  }
]
```

---

### POST `/products`
Criar produto (Admin - Requer JWT + Role Admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Açaí 500ml",
  "description": "Açaí cremoso com 500ml",
  "price": 18.00,
  "originalPrice": 20.00, // opcional
  "imageUrl": "https://...",
  "available": true, // opcional, default: true
  "isCombo": false, // opcional
  "isCustomizable": true, // opcional
  "hasPromo": false, // opcional
  "promoText": "10% OFF", // opcional
  "includedToppings": ["uuid1", "uuid2"], // opcional
  "highlightType": "promo", // opcional: "promo" | "bestseller" | "new" | "limited"
  "highlightLabel": "Promoção", // opcional
  "highlightOrder": 1, // opcional
  "categoryId": "uuid",
  "sizeId": "uuid", // opcional
  "sizeGroup": "acai" // opcional
}
```

---

### PATCH `/products/:id`
Atualizar produto (Admin - Requer JWT + Role Admin)

**Request Body:** (todos os campos opcionais, mesmos do POST)

---

### PATCH `/products/:id/stock`
Ajustar estoque (Admin - Requer JWT + Role Admin)

**Request Body:**
```json
{
  "stock": 50 // null = ilimitado
}
```

---

### PATCH `/products/:id/toggle`
Ativar/desativar produto (Admin - Requer JWT + Role Admin)

**Response (200):**
```json
{
  "id": "uuid",
  "available": false
}
```

---

### GET `/products/stock/low`
Listar produtos com estoque baixo (Admin - Requer JWT + Role Admin)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Açaí 300ml",
    "stock": 5
  }
]
```

---

### DELETE `/products/:id`
Deletar produto (Admin - Requer JWT + Role Admin)

**Response (200):**
```json
{
  "message": "Produto deletado com sucesso"
}
```

---

## 🍓 Toppings

### GET `/toppings`
Listar todos os toppings (Público)

**Query Parameters:**
- `category` (string, opcional): Filtrar por categoria
- `availableOnly` (boolean, opcional): Apenas disponíveis
- `popularOnly` (boolean, opcional): Apenas populares
- `freeOnly` (boolean, opcional): Apenas grátis
- `veganOnly` (boolean, opcional): Apenas veganos

**Exemplo:**
```
GET /api/toppings?availableOnly=true&freeOnly=true
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Morango",
    "description": "Morango fresco",
    "price": 2.00,
    "imageUrl": "https://...",
    "icon": "🍓",
    "available": true,
    "isFree": false,
    "isPopular": true,
    "isPremium": false,
    "isVegan": true,
    "isGlutenFree": true,
    "calories": 30,
    "order": 1,
    "category": {
      "id": "uuid",
      "name": "Frutas"
    }
  }
]
```

---

### GET `/toppings/popular`
Listar toppings populares (Público)

---

### GET `/toppings/free`
Listar toppings grátis (Público)

---

### GET `/toppings/categories`
Listar categorias de toppings (Público)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Frutas",
    "description": "Frutas frescas",
    "order": 1
  }
]
```

---

### GET `/toppings/category/:category`
Listar toppings por categoria (Público)

---

### GET `/toppings/:id`
Buscar topping por ID (Público)

---

### POST `/toppings/admin`
Criar topping (Admin - Requer JWT + Role Admin)

**Request Body:**
```json
{
  "name": "Morango",
  "description": "Morango fresco", // opcional
  "price": 2.00,
  "imageUrl": "https://...", // opcional
  "icon": "🍓", // opcional
  "available": true, // opcional, default: true
  "isFree": false, // opcional
  "isPopular": true, // opcional
  "isPremium": false, // opcional
  "order": 1, // opcional
  "calories": 30, // opcional
  "isVegan": true, // opcional
  "isGlutenFree": true, // opcional
  "categoryId": "uuid"
}
```

---

### PATCH `/toppings/admin/:id`
Atualizar topping (Admin - Requer JWT + Role Admin)

**Request Body:** (todos os campos opcionais, mesmos do POST)

---

### PATCH `/toppings/:id/stock`
Ajustar estoque (Admin - Requer JWT + Role Admin)

**Request Body:**
```json
{
  "stock": 30 // null = ilimitado
}
```

---

### PATCH `/toppings/admin/:id/toggle`
Ativar/desativar topping (Admin - Requer JWT + Role Admin)

---

### GET `/toppings/stock/low`
Listar toppings com estoque baixo (Admin - Requer JWT + Role Admin)

---

### DELETE `/toppings/admin/:id`
Deletar topping (Admin - Requer JWT + Role Admin)

---

## 🛒 Pedidos

### POST `/orders`
Criar novo pedido (Requer JWT)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "notes": "Sem açúcar", // opcional
      "toppings": [ // opcional
        {
          "toppingId": "uuid",
          "quantity": 2
        }
      ]
    }
  ],
  "paymentMethod": "pix", // "cash" | "credit_card" | "debit_card" | "pix"
  "deliveryMethod": "delivery", // "pickup" | "delivery"
  "addressId": "uuid", // opcional, obrigatório se deliveryMethod = "delivery"
  "deliveryAddress": "Rua X, 123", // opcional (legado)
  "changeFor": 50.00, // opcional, apenas se paymentMethod = "cash"
  "notes": "Entregar no portão", // opcional
  "couponCode": "PROMO10" // opcional
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "pending",
  "paymentMethod": "pix",
  "deliveryMethod": "delivery",
  "deliveryAddress": "Rua X, 123",
  "deliveryFee": 5.00,
  "subtotal": 25.00,
  "discount": 0,
  "total": 30.00,
  "changeFor": null,
  "notes": "Entregar no portão",
  "couponCode": null,
  "isPaid": false,
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Açaí 300ml",
      "productPrice": 12.50,
      "quantity": 2,
      "subtotal": 25.00,
      "notes": "Sem açúcar",
      "toppings": [
        {
          "id": "uuid",
          "toppingId": "uuid",
          "toppingName": "Morango",
          "toppingPrice": 2.00,
          "quantity": 2
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET `/orders/me`
Listar pedidos do usuário logado (Requer JWT)

**Query Parameters:**
- `status` (OrderStatus, opcional): Filtrar por status
- `limit` (number, opcional): Limite de resultados
- `offset` (number, opcional): Offset para paginação

**Exemplo:**
```
GET /api/orders/me?status=pending&limit=10&offset=0
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "total": 30.00,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "items": [ ... ]
  }
]
```

---

### GET `/orders/pending`
Buscar pedido pendente do usuário (Requer JWT)

**Response (200):**
```json
{
  "id": "uuid",
  "status": "pending",
  ...
}
```

**Response (404):** Se não houver pedido pendente

---

### POST `/orders/repeat-last`
Repetir último pedido (Requer JWT)

**Response (201):** Novo pedido criado com base no último

---

### GET `/orders/:id`
Buscar pedido por ID (Requer JWT - apenas se for dono)

**Response (200):**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "paymentMethod": "pix",
  "deliveryMethod": "delivery",
  "total": 30.00,
  "items": [ ... ],
  "user": { ... },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "confirmedAt": "2024-01-01T00:05:00.000Z"
}
```

---

### GET `/orders/admin/all`
Listar todos os pedidos (Admin - Requer JWT + Role Admin)

**Query Parameters:** (mesmos do GET `/orders/me`)

---

### PATCH `/orders/:id/status`
Atualizar status do pedido (Admin - Requer JWT + Role Admin)

**Request Body:**
```json
{
  "status": "confirmed" // Ver enum OrderStatus abaixo
}
```

**Status válidos:**
- `awaiting_payment`
- `payment_received`
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `delivering`
- `delivered`
- `cancelled`

**Transições válidas:**
- `pending` → `confirmed` | `cancelled`
- `confirmed` → `preparing` | `cancelled`
- `preparing` → `ready`
- `ready` → `delivering` | `delivered`
- `delivering` → `delivered`
- `delivered` → (nenhum)
- `cancelled` → (nenhum)

---

### DELETE `/orders/admin/:id/cancel`
Cancelar qualquer pedido (Admin - Requer JWT + Role Admin)

---

## 📍 Endereços

### GET `/addresses/cep/:cep`
Consultar CEP via ViaCEP (Público)

**Exemplo:**
```
GET /api/addresses/cep/42800000
```

**Response (200):**
```json
{
  "cep": "42800-000",
  "logradouro": "Rua das Flores",
  "complemento": "",
  "bairro": "Centro",
  "localidade": "Camaçari",
  "uf": "BA",
  "ibge": "2905701"
}
```

---

### POST `/addresses`
Criar endereço (Requer JWT)

**Request Body:**
```json
{
  "label": "Casa",
  "cep": "42800000",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apt 45", // opcional
  "neighborhood": "Centro",
  "city": "Camaçari",
  "state": "BA",
  "reference": "Próximo ao supermercado", // opcional
  "isDefault": true // opcional, default: false
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "label": "Casa",
  "cep": "42800-000",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apt 45",
  "neighborhood": "Centro",
  "city": "Camaçari",
  "state": "BA",
  "reference": "Próximo ao supermercado",
  "isDefault": true,
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET `/addresses`
Listar endereços do usuário (Requer JWT)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "label": "Casa",
    "street": "Rua das Flores",
    "number": "123",
    "isDefault": true,
    ...
  }
]
```

---

### GET `/addresses/default`
Buscar endereço padrão (Requer JWT)

---

### GET `/addresses/:id`
Buscar endereço por ID (Requer JWT - apenas se for dono)

---

### PATCH `/addresses/:id`
Atualizar endereço (Requer JWT - apenas se for dono)

**Request Body:** (todos os campos opcionais, mesmos do POST)

---

### PATCH `/addresses/:id/set-default`
Marcar endereço como padrão (Requer JWT - apenas se for dono)

---

### DELETE `/addresses/:id`
Deletar endereço (Requer JWT - apenas se for dono)

---

## 🏘️ Bairros

### GET `/neighborhoods/check/:name`
Verificar taxa de entrega por bairro (Público)

**Exemplo:**
```
GET /api/neighborhoods/check/Jauá
```

**Response (200):**
```json
{
  "name": "Jauá",
  "customDeliveryFee": 12.00,
  "estimatedTime": "50-60 min",
  "active": true
}
```

---

### GET `/neighborhoods/active`
Listar bairros ativos (Público)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Jauá",
    "customDeliveryFee": 12.00,
    "estimatedTime": "50-60 min",
    "active": true
  }
]
```

---

### POST `/neighborhoods`
Criar bairro (Admin - Requer JWT + Role Admin)

**Request Body:**
```json
{
  "name": "Jauá",
  "customDeliveryFee": 12.00,
  "estimatedTime": "50-60 min",
  "active": true, // opcional, default: true
  "notes": "Região de praia" // opcional
}
```

---

### GET `/neighborhoods`
Listar todos os bairros (Admin - Requer JWT + Role Admin)

---

### GET `/neighborhoods/:id`
Buscar bairro por ID (Admin - Requer JWT + Role Admin)

---

### PATCH `/neighborhoods/:id`
Atualizar bairro (Admin - Requer JWT + Role Admin)

**Request Body:** (todos os campos opcionais, mesmos do POST)

---

### PATCH `/neighborhoods/:id/toggle`
Ativar/desativar bairro (Admin - Requer JWT + Role Admin)

---

### DELETE `/neighborhoods/:id`
Deletar bairro (Admin - Requer JWT + Role Admin)

---

## ⚙️ Configurações

### GET `/settings`
Listar todas as configurações (Público)

**Response (200):**
```json
[
  {
    "key": "store_name",
    "value": "GetAçaí",
    "type": "string",
    "label": "Nome da Loja",
    "description": "Nome exibido no app",
    "category": "general",
    "editable": true
  }
]
```

---

### GET `/settings/category/:category`
Buscar configurações por categoria (Público)

**Exemplo:**
```
GET /api/settings/category/general
```

---

### GET `/settings/:key`
Buscar configuração específica (Público)

**Exemplo:**
```
GET /api/settings/store_name
```

**Response (200):**
```json
{
  "key": "store_name",
  "value": "GetAçaí"
}
```

---

### POST `/settings/admin`
Criar configuração (Admin - Requer JWT)

**Request Body:**
```json
{
  "key": "store_name",
  "value": "GetAçaí",
  "type": "string", // "string" | "number" | "boolean" | "json"
  "label": "Nome da Loja", // opcional
  "description": "Nome exibido no app", // opcional
  "category": "general", // opcional
  "editable": true // opcional, default: true
}
```

---

### PATCH `/settings/admin/:key`
Atualizar configuração (Admin - Requer JWT)

**Request Body:**
```json
{
  "value": "GetAçaí Premium"
}
```

---

### DELETE `/settings/admin/:key`
Deletar configuração (Admin - Requer JWT)

---

### POST `/settings/admin/reload-cache`
Recarregar cache de configurações (Admin - Requer JWT)

**Response (200):**
```json
{
  "message": "Cache recarregado com sucesso"
}
```

---

## 📝 Enums

### OrderStatus
```typescript
enum OrderStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  PAYMENT_RECEIVED = 'payment_received',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
```

### PaymentMethod
```typescript
enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix'
}
```

### DeliveryMethod
```typescript
enum DeliveryMethod {
  PICKUP = 'pickup',
  DELIVERY = 'delivery'
}
```

### Role
```typescript
enum Role {
  USER = 'user',
  ADMIN = 'admin'
}
```

---

## 🚨 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Não autorizado (token inválido/expirado)
- `403` - Acesso negado (sem permissão)
- `404` - Não encontrado
- `409` - Conflito (ex: email já cadastrado)
- `500` - Erro interno do servidor

---

## 📌 Notas Importantes

1. **Autenticação**: A maioria das rotas requer JWT. Use o token retornado no login/registro.

2. **Roles**: Algumas rotas requerem role `admin`. Usuários comuns têm role `user`.

3. **Validação**: Todos os campos obrigatórios são validados. Campos opcionais podem ser omitidos.

4. **IDs**: Todos os IDs são UUIDs (strings).

5. **Datas**: Todas as datas são retornadas em formato ISO 8601.

6. **Preços**: Todos os preços são números decimais (ex: 12.50).

7. **Estoque**: `null` em estoque significa ilimitado.

8. **Paginação**: Use `limit` e `offset` para paginar resultados.

9. **Filtros**: Use query parameters para filtrar listagens.

10. **CORS**: A API aceita requisições de `http://localhost:3000` e `http://localhost:3001`.

---

## 🔗 Links Úteis

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Base URL**: `http://localhost:3001/api`

---

**Última atualização**: 2024-01-01
