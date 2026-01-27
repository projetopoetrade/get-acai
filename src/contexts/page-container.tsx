// components/layout/page-container.tsx
'use client';

import { useUI } from '@/contexts/ui-provider';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  extraPadding?: number;
}

export function PageContainer({ 
  children, 
  className = '', 
  extraPadding = 16 
}: PageContainerProps) {
  const { bottomNavHeight } = useUI();

  return (
    <main
      className={`min-h-dvh ${className}`}
      style={{
        paddingBottom: `${bottomNavHeight + extraPadding}px`,
      }}
    >
      {children}
    </main>
  );
}
