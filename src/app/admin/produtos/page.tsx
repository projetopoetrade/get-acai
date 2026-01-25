// src/app/admin/produtos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Power, PackageOpen } from 'lucide-react';
import { productsService } from '@/services/products';
import { categoriesService, Category } from '@/services/categories';
import { Product } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AdminGuard } from '@/components/admin/admin-guard';
import Image from 'next/image';
import { ProductFormModal } from '@/components/admin/product-form-modal'; // Importe o Modal

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // ✅ Lista de categorias do backend
  const [categories, setCategories] = useState<Category[]>([]);
  
  const loadProducts = async () => {
    try {
      // setLoading(true); // Opcional: não mostrar loading se for apenas refresh
      // No admin, queremos ver TODOS os produtos (disponíveis e indisponíveis)
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
      console.log('Categorias carregadas:', data);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const toggleAvailability = async (product: Product) => {
    try {
      // Atualiza o estado local primeiro (otimista)
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, available: !p.available } : p
      ));
      
      // Usa o endpoint específico de toggle através do serviço
      const updatedProduct = await productsService.toggle(product.id);
      
      // Atualiza o estado com a resposta do backend
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, available: updatedProduct.available } : p
      ));
      
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      toast.error('Erro ao atualizar status');
      // Reverte o estado local em caso de erro
      loadProducts();
    }
  };

  // ✅ Função para abrir modal de Criação
  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // ✅ Função para abrir modal de Edição
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
        
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">Cardápio</h1>
              
              {/* ✅ Botão Novo Produto Conectado */}
              <Button onClick={handleNewProduct} className="bg-[#9d0094] hover:bg-[#7a0073] text-white gap-2">
                <Plus className="w-4 h-4" /> Novo Produto
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <Input 
                placeholder="Buscar por nome..." 
                className="pl-9 bg-neutral-100 dark:bg-neutral-800 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {loading ? (
             <p className="text-center py-10 text-neutral-500">Carregando cardápio...</p>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-10 opacity-50">
               <PackageOpen className="w-12 h-12 mx-auto mb-2" />
               <p>Nenhum produto encontrado</p>
             </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border transition-all ${
                  !product.available ? 'opacity-60 border-neutral-200 bg-neutral-50' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  {product.imageUrl ? (
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">Sem foto</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    {!product.available && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">PAUSADO</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 truncate">{product.description}</p>
                  <p className="font-medium text-[#9d0094] mt-1">R$ {Number(product.price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleAvailability(product)}
                    className={`p-2 rounded-full transition-colors ${
                      product.available 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'
                    }`}
                  >
                    <Power className="w-5 h-5" />
                  </button>
                  
                  {/* ✅ Botão Editar Conectado */}
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Modal Inserido na Página */}
        <ProductFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadProducts} // Recarrega a lista ao salvar
          productToEdit={editingProduct}
          categories={categories}
        />
      </div>
    </AdminGuard>
  );
}