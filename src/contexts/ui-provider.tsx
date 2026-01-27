'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UIContextType {
  showBottomNav: boolean;
  setShowBottomNav: (visible: boolean) => void;
  bottomNavHeight: number;
}

const UIContext = createContext<UIContextType>({
  showBottomNav: true,
  setShowBottomNav: () => {},
  bottomNavHeight: 64,
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [bottomNavHeight, setBottomNavHeight] = useState(64);

  useEffect(() => {
    // Calcula a altura real da bottom nav incluindo safe areas
    const calculateNavHeight = () => {
      const nav = document.querySelector('[data-bottom-nav]');
      if (nav) {
        const height = nav.getBoundingClientRect().height;
        setBottomNavHeight(height);
      }
    };

    // Calcula na montagem e quando redimensiona
    calculateNavHeight();
    
    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(calculateNavHeight, 100);
    
    window.addEventListener('resize', calculateNavHeight);
    window.addEventListener('orientationchange', calculateNavHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateNavHeight);
      window.removeEventListener('orientationchange', calculateNavHeight);
    };
  }, [showBottomNav]);

  return (
    <UIContext.Provider value={{ showBottomNav, setShowBottomNav, bottomNavHeight }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
