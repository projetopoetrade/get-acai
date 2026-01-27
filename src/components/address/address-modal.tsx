'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressService, Address } from '@/services/address';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { useUI } from '@/contexts/ui-provider';

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="
        relative 
        bg-white dark:bg-neutral-900 
        w-full max-w-lg
        rounded-2xl
        shadow-2xl 
        flex flex-col 
        max-h-[90dvh]
        animate-in zoom-in-95 duration-200
      ">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#9d0094]/10 p-2 rounded-full">
               <MapPin className="w-5 h-5 text-[#9d0094]" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Novo Endereço</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form 
          onSubmit={handleSubmit} 
          className="p-6 overflow-y-auto flex-1 custom-scrollbar"
        >
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            
            {/* Apelido */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="label" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Apelido (Ex: Casa)</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Como você chama este local?"
                className={`h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all ${errors.label ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>

            {/* CEP */}
            <div className="col-span-12 sm:col-span-5 space-y-1.5">
              <Label htmlFor="zipCode" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">CEP</Label>
              <div className="relative">
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={8}
                  className={`h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 pr-9 focus:bg-white transition-all ${errors.zipCode ? 'border-red-500 bg-red-50' : ''}`}
                />
                {loadingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#9d0094]" />
                )}
              </div>
            </div>

            {/* Cidade/UF - Read Only */}
            <div className="col-span-12 sm:col-span-7 flex gap-3">
               <div className="flex-1 space-y-1.5">
                  <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Cidade</Label>
                  <div className="h-11 px-3 flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-md text-sm text-neutral-500 border border-transparent">
                    {formData.city}
                  </div>
               </div>
               <div className="w-16 space-y-1.5">
                  <Label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">UF</Label>
                  <div className="h-11 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-md text-sm text-neutral-500 border border-transparent">
                    {formData.state}
                  </div>
               </div>
            </div>

            {/* Rua */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="street" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Endereço</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Rua, Avenida..."
                className={`h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all ${errors.street ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>

            {/* Número e Complemento */}
            <div className="col-span-4 space-y-1.5">
              <Label htmlFor="number" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Número</Label>
              <Input
                id="address-number"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="123"
                className={`h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all ${errors.number ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>

            <div className="col-span-8 space-y-1.5">
              <Label htmlFor="complement" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Complemento</Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => handleChange('complement', e.target.value)}
                placeholder="Apto, Bloco (Opcional)"
                className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all"
              />
            </div>

            {/* Bairro */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="neighborhood" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Nome do bairro"
                className={`h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all ${errors.neighborhood ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>

            {/* Referência */}
            <div className="col-span-12 space-y-1.5">
              <Label htmlFor="reference" className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Ponto de Referência</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                placeholder="Ex: Próximo ao mercado..."
                className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 focus:bg-white transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer Ajustado: Padding reduzido em cima (pt-3) */}
        <div className="px-6 pt-3 pb-5 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-2xl">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-bold bg-[#9d0094] hover:bg-[#9d0094]/90 text-white shadow-lg shadow-[#9d0094]/20 rounded-xl active:scale-[0.98] transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Endereço'}
          </Button>
        </div>
      </div>
    </div>
  );
}