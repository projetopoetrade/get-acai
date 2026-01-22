// src/types/cart.ts
// =====================================================
// TIPOS DE CARRINHO - Preparado para integração com API
// =====================================================

import { Product, SizeId } from './product';

// Topping selecionado com quantidade
export interface SelectedTopping {
  toppingId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  isFree: boolean; // Se está dentro do limite grátis
}

// Personalizações do item
export interface ItemCustomization {
  sizeId?: SizeId;
  toppings: SelectedTopping[];
  wantsCutlery: boolean;
  observations?: string;
  skippedCategories?: string[]; // Categorias que o cliente não quis
}

// Item do carrinho
export interface CartItem {
  id: string; // ID único do item no carrinho (diferente do product.id)
  product: Product;
  quantity: number;
  customization?: ItemCustomization;
  unitPrice: number; // Preço unitário (produto + toppings extras)
  totalPrice: number; // unitPrice * quantity
}

// Carrinho completo
export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon?: AppliedCoupon;
  // Metadados
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

// Cupom aplicado
export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed' | 'freeDelivery';
  value: number; // Porcentagem ou valor fixo
  minOrderValue?: number;
}

// =====================================================
// TIPOS PARA API DE PEDIDOS
// =====================================================

export type OrderStatus = 
  | 'pending'      // Aguardando confirmação
  | 'confirmed'    // Confirmado
  | 'preparing'    // Em preparo
  | 'ready'        // Pronto para retirada/entrega
  | 'delivering'   // Saiu para entrega
  | 'delivered'    // Entregue
  | 'cancelled';   // Cancelado

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';
export type DeliveryType = 'delivery' | 'pickup';

// Endereço de entrega
export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
}

// Dados do cliente
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
}

// Pedido completo
export interface Order {
  id: string;
  orderNumber: string; // Número amigável (ex: #1234)
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon?: AppliedCoupon;
  // Cliente e entrega
  customer: CustomerInfo;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  // Pagamento
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  changeFor?: number; // Troco para (quando pagamento em dinheiro)
  // Timestamps
  createdAt: string;
  confirmedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  estimatedDeliveryTime?: string;
}

// Payload para criar pedido
export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    customization?: ItemCustomization;
  }>;
  customer: CustomerInfo;
  deliveryType: DeliveryType;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  couponCode?: string;
  observations?: string;
}

// Resposta da criação do pedido
export interface CreateOrderResponse {
  order: Order;
  pixCode?: string; // QR Code PIX se pagamento for PIX
  pixQrCodeBase64?: string;
}

/*
ENDPOINTS SUGERIDOS:

CLIENTE:
POST   /api/orders                → Criar pedido
GET    /api/orders/:id            → Detalhes do pedido
GET    /api/orders/:id/status     → Status do pedido (para polling)

CUPONS:
POST   /api/coupons/validate      → Validar cupom { code, subtotal }
       Response: { valid, coupon, discountAmount, message }

ADMIN:
GET    /api/admin/orders          → Listar pedidos (com filtros)
PATCH  /api/admin/orders/:id/status → Atualizar status
GET    /api/admin/orders/stats    → Estatísticas
*/
