// src/services/delivery.ts
import api  from '@/lib/api';

export interface DeliveryInfo {
  name: string;
  customDeliveryFee: number;
  estimatedTime: string;
  active: boolean;
}

export const deliveryService = {
  checkNeighborhood: async (neighborhoodName: string): Promise<DeliveryInfo> => {
    try {
      const encodedName = encodeURIComponent(neighborhoodName);
      // Tipamos como 'any' aqui para ler o JSON bruto do backend
      const response = await api.get<any>(`/neighborhoods/check/${encodedName}`);
      
      const data = response.data;
      
      // 🔍 CORREÇÃO AQUI: Mapeando 'fee' para 'customDeliveryFee'
      // O backend manda { fee: 5, neighborhoodName: 'centro', ... }
      const fee = Number(data.fee); 

      return {
        // Mapeia 'neighborhoodName' do back para 'name' do front
        name: data.neighborhoodName || neighborhoodName,
        
        // Mapeia 'fee' do back para 'customDeliveryFee' do front
        customDeliveryFee: isNaN(fee) ? 0 : fee,
        
        estimatedTime: data.estimatedTime || '30-40 min',
        active: true // Se respondeu 200, é porque entrega
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
         throw new Error(`Infelizmente ainda não entregamos no bairro: ${neighborhoodName}`);
      }
      console.error('Erro ao consultar taxa:', error);
      // Retorna taxa 0 em caso de erro para não travar
      return {
        name: neighborhoodName,
        customDeliveryFee: 0,
        estimatedTime: '-',
        active: false
      };
    }
  }
};