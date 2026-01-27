// src/hooks/useCart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/product';
import { CartItem, CartState, Customization } from '@/types/cart';

// =====================================================
// HELPERS INTERNOS (Cálculos e IDs)
// =====================================================

const generateCartItemId = (productId: string, customization?: Customization): string => {
  if (!customization) return productId;
  
  // Ordena toppings para evitar duplicidade se a ordem de seleção for diferente
  const sortedToppings = [...customization.toppings].sort((a, b) => a.id.localeCompare(b.id));
  const toppingsString = sortedToppings.map(t => `${t.id}:${t.quantity}:${t.isFree}`).join('|');
  
  return `${productId}-${toppingsString}-${customization.wantsCutlery}-${customization.observations || ''}`;
};

const calculateItemTotal = (product: Product, quantity: number, customization?: Customization): number => {
  let unitPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  
  if (customization) {
    const toppingsTotal = customization.toppings.reduce((sum, topping) => {
      const toppingPrice = topping.isFree ? 0 : (typeof topping.price === 'string' ? parseFloat(topping.price) : Number(topping.price));
      return sum + (toppingPrice * topping.quantity);
    }, 0);
    
    unitPrice += toppingsTotal;
  }

  return unitPrice * quantity;
};

// =====================================================
// STORE ZUSTAND
// =====================================================

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryFee: 0, 
      discount: 0,
      subtotal: 0,
      total: 0,
      appliedCoupon: null, // Objeto completo do cupom (se usar lógica interna)
      couponCode: null,    // ✅ String do código (ex: "NATAL10")
      itemCount: 0,

      // =========================================
      // AÇÕES BÁSICAS DO CARRINHO
      // =========================================

      addItem: (product, quantity, customization) => {
        set((state) => {
          const safeProduct = {
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price)
          };

          const newItemTotal = calculateItemTotal(safeProduct, quantity, customization);
          const itemId = generateCartItemId(safeProduct.id, customization);

          const existingItemIndex = state.items.findIndex(item => item.id === itemId);
          let newItems;

          if (existingItemIndex > -1) {
            newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              totalPrice: calculateItemTotal(safeProduct, newQuantity, customization),
            };
          } else {
            const newItem: CartItem = {
              id: itemId,
              product: safeProduct,
              quantity,
              customization,
              totalPrice: newItemTotal,
            };
            newItems = [...state.items, newItem];
          }

          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          
          return {
            items: newItems,
            subtotal,
            itemCount: newItems.reduce((acc, item) => acc + item.quantity, 0),
            total: Math.max(0, subtotal + state.deliveryFee - state.discount), 
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== itemId);
          
          if (newItems.length === 0) {
            return {
              items: [],
              subtotal: 0,
              discount: 0,
              total: 0,
              itemCount: 0,
              appliedCoupon: null,
              couponCode: null,
              deliveryFee: 0 
            };
          }

          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          return {
            items: newItems,
            subtotal,
            itemCount: newItems.reduce((acc, item) => acc + item.quantity, 0),
            total: Math.max(0, subtotal + state.deliveryFee - state.discount),
          };
        });
      },

      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                totalPrice: calculateItemTotal(item.product, quantity, item.customization),
              };
            }
            return item;
          });

          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);

          return {
            items: newItems,
            subtotal,
            itemCount: newItems.reduce((acc, item) => acc + item.quantity, 0),
            total: Math.max(0, subtotal + state.deliveryFee - state.discount),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
          appliedCoupon: null,
          couponCode: null,
          deliveryFee: 0
        });
      },

      // =========================================
      // ✅ AÇÕES ESPECÍFICAS DE CUPOM E FRETE
      // =========================================

      // Define apenas o valor monetário do desconto (usado pela API)
      setDiscount: (amount: number) => {
        set((state) => ({
          discount: amount,
          total: Math.max(0, state.subtotal + state.deliveryFee - amount)
        }));
      },

      // Define o código do cupom (ex: "BEMVINDO")
      setCouponCode: (code: string | null) => {
        set(() => ({ couponCode: code }));
      },

      // Define a taxa de entrega
      setDeliveryFee: (fee: number) => {
        set((state) => ({
          deliveryFee: fee,
          total: Math.max(0, state.subtotal + fee - state.discount)
        }));
      },

      // (Opcional) Aplica objeto de cupom completo se usar lógica front-end
      applyCoupon: (coupon) => {
        set((state) => {
          let discountAmount = 0;

          if (coupon.minOrderValue && state.subtotal < coupon.minOrderValue) {
            return state; 
          }

          if (coupon.type === 'percentage') {
            discountAmount = (state.subtotal * coupon.value) / 100;
          } else if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
          } else if (coupon.type === 'freeDelivery') {
             discountAmount = state.deliveryFee; 
          }

          const maxDiscount = state.subtotal + state.deliveryFee;
          if (discountAmount > maxDiscount) {
            discountAmount = maxDiscount;
          }

          return {
            appliedCoupon: coupon,
            couponCode: coupon.code,
            discount: discountAmount,
            total: Math.max(0, state.subtotal + state.deliveryFee - discountAmount),
          };
        });
      },

      removeCoupon: () => {
        set((state) => ({
          appliedCoupon: null,
          couponCode: null,
          discount: 0,
          total: state.subtotal + state.deliveryFee,
        }));
      },

    }),
    {
      name: 'get-acai-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =====================================================
// HELPER EXPORTADO: CUSTOMIZAÇÃO
// =====================================================

export const createCustomization = (
  sizeId: string | undefined,
  quantities: Record<string, number>,
  toppingsData: Array<{ id: string; name: string; price: number | string; category: string }>,
  limits: Record<string, number>,
  wantsCutlery: boolean,
  observations: string,
  skippedCategories: string[]
): Customization => {
  
  const toppingsList = toppingsData
    .filter(t => quantities[t.id] > 0)
    .flatMap(t => {
       const qty = quantities[t.id];
       return Array(qty).fill(null).map(() => ({
         id: t.id,
         name: t.name,
         price: typeof t.price === 'string' ? parseFloat(t.price) : Number(t.price),
         category: t.category,
       }));
    });

  const toppingsByCategory: Record<string, typeof toppingsList> = {};
  toppingsList.forEach(t => {
    if(!toppingsByCategory[t.category]) toppingsByCategory[t.category] = [];
    toppingsByCategory[t.category].push(t);
  });

  const finalToppings = [];

  for (const cat in toppingsByCategory) {
      const catToppings = toppingsByCategory[cat]; 
      const limit = limits[cat] || 0;
      const isSkipped = skippedCategories.includes(cat);
      
      if(isSkipped) continue;

      let usedLimit = 0;
      const consolidatedMap = new Map<string, {item: typeof catToppings[0], qty: number, isFree: boolean}>();

      for (const t of catToppings) {
         let isFree = false;
         if (cat !== 'extras' && usedLimit < limit) {
            isFree = true;
            usedLimit++;
         }

         const key = `${t.id}-${isFree}`;
         if (consolidatedMap.has(key)) {
             consolidatedMap.get(key)!.qty++;
         } else {
             consolidatedMap.set(key, { item: t, qty: 1, isFree });
         }
      }

      for (const val of consolidatedMap.values()) {
          finalToppings.push({
              id: val.item.id,
              name: val.item.name,
              price: val.item.price,
              quantity: val.qty,
              isFree: val.isFree
          });
      }
  }

  return {
    toppings: finalToppings,
    wantsCutlery,
    observations
  };
};