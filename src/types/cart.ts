// src/types/cart.ts
import { Product } from './product';

// ✅ Definição centralizada dos métodos de pagamento
export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

// Definição de um topping selecionado
export interface SelectedTopping {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isFree: boolean;
  originalId?: string;
}

// Customização completa do item
export interface Customization {
  toppings: SelectedTopping[];
  wantsCutlery: boolean;
  observations?: string;
  sizeId?: string;
  skippedCategories?: string[];
}

export type ItemCustomization = Customization;

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customization?: Customization;
  totalPrice: number;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed' | 'freeDelivery';
  value: number;
  minOrderValue?: number;
}

export type DeliveryType = 'delivery' | 'pickup';

// Interface do Estado do Zustand
export interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  
  // ✅ ADICIONADO: Código em texto para persistência e exibição
  couponCode: string | null;
  
  // ✅ ADICIONADO: Objeto completo (opcional, dependendo da sua lógica mista)
  appliedCoupon: AppliedCoupon | null;

  // Ações
  addItem: (product: Product, quantity: number, customization?: Customization) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  
  setDeliveryFee: (fee: number) => void;

  // ✅ ADICIONADO: Ações necessárias para a integração com Backend
  setCouponCode: (code: string | null) => void;
  setDiscount: (amount: number) => void;
}