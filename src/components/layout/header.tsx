// src/components/layout/header.tsx
'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="text-white shadow-lg" style={{ backgroundColor: '#9d0094' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">GetAçaí</h1>
          <p className="text-xs flex items-center gap-1.5" style={{ color: '#fffff0' }}>
            <span 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: '#61c46e' }}
            ></span>
            Aberto até 23h • Sem pedido mínimo
          </p>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
