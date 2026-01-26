'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressService, Address } from '@/services/address';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { useUI } from '@/contexts/ui-provider'; // ✅ Mantendo a integração com o Footer

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
}

export function AddressModal({ isOpen, onClose, onSave }: AddressModalProps) {
  const { setShowBottomNav } = useUI();
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

  // Esconde o footer quando abre
  useEffect(() => {
    if (isOpen) setShowBottomNav(false);
    else setShowBottomNav(true);
    return () => setShowBottomNav(true);
  }, [isOpen, setShowBottomNav]);

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

      document.getElementById('address-number')?.focus();
    } catch (error) {
      toast.error('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setErrors({ [firstError.path[0] as string]: firstError.message });
      toast.error(firstError.message || 'Preencha os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
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
      toast.success('Endereço salvo!');
      onSave(newAddress);
      onClose();
      
      // Reset
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
      toast.error(error.response?.data?.message || 'Erro ao salvar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Container Modal - Centralizado e Compacto */}
      <div className="
        relative 
        bg-white dark:bg-neutral-900 
        w-full max-w-lg
        rounded-2xl 
        shadow-2xl 
        border border-neutral-200 dark:border-neutral-800
        flex flex-col 
        max-h-[90vh]
        animate-in zoom-in-95 duration-200
      ">
        
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Novo Endereço</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Formulário - GRID LAYOUT */}
        <form 
          onSubmit={handleSubmit} 
          className="p-5 overflow-y-auto flex-1 custom-scrollbar"
        >
          <div className="grid grid-cols-12 gap-3">
            
            {/* Linha 1: Nome (8 colunas) + CEP (4 colunas) */}
            <div className="col-span-7 sm:col-span-8 space-y-1.5">
              <Label htmlFor="label" className="text-xs font-semibold uppercase text-neutral-500">Nome</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Ex: Casa"
                className={errors.label ? 'border-red-500' : ''}
              />
            </div>

            <div className="col-span-5 sm:col-span-4 space-y-1.5">
              <Label htmlFor="zipCode" className="text-xs font-semibold uppercase text-neutral-500">CEP</Label>
              <div className="relative">
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={8}
                  className={`pr-8 ${errors.zipCode ? 'border-red-500' : ''}`}
                />
                {loadingCep && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#9d0094]" />
                )}
              </div>
            </div>

            {/* Linha 2: Rua (Full width) */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="street" className="text-xs font-semibold uppercase text-neutral-500">Rua</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Nome da rua"
                className={errors.street ? 'border-red-500' : ''}
              />
            </div>

            {/* Linha 3: Número (3 col) + Complemento (5 col) + Bairro (4 col) */}
            <div className="col-span-3 sm:col-span-3 space-y-1.5">
              <Label htmlFor="number" className="text-xs font-semibold uppercase text-neutral-500">Nº</Label>
              <Input
                id="address-number"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="123"
                className={errors.number ? 'border-red-500' : ''}
              />
            </div>

            <div className="col-span-5 sm:col-span-5 space-y-1.5">
              <Label htmlFor="complement" className="text-xs font-semibold uppercase text-neutral-500">Comp.</Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => handleChange('complement', e.target.value)}
                placeholder="Apto 101"
              />
            </div>

            <div className="col-span-4 sm:col-span-4 space-y-1.5">
              <Label htmlFor="neighborhood" className="text-xs font-semibold uppercase text-neutral-500">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Bairro"
                className={errors.neighborhood ? 'border-red-500' : ''}
              />
            </div>

            {/* Linha 4: Cidade (9 col) + UF (3 col) */}
            <div className="col-span-9 space-y-1.5">
              <Label htmlFor="city" className="text-xs font-semibold uppercase text-neutral-500">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label htmlFor="state" className="text-xs font-semibold uppercase text-neutral-500">UF</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className={`text-center ${errors.state ? 'border-red-500' : ''}`}
              />
            </div>

            {/* Linha 5: Referência (Full) */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="reference" className="text-xs font-semibold uppercase text-neutral-500">Ponto de Referência</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                placeholder="Ex: Ao lado da padaria..."
              />
            </div>

          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 font-medium text-neutral-500 hover:text-neutral-900"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-[2] bg-[#9d0094] hover:bg-[#9d0094]/90 text-white font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Endereço'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}