'use client';

import api from '@/lib/api';
import { StoreConfig } from '@/types/api';

export const storeService = {
  /**
   * Busca configurações completas da loja
   */
  getConfig: async (): Promise<StoreConfig> => {
    const res = await api.get('/store/config');
    return res.data;
  },

  /**
   * Verifica se a loja está aberta
   */
  getStatus: async (): Promise<{ isOpen: boolean; message?: string }> => {
    const res = await api.get('/store/status');
    return res.data;
  },
};
