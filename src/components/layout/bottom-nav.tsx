// src/components/layout/bottom-nav.tsx
'use client';

import { Home, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

const navItems = [
  { id: 'home', label: 'Início', icon: Home, href: '/' },
  { id: 'orders', label: 'Pedidos', icon: ClipboardList, href: '/pedidos' },
  { id: 'cart', label: 'Carrinho', icon: ShoppingCart, href: '/carrinho' },
  { id: 'profile', label: 'Perfil', icon: User, href: '/perfil' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const itemCount = cart.itemCount;

  // Não mostrar na página de produto (tem seu próprio footer)
  if (pathname?.startsWith('/produto/')) {
    return null;
  }

  // Não mostrar nas páginas de admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isCart = item.id === 'cart';

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`
                  flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all min-w-[64px]
                  ${isActive 
                    ? 'text-[#9d0094]' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {isCart && itemCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full text-white px-1"
                      style={{ backgroundColor: '#9d0094' }}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
