// components/layout/layout-content.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useUI } from '@/contexts/ui-provider';
import { ReactNode } from 'react';

interface LayoutContentProps {
  children: ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const { bottomNavHeight } = useUI();

  // Páginas que NÃO precisam de padding
  const noPaddingPages = [
    '/produto', // Começa com /produto
    '/admin',   // Começa com /admin
  ];

  const needsPadding = !noPaddingPages.some(page => pathname?.startsWith(page));

  if (!needsPadding) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-dvh"
      style={{
        paddingBottom: `${bottomNavHeight + 16}px`,
      }}
    >
      {children}
    </div>
  );
}
