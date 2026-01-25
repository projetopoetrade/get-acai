// src/services/store.ts
import api from '@/lib/api';
import { StoreConfig } from '@/types/api';

export const storeService = {
  /**
   * Busca todas as configurações e as transforma em um objeto { key: value }
   */
  getConfig: async (): Promise<Record<string, any>> => {
    const res = await api.get('/settings'); // Rota correta do seu controller
    
    // Transforma o Array enviado no seu payload em um objeto prático
    const configMap = res.data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return configMap;
  },

  /**
   * Busca o status calculado (Aberto/Fechado)
   */
  getStatus: async (): Promise<any> => {
    const res = await api.get('/settings/status'); // Rota do getStoreStatus
    return res.data;
  },
};