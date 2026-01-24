// src/hooks/useAddressForm.ts
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addressService } from '@/services/address';
import { deliveryService } from '@/services/delivery';
import { toast } from 'sonner';
import { useCart } from './useCart';

// Schema de validação
const addressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido').transform(v => v.replace(/\D/g, '')),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  neighborhood: z.string().min(3, 'Bairro obrigatório'),
  city: z.string().min(3, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  complement: z.string().optional(),
  reference: z.string().optional(),
  label: z.string().min(1, 'Dê um nome (ex: Casa)'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

export function useAddressForm() {
  const [loadingCep, setLoadingCep] = useState(false);
  const { setDeliveryFee } = useCart();
  
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      city: 'Camaçari', // Valor padrão do seu negócio
      state: 'BA'
    }
  });

  // Função mágica que busca CEP e já valida a entrega
  const handleCepBlur = useCallback(async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      
      // 1. Busca dados do endereço
      const data = await addressService.getByCep(cep);
      
      // Preenche o formulário
      form.setValue('street', data.logradouro);
      form.setValue('neighborhood', data.bairro);
      form.setValue('city', data.localidade);
      form.setValue('state', data.uf);
      
      // Foca no número
      document.getElementById('address-number')?.focus();

      // 2. Verifica se entrega no bairro retornado
      if (data.bairro) {
        try {
          const deliveryInfo = await deliveryService.checkNeighborhood(data.bairro);
          setDeliveryFee(deliveryInfo.customDeliveryFee);
          toast.success(`Entrega disponível! (+ R$ ${deliveryInfo.customDeliveryFee.toFixed(2)})`);
        } catch (deliveryError: any) {
          toast.error(deliveryError.message);
          setDeliveryFee(0); // Ou bloquear o checkout
        }
      }
      
    } catch (error) {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  }, [form, setDeliveryFee]);

  return {
    form,
    loadingCep,
    handleCepBlur
  };
}