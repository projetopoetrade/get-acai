// src/hooks/use-delivery-fee.ts
import { useState } from 'react';
import api  from '@/lib/api';

export function useDeliveryFee() {
  const [fee, setFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const calculateFee = async (neighborhood: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/neighborhoods/check/${neighborhood}`);
      setFee(data.fee);
      return data.fee;
    } catch (error) {
      console.error("Erro ao calcular frete", error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  return { fee, calculateFee, loading };
}