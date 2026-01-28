// src/components/admin/product-form-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Save, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Switch } from '@/components/ui/switch';
import { Product } from '@/types/api';
import { productsService } from '@/services/products';
import { Category } from '@/services/categories';
import { toast } from 'sonner';
import { ImageUpload } from '../image-upload';

const productSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço obrigatório'),
  originalPrice: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  
  isCombo: z.boolean().optional(),
  comboCount: z.coerce.number().min(1).optional(),
  // ❌ STOCK REMOVIDO DAQUI
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit, categories }: ProductFormModalProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    // Mantemos 'as any' para garantir que o TypeScript aceite a coerção do Zod sem conflitos
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      isCombo: false,
      comboCount: 1,
    }
  });

  const currentImageUrl = watch('imageUrl');
  const isCombo = watch('isCombo');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        const formatPrice = (val?: number | string) => {
          if (!val) return '';
          const num = typeof val === 'string' ? parseFloat(val) : val;
          return num.toFixed(2).replace('.', ',');
        };

        const catId = typeof productToEdit.category === 'object' 
             ? (productToEdit.category as Category)?.id 
             : productToEdit.category || productToEdit.categoryId;

        reset({
          name: productToEdit.name || '',
          description: productToEdit.description || '',
          price: formatPrice(productToEdit.price),
          originalPrice: formatPrice(productToEdit.originalPrice),
          imageUrl: productToEdit.imageUrl || '',
          categoryId: catId || categories[0]?.id || '',
          isCombo: productToEdit.isCombo || false,
          comboCount: productToEdit.comboCount || 1,
          // ❌ STOCK REMOVIDO DAQUI
        });
      } else {
        reset({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            imageUrl: '',
            categoryId: categories[0]?.id || '',
            isCombo: false,
            comboCount: 1,
            // ❌ STOCK REMOVIDO DAQUI
        });
      }
    }
  }, [isOpen, productToEdit, reset, categories]);

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price.replace(',', '.')),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice.replace(',', '.')) : null,
        imageUrl: data.imageUrl || '',
        categoryId: data.categoryId,
        isCombo: data.isCombo,
        comboCount: data.isCombo ? Number(data.comboCount) : 1,
        // ❌ STOCK REMOVIDO DO PAYLOAD
      };

      if (productToEdit) {
        await productsService.update(productToEdit.id, payload);
        toast.success('Produto atualizado!');
      } else {
        await productsService.create(payload);
        toast.success('Produto criado!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('[ProductFormModal] Erro ao salvar:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90dvh] flex flex-col">
        {/* Header Fixo */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900 z-10 shrink-0">
          <h2 className="text-lg font-bold">
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto flex-1 p-6">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Upload de Imagem */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Foto do Produto</label>
              <ImageUpload 
                value={currentImageUrl}
                onChange={(url: string) => setValue('imageUrl', url)}
                onRemove={() => setValue('imageUrl', '')}
              />
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome do Produto</label>
              <Input {...register('name')} placeholder="Ex: Açaí Turbinado" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Descrição</label>
              <textarea 
                {...register('description')}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva os ingredientes..."
              />
            </div>

            {/* Grid de Preços (Agora apenas 2 colunas) */}
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
               <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Preço (R$)</label>
                  <Input {...register('price')} placeholder="0,00" />
                  {errors.price && <span className="text-red-500 text-[10px]">{errors.price.message}</span>}
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Original (De/Por)</label>
                  <Input {...register('originalPrice')} placeholder="0,00" />
               </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Categoria</label>
              {categories.length === 0 ? (
                <div className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center text-neutral-500">
                  Carregando...
                </div>
              ) : (
                <select 
                  {...register('categoryId')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
              {errors.categoryId && <span className="text-red-500 text-xs">{errors.categoryId.message}</span>}
            </div>

            {/* SEÇÃO DE COMBO */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-[#9d0094]" />
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Configuração de Combo</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium block">Ativar Combo?</label>
                  <span className="text-xs text-neutral-500">Habilita montagem passo-a-passo</span>
                </div>
                <Switch 
                  checked={isCombo} 
                  onCheckedChange={(checked) => setValue('isCombo', checked)} 
                />
              </div>

              {isCombo && (
                <div className="pt-2 animate-in slide-in-from-top-2 fade-in">
                  <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase">Quantidade de Itens</label>
                  <Input 
                    type="number" 
                    min={2} 
                    {...register('comboCount')} 
                    placeholder="Ex: 2" 
                    className="bg-white dark:bg-neutral-900"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Quantos açaís o cliente vai montar neste pedido?</p>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer Fixo */}
        <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button form="product-form" type="submit" disabled={saving} className="bg-[#9d0094] hover:bg-[#7a0073] text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2"/> Salvar</>}
          </Button>
        </div>

      </div>
    </div>
  );
}