import { useState, useEffect } from 'react';
import { storeService } from '@/services/store';
import { StoreConfig } from '@/types/api';

export interface StoreStatus {
  isOpen: boolean;
  message?: string;
  hours?: string;
}

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [configData, setConfigData] = useState<Record<string, any> | null>(null);
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const [rawConfigData, statusData] = await Promise.all([
        storeService.getConfig(),
        storeService.getStatus(),
      ]);
      
      // 🔧 MODO DE DESENVOLVIMENTO: Força a loja a ficar sempre aberta
      // Defina NEXT_PUBLIC_DEV_MODE=true no arquivo .env.local para ativar
      const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
      
      // Transforma o configData (Record<string, any>) em StoreConfig
      // Prioriza statusData.isOpen que já vem como boolean correto do endpoint /settings/status
      // ⚠️ FUSO HORÁRIO: O backend usa o fuso horário do servidor para determinar se a loja está aberta
      // Verifique a configuração de timezone do servidor backend (provavelmente UTC ou America/Sao_Paulo)
      let isOpenValue = statusData?.isOpen ?? (rawConfigData.is_open === 'true' || rawConfigData.is_open === true);
      
      // Em modo de desenvolvimento, força a loja a ficar sempre aberta
      if (DEV_MODE) {
        isOpenValue = true;
        console.log('🔧 [DEV MODE] Loja forçada a ficar sempre aberta');
      }
      
      const normalizedConfig: StoreConfig = {
        name: rawConfigData.store_name || 'GetAçaí',
        phone: rawConfigData.store_phone || '',
        whatsapp: rawConfigData.store_phone || '',
        // ✅ Prioriza statusData.isOpen (já vem como boolean correto)
        // Se statusData não tiver isOpen, converte is_open de string para boolean
        isOpen: isOpenValue,
        temporarilyClosed: false,
        // Adiciona outros campos conforme necessário
      } as StoreConfig;
      
      setConfig(normalizedConfig);
      setConfigData(rawConfigData); // Armazena também os dados brutos
      
      // Em modo de desenvolvimento, atualiza o status para refletir que a loja está sempre aberta
      if (DEV_MODE && statusData) {
        setStatus({ ...statusData, isOpen: true });
      } else {
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração da loja:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    // Revalida a cada 5 minutos
    const interval = setInterval(loadConfig, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    config,
    configData, // Dados brutos do banco de dados
    status,
    isLoading,
    isError,
    mutate: loadConfig, // Permite forçar uma atualização dos dados
  };
}