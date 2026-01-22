// src/components/cart/cart-floating-button.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';

export function CartFloatingButton() {
  const cart = useCart();
  const router = useRouter();
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => router.push('/carrinho')}
        className="rounded-full w-16 h-16 shadow-2xl bg-purple-600 hover:bg-purple-700 transition-transform hover:scale-110"
        size="lg"
      >
        <div className="relative">
          <ShoppingCart className="w-7 h-7" />
          <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 bg-red-500 text-white">
            {itemCount}
          </Badge>
        </div>
      </Button>
    </div>
  );
}
