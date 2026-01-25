// src/components/admin/product-form-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Product } from '@/types/api';
import { productsService } from '@/services/products';
import { Category } from '@/services/categories';
import { toast } from 'sonner';

// Schema de validação
const productSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço obrigatório'),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Categoria obrigatória'), // Agora valida UUID
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
  categories: Category[]; // ✅ Recebe a lista real do banco
}

export function ProductFormModal({ isOpen, onClose, onSuccess, productToEdit, categories }: ProductFormModalProps) {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        // Modo edição - espera categorias carregarem
        if (categories.length > 0) {
          // Extrai categoryId de diferentes formatos possíveis
          const catId = typeof productToEdit.category === 'object' 
             ? (productToEdit.category as Category)?.id 
             : productToEdit.category || productToEdit.categoryId;
  
    
          // Preenche todos os campos do formulário
          // Converte o preço para string no formato brasileiro (com vírgula)
          let priceStr = '0.00';
          if (productToEdit.price) {
            const priceNum = typeof productToEdit.price === 'string' 
              ? parseFloat(productToEdit.price) 
              : Number(productToEdit.price);
            priceStr = priceNum.toFixed(2).replace('.', ',');
          }
          
          reset({
            name: productToEdit.name || '',
            description: productToEdit.description || '',
            price: priceStr,
            imageUrl: productToEdit.imageUrl || '',
            categoryId: catId || categories[0]?.id || ''
          });
        }
      } else {
        // --- MODO CRIAÇÃO ---
        if (categories.length > 0) {
          reset({
              name: '',
              description: '',
              price: '',
              imageUrl: '',
              categoryId: categories[0]?.id || '' // Seleciona o primeiro por padrão
          });
        }
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
        imageUrl: data.imageUrl || '',
        categoryId: data.categoryId,
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
      console.error('[ProductFormModal] Resposta do erro:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome do Produto</label>
            <Input {...register('name')} placeholder="Ex: Açaí Turbinado" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium mb-1.5">Preço (R$)</label>
               <Input {...register('price')} placeholder="0.00" />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1.5">Categoria</label>
               {/* ✅ SELECT DINÂMICO AGORA */}
               {categories.length === 0 ? (
                 <div className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center text-neutral-500">
                   Carregando categorias...
                 </div>
               ) : (
                 <select 
                   {...register('categoryId')}
                   className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                 >
                   <option value="">Selecione...</option>
                   {categories.map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                   ))}
                 </select>
               )}
               {errors.categoryId && <span className="text-red-500 text-xs">{errors.categoryId.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Descrição</label>
            <textarea 
              {...register('description')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Descreva os ingredientes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">URL da Imagem</label>
            <Input {...register('imageUrl')} placeholder="https://..." />
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-[#9d0094] hover:bg-[#7a0073] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2"/> Salvar</>}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}