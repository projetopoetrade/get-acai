// src/components/layout/header.tsx
'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { Circle } from 'lucide-react';

export function Header() {
  const { config, configData, status, isLoading } = useStoreConfig();

  // Determinar se a loja está aberta
  const isOpen = status?.isOpen ?? config?.isOpen ?? false;
  
  // Obter nome da loja
  const storeName = config?.name || configData?.store_name || 'GetAçaí';
  
  // Obter horário de fechamento - usar apenas configData.closing_hour
  const closingHour = configData?.closing_hour || null;
  
  // Formatar mensagem de status
  const getStatusMessage = () => {
    if (isOpen) {
      if (closingHour) {
        return `Aberto até ${closingHour}`;
      } else {
        return 'Aberto';
      }
    } else {
      return 'Fechado';
    }
  };

  return (
    <header className="text-white shadow-lg" style={{ backgroundColor: '#9d0094' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{storeName}</h1>
          {!isLoading && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#fffff0' }}>
              <span 
                className={`w-2 h-2 rounded-full ${isOpen ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isOpen ? '#61c46e' : '#ef4444' }}
              ></span>
              {getStatusMessage()}
            </p>
          )}
          {isLoading && (
            <p className="text-xs" style={{ color: '#fffff0' }}>
              Carregando...
            </p>
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
