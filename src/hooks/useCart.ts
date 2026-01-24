// src/hooks/useCart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/product';
import { CartItem, CartState, Customization } from '@/types/cart';

// =====================================================
// HELPERS INTERNOS
// =====================================================

// Gera ID único baseado no produto + customizações para agrupar itens idênticos
const generateCartItemId = (productId: string, customization?: Customization): string => {
  if (!customization) return productId;
  
  // Ordenar toppings para que a ordem da seleção não gere IDs diferentes para o mesmo pedido
  const sortedToppings = [...customization.toppings].sort((a, b) => a.id.localeCompare(b.id));
  
  // Cria uma string única baseada nos IDs e quantidades
  const toppingsString = sortedToppings.map(t => `${t.id}:${t.quantity}:${t.isFree}`).join('|');
  
  return `${productId}-${toppingsString}-${customization.wantsCutlery}-${customization.observations || ''}`;
};

// Calcula o preço total de um item (Blindado contra preços em string)
const calculateItemTotal = (product: Product, quantity: number, customization?: Customization): number => {
  // BLINDAGEM: Converte para number caso venha string do backend
  let unitPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  
  if (customization) {
    const toppingsTotal = customization.toppings.reduce((sum, topping) => {
      // Se for grátis, preço é 0. Se pago, usa o preço do topping.
      // BLINDAGEM: Converte preço do topping também
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
      appliedCoupon: null,
      itemCount: 0,

      addItem: (product, quantity, customization) => {
        set((state) => {
          // BLINDAGEM: Sanitizar preço do produto na entrada
          const safeProduct = {
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price)
          };

          const newItemTotal = calculateItemTotal(safeProduct, quantity, customization);
          const itemId = generateCartItemId(safeProduct.id, customization);

          // Verificar se já existe um item idêntico no carrinho
          const existingItemIndex = state.items.findIndex(item => item.id === itemId);

          let newItems;
          if (existingItemIndex > -1) {
            // Atualizar apenas a quantidade
            newItems = [...state.items];
            const existingItem = newItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            
            newItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
              totalPrice: calculateItemTotal(safeProduct, newQuantity, customization),
            };
          } else {
            // Adicionar novo item
            const newItem: CartItem = {
              id: itemId,
              product: safeProduct,
              quantity,
              customization,
              totalPrice: newItemTotal,
            };
            newItems = [...state.items, newItem];
          }

          // Recalcular totais
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          
          return {
            items: newItems,
            subtotal,
            itemCount: newItems.reduce((acc, item) => acc + item.quantity, 0),
            // O total será ajustado abaixo se houver cupom/frete
            total: subtotal + state.deliveryFee - state.discount, 
          };
        });
        
        // Reaplicar regras de cupom (pois o subtotal mudou)
        const { appliedCoupon, applyCoupon } = get();
        if (appliedCoupon) {
          applyCoupon(appliedCoupon);
        } else {
          // Atualizar total sem cupom
          const state = get();
          set({ total: state.subtotal + state.deliveryFee });
        }
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== itemId);
          const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
          
          // Se esvaziar, reseta tudo
          if (newItems.length === 0) {
            return {
              items: [],
              subtotal: 0,
              discount: 0,
              total: 0,
              itemCount: 0,
              appliedCoupon: null,
              deliveryFee: 0 
            };
          }

          return {
            items: newItems,
            subtotal,
            itemCount: newItems.reduce((acc, item) => acc + item.quantity, 0),
            total: subtotal + state.deliveryFee - state.discount,
          };
        });
        
        const { appliedCoupon, applyCoupon, items } = get();
        if (items.length > 0 && appliedCoupon) {
           applyCoupon(appliedCoupon);
        }
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
            total: subtotal + state.deliveryFee - state.discount,
          };
        });

        const { appliedCoupon, applyCoupon } = get();
        if (appliedCoupon) {
          applyCoupon(appliedCoupon);
        } else {
          const state = get();
          set({ total: state.subtotal + state.deliveryFee });
        }
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
          appliedCoupon: null,
          deliveryFee: 0
        });
      },

      applyCoupon: (coupon) => {
        set((state) => {
          let discountAmount = 0;

          // Validação básica de mínimo
          if (coupon.minOrderValue && state.subtotal < coupon.minOrderValue) {
            return state; 
          }

          if (coupon.type === 'percentage') {
            discountAmount = (state.subtotal * coupon.value) / 100;
          } else if (coupon.type === 'fixed') {
            discountAmount = coupon.value;
          } else if (coupon.type === 'freeDelivery') {
             // Abate o valor do frete atual
             discountAmount = state.deliveryFee; 
          }

          // Trava de segurança: desconto não pode ser maior que a compra
          const maxDiscount = state.subtotal + state.deliveryFee;
          if (discountAmount > maxDiscount) {
            discountAmount = maxDiscount;
          }

          return {
            appliedCoupon: coupon,
            discount: discountAmount,
            total: Math.max(0, state.subtotal + state.deliveryFee - discountAmount),
          };
        });
      },

      removeCoupon: () => {
        set((state) => ({
          appliedCoupon: null,
          discount: 0,
          total: state.subtotal + state.deliveryFee,
        }));
      },

      setDeliveryFee: (fee) => {
        set((state) => {
          // Se tiver cupom de frete grátis, o desconto de frete deve acompanhar o novo valor
          const isFreeDelivery = state.appliedCoupon?.type === 'freeDelivery';
          const discount = isFreeDelivery ? fee : state.discount;

          return {
            deliveryFee: fee,
            discount: discount, // Atualiza desconto se for frete grátis
            total: Math.max(0, state.subtotal + fee - discount)
          };
        });
      }

    }),
    {
      name: 'get-acai-cart-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =====================================================
// HELPER EXPORTADO: LÓGICA DE NEGÓCIO DE TOPPINGS
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
  
  // 1. Expandir seleções baseadas na quantidade escolhida
  const toppingsList = toppingsData
    .filter(t => quantities[t.id] > 0)
    .flatMap(t => {
       const qty = quantities[t.id];
       // Cria X cópias do topping para calcular gratuidade individualmente
       return Array(qty).fill(null).map(() => ({
         id: t.id,
         name: t.name,
         // Sanitização crucial aqui também
         price: typeof t.price === 'string' ? parseFloat(t.price) : Number(t.price),
         category: t.category,
       }));
    });

  // 2. Agrupar por categoria para aplicar limites
  const toppingsByCategory: Record<string, typeof toppingsList> = {};
  toppingsList.forEach(t => {
    if(!toppingsByCategory[t.category]) toppingsByCategory[t.category] = [];
    toppingsByCategory[t.category].push(t);
  });

  const finalToppings = [];

  // 3. Aplicar lógica de gratuidade (Limites)
  for (const cat in toppingsByCategory) {
     // Ordenar: Toppings mais caros ganham prioridade para serem cobrados? 
     // REGRA DE NEGÓCIO: Normalmente em açaí, o cliente paga pelo EXCEDENTE.
     // Se ele escolheu 3 frutas e o limite é 2, cobra-se 1.
     // O código abaixo assume que os extras são os últimos da lista.
     
     // Ordenação: Mais baratos primeiro na lista -> Serão "Grátis".
     // (Isso beneficia o cliente se todos tiverem preços diferentes? Depende da regra.
     //  Vamos manter simples: ordem de inserção ou preço).
     const catToppings = toppingsByCategory[cat]; 
     
     const limit = limits[cat] || 0;
     const isSkipped = skippedCategories.includes(cat);
     
     if(isSkipped) continue;

     let usedLimit = 0;
     
     // Consolidar itens iguais (ex: 2x Leite em pó)
     const consolidatedMap = new Map<string, {item: typeof catToppings[0], qty: number, isFree: boolean}>();

     for (const t of catToppings) {
        let isFree = false;
        if (cat !== 'extras' && usedLimit < limit) {
           isFree = true;
           usedLimit++;
        }

        // Chave única para agrupamento: ID + Estado (Grátis/Pago)
        const key = `${t.id}-${isFree}`;
        
        if (consolidatedMap.has(key)) {
            consolidatedMap.get(key)!.qty++;
        } else {
            consolidatedMap.set(key, { item: t, qty: 1, isFree });
        }
     }

     // Converter mapa de volta para array
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