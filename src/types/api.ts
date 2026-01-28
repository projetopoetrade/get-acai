// src/types/api.ts
// =====================================================
// TIPOS PARA INTEGRAÇÃO COM API
// =====================================================

// =====================================================
// RESPOSTAS GENÉRICAS
// =====================================================
// Payload para criar pedido
export interface CreateOrderRequest {
  items: OrderItemRequest[];
  paymentMethod: 'pix' | 'cash' | 'credit' | 'debit';
  deliveryMethod: 'delivery' | 'pickup';
  addressId?: string;
  notes?: string;
  changeFor?: number; // para pagamento em dinheiro
  couponCode?: string;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  reference?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  notes?: string;
  toppings?: CreateOrderItemToppingRequest[];
}

export interface CreateOrderItemToppingRequest {
  toppingId: string;
  quantity: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: APIMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface APIMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  categoryId?: string;  // ← para filtro
  category?: string;    // ← para ProductCard
  categoryName?: string;
  originalPrice?: number;
  isCombo?: boolean;
  comboCount?: number;
  size?: {
    id: string;
    name: string;
  };
  stock?: number | null;
}


// =====================================================
// CONFIGURAÇÕES DA LOJA
// =====================================================

export interface StoreConfig {
  // Informações básicas
  name: string;
  description?: string;
  logo?: string;
  phone: string;
  whatsapp?: string;
  email?: string;

  // Endereço
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };



  // Horários de funcionamento
  businessHours: BusinessHours[];

  // Configurações de pedido
  orderSettings: {
    minOrderValue: number;
    maxDeliveryDistance: number; // km
    estimatedPrepTime: number; // minutos
    acceptsScheduledOrders: boolean;
  };

  // Configurações de pagamento
  paymentMethods: PaymentMethodConfig[];

  // Configurações de entrega
  deliverySettings: {
    enabled: boolean;
    freeDeliveryMinValue?: number;
    deliveryFeePerKm?: number;
    fixedDeliveryFee?: number;
    deliveryZones?: DeliveryZone[];
  };

  // Configurações de retirada
  pickupSettings: {
    enabled: boolean;
    discountPercentage?: number;
  };

  // Status da loja
  isOpen: boolean;
  temporarilyClosed: boolean;
  closedMessage?: string;
}

export interface BusinessHours {
  dayOfWeek: number; // 0 = Domingo, 6 = Sábado
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isClosed: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'pix' | 'credit' | 'debit' | 'cash' | 'voucher';
  enabled: boolean;
  icon?: string;
  instructions?: string;
  // Para PIX
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

export interface DeliveryZone {
  id: string;
  name: string;
  neighborhoods: string[];
  fee: number;
  estimatedTime: number; // minutos
}

// =====================================================
// CUPONS
// =====================================================

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'freeDelivery';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  // Restrições
  allowedCategories?: string[];
  allowedProducts?: string[];
  firstPurchaseOnly?: boolean;
}

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  productIds?: string[];
  customerId?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

// =====================================================
// NOTIFICAÇÕES
// =====================================================

export interface Notification {
  id: string;
  type: 'order_status' | 'promo' | 'system';
  title: string;
  message: string;
  orderId?: string;
  imageUrl?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// =====================================================
// AUTENTICAÇÃO (futuro)
// =====================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: SavedAddress[];
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  label: string; // "Casa", "Trabalho", etc.
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
  isDefault: boolean;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  code: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

/*
=====================================================
ENDPOINTS SUGERIDOS
=====================================================

PÚBLICOS:
GET    /api/store/config           → Configurações da loja
GET    /api/store/status           → Se está aberta/fechada
GET    /api/products               → Lista produtos
GET    /api/products/:id           → Detalhes do produto
GET    /api/toppings               → Lista toppings
GET    /api/toppings/config        → Configuração de limites
POST   /api/coupons/validate       → Validar cupom
POST   /api/delivery/calculate     → Calcular frete { zipCode }

PEDIDOS:
POST   /api/orders                 → Criar pedido
GET    /api/orders/:id             → Detalhes do pedido
GET    /api/orders/:id/status      → Status para polling
POST   /api/orders/:id/cancel      → Cancelar pedido (se permitido)

AUTENTICAÇÃO (futuro):
POST   /api/auth/login             → Enviar OTP
POST   /api/auth/verify            → Verificar OTP
GET    /api/auth/me                → Dados do usuário
PUT    /api/auth/me                → Atualizar perfil
GET    /api/auth/orders            → Histórico de pedidos
POST   /api/auth/addresses         → Adicionar endereço
DELETE /api/auth/addresses/:id     → Remover endereço

ADMIN:
GET    /api/admin/orders           → Lista pedidos
PATCH  /api/admin/orders/:id       → Atualizar pedido
GET    /api/admin/dashboard        → Estatísticas
POST   /api/admin/products         → CRUD produtos
POST   /api/admin/toppings         → CRUD toppings
POST   /api/admin/coupons          → CRUD cupons
PUT    /api/admin/store/config     → Atualizar config

WEBHOOKS (para integrações):
POST   /api/webhooks/payment       → Notificação de pagamento
POST   /api/webhooks/delivery      → Atualização de entrega
*/
