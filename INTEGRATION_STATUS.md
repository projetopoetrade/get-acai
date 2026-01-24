# 📊 Status da Integração Backend-Frontend

> **Última atualização:** 22 de Janeiro de 2026

## ✅ Serviços Criados

Todos os serviços necessários foram criados em `src/services/`:

1. ✅ **products.ts** - Já existia, integrado na página principal
2. ✅ **categories.ts** - Já existia
3. ✅ **toppings.ts** - Criado (GET /toppings, GET /toppings/config)
4. ✅ **orders.ts** - Criado (POST /orders, GET /orders/:id, GET /orders/:id/status, GET /orders)
5. ✅ **coupons.ts** - Criado (POST /coupons/validate)
6. ✅ **delivery.ts** - Criado (POST /delivery/calculate)
7. ✅ **store.ts** - Criado (GET /store/config, GET /store/status)

## ✅ Integrações Completas

### 1. Página Principal (`src/app/page.tsx`)
- ✅ Carrega produtos do backend via `productsService.getAll()`
- ✅ Exibe loading state
- ✅ Filtra produtos por categoria

### 2. Carrinho (`src/app/carrinho/page.tsx`)
- ✅ Validação de cupom via API (`couponsService.validate()`)
- ✅ Mapeia resposta da API para formato do carrinho
- ✅ Tratamento de erros

### 3. Checkout (`src/app/checkout/page.tsx`)
- ✅ Cria pedido via API (`ordersService.create()`)
- ✅ Mapeia itens do carrinho para formato da API
- ✅ Envia dados de pagamento e entrega
- ✅ Tratamento de erros e feedback ao usuário

### 4. Pedidos (`src/app/pedidos/page.tsx`)
- ✅ Busca pedidos do usuário via API (`ordersService.getMyOrders()`)
- ✅ Polling automático para atualizar status (a cada 30s)
- ✅ Estados de loading e erro
- ✅ Fallback para mock em caso de erro

## ⚠️ Integrações Pendentes

### 1. Página de Produto (`src/app/produto/[id]/page.tsx`)
- ⚠️ Ainda usa dados mock de toppings (`src/data/toppings-config.ts`)
- ⚠️ Precisa carregar toppings via `toppingsService.getAll()`
- ⚠️ Precisa carregar configuração via `toppingsService.getConfig()`

**Como integrar:**
```typescript
// Substituir imports mock por:
import { toppingsService } from '@/services/toppings';

// No componente:
const [toppings, setToppings] = useState<Topping[]>([]);
const [config, setConfig] = useState<ToppingsConfig | null>(null);

useEffect(() => {
  Promise.all([
    toppingsService.getAll(),
    toppingsService.getConfig()
  ]).then(([toppingsData, configData]) => {
    setToppings(toppingsData);
    setConfig(configData);
  });
}, []);
```

### 2. Cálculo de Frete (`src/app/checkout/page.tsx`)
- ⚠️ Taxa de entrega está fixa (`DELIVERY_FEE = 5.00`)
- ⚠️ Precisa calcular via `deliveryService.calculate()` quando CEP mudar

**Como integrar:**
```typescript
import { deliveryService } from '@/services/delivery';

// Quando endereço for selecionado ou CEP mudar:
const calculateFee = async (zipCode: string) => {
  try {
    const response = await deliveryService.calculate({ 
      zipCode,
      subtotal: cart.subtotal 
    });
    cart.setDeliveryFee(response.fee);
  } catch (error) {
    // Tratar erro
  }
};
```

### 3. Configuração da Loja
- ⚠️ Header e outras partes ainda usam valores hardcoded
- ⚠️ Precisa carregar via `storeService.getConfig()`

**Onde integrar:**
- `src/components/layout/header.tsx` - WhatsApp, status aberto/fechado
- `src/app/checkout/page.tsx` - Endereço da loja para retirada

## 📝 Notas Importantes

### Autenticação
- O sistema já tem suporte para JWT via cookies
- O interceptor do axios (`src/lib/api.ts`) adiciona token automaticamente
- Se o backend usar localStorage em vez de cookies, ajustar `src/lib/api.ts`

### Mapeamento de Dados

**Carrinho → API:**
- `CartItem` → `OrderItemRequest`
- `SelectedTopping` → `CreateOrderItemToppingRequest`
- Customizações são mapeadas corretamente

**API → Frontend:**
- `Order` do serviço pode precisar de ajustes se estrutura do backend for diferente
- Verificar tipos em `src/services/orders.ts` e `src/types/api.ts`

### Endereços
- Atualmente, endereços são salvos localmente (mock)
- Se backend tiver endpoint de endereços, integrar:
  - GET `/auth/addresses` - Listar endereços
  - POST `/auth/addresses` - Criar endereço
  - DELETE `/auth/addresses/:id` - Remover endereço

### Cupons
- Validação já integrada
- Desconto é aplicado no frontend após validação
- Backend pode recalcular desconto ao criar pedido

## 🔧 Configuração Necessária

### Variáveis de Ambiente
```bash
# .env.local (já configurado)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend Esperado
O backend deve implementar os seguintes endpoints:

**Públicos:**
- `GET /products` - Lista produtos
- `GET /products/:id` - Detalhes do produto
- `GET /products/highlights` - Produtos em destaque
- `GET /toppings` - Lista toppings
- `GET /toppings/config` - Configuração de limites
- `POST /coupons/validate` - Validar cupom
- `POST /delivery/calculate` - Calcular frete
- `POST /orders` - Criar pedido
- `GET /orders` - Listar pedidos (com filtro de telefone se não autenticado)
- `GET /orders/:id` - Detalhes do pedido
- `GET /orders/:id/status` - Status do pedido
- `GET /store/config` - Configurações da loja
- `GET /store/status` - Status aberto/fechado

**Autenticados:**
- `GET /auth/me` - Dados do usuário
- `GET /auth/orders` - Pedidos do usuário (alternativa ao GET /orders)

## 🚀 Próximos Passos

1. **Testar integração com backend real**
   - Verificar se endpoints retornam dados no formato esperado
   - Ajustar mapeamentos se necessário

2. **Completar integrações pendentes**
   - Página de produto com toppings
   - Cálculo de frete dinâmico
   - Configuração da loja no header

3. **Melhorias opcionais**
   - Cache de dados com React Query ou SWR
   - Tratamento de erros mais robusto
   - Loading states mais refinados
   - Retry automático em caso de falha

4. **Testes**
   - Testar fluxo completo: produto → carrinho → checkout → pedido
   - Testar validação de cupom
   - Testar cálculo de frete
   - Testar polling de status do pedido

## 📚 Documentação Relacionada

- `BACKEND_INTEGRATION.md` - Documentação completa de integração
- `src/types/api.ts` - Tipos TypeScript para API
- `src/services/` - Todos os serviços de integração
