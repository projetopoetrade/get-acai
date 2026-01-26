'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  showBottomNav: boolean;
  setShowBottomNav: (visible: boolean) => void;
}

const UIContext = createContext<UIContextType>({
  showBottomNav: true,
  setShowBottomNav: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [showBottomNav, setShowBottomNav] = useState(true);

  return (
    <UIContext.Provider value={{ showBottomNav, setShowBottomNav }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);