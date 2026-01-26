'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Configuração da URL
    const url = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔌 Iniciando Socket.io em:', url);

    if (!url) {
      console.error('❌ ERRO: NEXT_PUBLIC_API_URL não definida');
      return;
    }

    // 2. Conexão
    const socketInstance = io(url, {
        
      path: '/socket.io/',       // Caminho configurado no Nginx
      secure: true,              // Obrigatório para Cloudflare
      reconnectionAttempts: 10,
    });

    // 3. Listeners de Estado da Conexão
    socketInstance.on('connect', () => {
      console.log('✅ WebSocket Conectado! ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket Desconectado:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      // Log silencioso para não poluir o console do usuário final
      console.error('Erro de conexão socket:', err.message);
    });

    // 4. LÓGICA DE NEGÓCIO (O som e o alerta)
    socketInstance.on('newOrder', (order: any) => {
      console.log('🔔 Novo pedido recebido:', order.id);

      // Tocar Som
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.8;
        audio.play().catch((e) => console.log('Autoplay bloqueado pelo navegador:', e));
      } catch (error) {
        console.error('Erro ao tocar som', error);
      }

      // Mostrar Notificação Visual (Toast)
      toast.success(`💰 Novo Pedido: R$ ${Number(order.total).toFixed(2)}`, {
        duration: 10000, // Fica 10 segundos na tela
        position: 'top-right',
        action: {
          label: 'Ver Pedidos',
          onClick: () => window.location.href = '/admin/pedidos'
        },
        style: {
          background: '#10b981', // Verde
          color: 'white',
          border: 'none',
          fontSize: '16px'
        }
      });
    });

    setSocket(socketInstance);

    // 5. Limpeza ao desmontar
    return () => {
      console.log('🛑 Desligando socket...');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook para usar o socket em qualquer componente
export const useSocket = () => {
  return useContext(SocketContext);
};