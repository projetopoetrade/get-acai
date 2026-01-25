'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressService, Address } from '@/services/address';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { toast } from 'sonner';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
}

export function AddressModal({ isOpen, onClose, onSave }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Camaçari',
    state: 'BA',
    reference: '',
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar CEP ao perder o foco
  const handleCepBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      const data = await addressService.getByCep(cep);
      
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));

      // Foca no campo número
      document.getElementById('address-number')?.focus();
    } catch (error) {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação com Zod
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setErrors({ [firstError.path[0] as string]: firstError.message });
      toast.error(firstError.message || 'Preencha os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      // Converte zipCode para cep e cria o endereço
      const addressData = {
        label: result.data.label,
        cep: result.data.zipCode.replace(/\D/g, ''),
        street: result.data.street,
        number: result.data.number,
        complement: result.data.complement || '',
        neighborhood: result.data.neighborhood,
        city: result.data.city,
        state: result.data.state,
        reference: result.data.reference || '',
        isDefault: false,
      };

      const newAddress = await addressService.create(addressData);
      toast.success('Endereço adicionado com sucesso!');
      onSave(newAddress);
      onClose();
      
      // Reset form
      setFormData({
        label: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'Camaçari',
        state: 'BA',
        reference: '',
      });
      setErrors({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar endereço');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-24 sm:pb-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-10rem)] sm:max-h-none sm:overflow-visible mb-4 sm:mb-6">
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">Adicionar Endereço</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-3.5">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Nome do endereço <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="Ex: Casa, Trabalho"
              className={`h-10 sm:h-11 ${errors.label ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.label && <span className="text-red-500 text-xs mt-1 block">{errors.label}</span>}
          </div>

          {/* CEP */}
          <div className="space-y-1.5">
            <Label htmlFor="zipCode" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              CEP <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
                onBlur={handleCepBlur}
                placeholder="00000000"
                maxLength={8}
                className={`h-10 sm:h-11 pr-10 ${errors.zipCode ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {loadingCep && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#9d0094]" />
              )}
            </div>
            {errors.zipCode && <span className="text-red-500 text-xs mt-1 block">{errors.zipCode}</span>}
          </div>

          {/* Rua */}
          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Rua <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              placeholder="Nome da rua"
              className={`h-10 sm:h-11 ${errors.street ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.street && <span className="text-red-500 text-xs mt-1 block">{errors.street}</span>}
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="number" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address-number"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="123"
                className={`h-10 sm:h-11 ${errors.number ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.number && <span className="text-red-500 text-xs mt-1 block">{errors.number}</span>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="complement" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Complemento
              </Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => handleChange('complement', e.target.value)}
                placeholder="Apto, Bloco"
                className="h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Bairro */}
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Bairro <span className="text-red-500">*</span>
            </Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              placeholder="Nome do bairro"
              className={`h-10 sm:h-11 ${errors.neighborhood ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.neighborhood && <span className="text-red-500 text-xs mt-1 block">{errors.neighborhood}</span>}
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Cidade"
                className={`h-10 sm:h-11 ${errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.city && <span className="text-red-500 text-xs mt-1 block">{errors.city}</span>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Estado <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="BA"
                maxLength={2}
                className={`h-10 sm:h-11 ${errors.state ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {errors.state && <span className="text-red-500 text-xs mt-1 block">{errors.state}</span>}
            </div>
          </div>

          {/* Referência */}
          <div className="space-y-1.5">
            <Label htmlFor="reference" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Ponto de referência
            </Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="Ex: Próximo ao mercado"
              className="h-10 sm:h-11"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 sm:h-11 font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 sm:h-11 bg-[#9d0094] hover:bg-[#9d0094]/90 text-white font-medium shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Endereço'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
