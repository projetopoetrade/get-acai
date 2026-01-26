'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Power, PackageOpen, Loader2, AlertTriangle } from 'lucide-react';
import { productsService } from '@/services/products';
import { categoriesService, Category } from '@/services/categories';
import { Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/admin/admin-guard';
import Image from 'next/image';
import { ProductFormModal } from '@/components/admin/product-form-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Lista de categorias do backend
  const [categories, setCategories] = useState<Category[]>([]);

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll(false);
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const toggleAvailability = async (product: Product) => {
    try {
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, available: !p.available } : p
      ));
      
      await productsService.toggle(product.id);
      toast.success(`${product.name} ${!product.available ? 'ativado' : 'pausado'}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
      loadProducts();
    }
  };

  // ✅ Nova Lógica de Deleção com Toast.Promise
  const handleDeleteProduct = async (id: string, name: string) => {
    const deletePromise = productsService.delete(id);

    toast.promise(deletePromise, {
      loading: `Removendo ${name} do cardápio...`,
      success: () => {
        setProducts(prev => prev.filter(p => p.id !== id));
        return `${name} foi excluído com sucesso.`;
      },
      error: 'Não foi possível excluir o produto.',
    });
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
        
        {/* Header Superior */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Cardápio</h1>
              <Button onClick={handleNewProduct} className="bg-[#9d0094] hover:bg-[#8a0080] text-white gap-2 rounded-2xl px-6 h-11 shadow-lg shadow-purple-200 dark:shadow-none transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Novo Item
              </Button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400 group-focus-within:text-[#9d0094] transition-colors" />
              <Input 
                placeholder="O que você está procurando?" 
                className="pl-12 h-12 bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#9d0094]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#9d0094]" />
              <p className="text-neutral-500 font-medium">Buscando seu cardápio...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-[32px] border border-dashed border-neutral-200 dark:border-neutral-800">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500 font-medium text-lg">Nenhum item por aqui ainda.</p>
              <Button variant="link" onClick={handleNewProduct} className="text-[#9d0094]">Comece cadastrando um açaí!</Button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 rounded-[28px] border transition-all hover:shadow-md ${
                  !product.available ? 'opacity-70 grayscale-[0.5] bg-neutral-50/50' : 'border-neutral-100 dark:border-neutral-800'
                }`}
              >
                {/* Preview Image */}
                <div className="relative w-24 h-24 rounded-[20px] overflow-hidden bg-neutral-100 flex-shrink-0 border-2 border-white dark:border-neutral-800 shadow-inner">
                  {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill 
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageOpen className="w-8 h-8 text-neutral-200" />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate">{product.name}</h3>
                    {!product.available && (
                      <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Pausado</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-1 mb-2 leading-tight">{product.description || 'Delicioso açaí montado do seu jeito.'}</p>
                  <p className="text-xl font-black text-[#9d0094]">R$ {Number(product.price).toFixed(2)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button 
                    onClick={() => toggleAvailability(product)}
                    className={`p-3 rounded-2xl transition-all active:scale-90 ${
                      product.available 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all active:scale-90"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-90">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </AlertDialogTrigger>
                    
                    <AlertDialogContent className="rounded-[40px] border-none p-8 bg-white dark:bg-neutral-900 shadow-2xl max-w-sm mx-auto">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full animate-bounce">
                          <AlertTriangle className="w-10 h-10 text-red-600" />
                        </div>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Cuidado!</AlertDialogTitle>
                          <AlertDialogDescription className="text-neutral-500 dark:text-neutral-400 text-base">
                            Você quer mesmo apagar <span className="font-bold text-neutral-900 dark:text-neutral-200">"{product.name}"</span>? 
                            Ele sumirá do cardápio para os clientes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                      </div>
                      <AlertDialogFooter className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-stretch">
                        <AlertDialogCancel className="h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 font-bold sm:flex-1">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold sm:flex-1 shadow-lg shadow-red-100 dark:shadow-none"
                        >
                          Sim, excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Form */}
        <ProductFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadProducts}
          productToEdit={editingProduct}
          categories={categories}
        />
      </div>
    </AdminGuard>
  );
}