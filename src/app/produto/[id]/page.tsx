// src/app/produto/[id]/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, Check, UtensilsCrossed, Cherry, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productsService } from '@/services/products';
import { toppingsService, type Topping } from '@/services/toppings';
import { useCart, createCustomization } from '@/hooks/useCart';
import { toast } from 'sonner';
import { ToppingItem } from '@/components/produto/topping-item';
import { Product, ProductCategory } from '@/types/product';
import { sanitizeObservations } from '@/lib/sanitize';
import type { ToppingCategory } from '@/data/toppings-config';

// Labels das categorias (fallback se não vier da API)
const TOPPING_CATEGORY_LABELS: Record<ToppingCategory, string> = {
  frutas: 'Frutas',
  complementos: 'Complementos',
  cremes: 'Cremes',
  caldas: 'Caldas',
  extras: 'Extras Premium',
};

const ALL_TOPPING_CATEGORIES: ToppingCategory[] = ['frutas', 'complementos', 'cremes', 'caldas', 'extras'];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const productId = params.id as string;

  // Estados de dados da API
  const [product, setProduct] = useState<Product | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [toppingLimits, setToppingLimits] = useState<Record<string, Record<ToppingCategory, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toppingQuantities, setToppingQuantities] = useState<Record<string, number>>({});
  const [skippedCategories, setSkippedCategories] = useState<Record<ToppingCategory, boolean>>({} as Record<ToppingCategory, boolean>);
  const [wantsCutlery, setWantsCutlery] = useState<boolean | null>(null);
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Carregar dados da API (MANTIDO IGUAL)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productsService.getOne(productId);
        const mappedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: typeof productData.price === 'string' ? parseFloat(productData.price) : Number(productData.price) || 0,
          originalPrice: productData.originalPrice ? (typeof productData.originalPrice === 'string' ? parseFloat(productData.originalPrice) : Number(productData.originalPrice)) : undefined,
          category: (() => {
            const cat = productData.category;
            const categoryName = typeof cat === 'string' ? cat : (cat as any)?.name || 'monte-seu';
            return categoryName.toLowerCase() as ProductCategory;
          })(),
          imageUrl: productData.imageUrl || '/placeholder-product.jpg',
          available: productData.available ?? true,
          isCombo: (productData as any).isCombo,
          isCustomizable: (productData as any).isCustomizable ?? true,
          hasPromo: (productData as any).hasPromo,
          promoText: (productData as any).promoText,
          sizeId: (() => {
            const size = (productData as any).size;
            if (!size) return undefined;
            const sizeName = (size.name || '').toLowerCase();
            if (sizeName.includes('pequeno') || sizeName.includes('300')) return 'pequeno';
            if (sizeName.includes('medio') || sizeName.includes('médio') || sizeName.includes('500')) return 'medio';
            if (sizeName.includes('grande') || sizeName.includes('700')) return 'grande';
            const sizeId = (size.id || '').toLowerCase();
            if (sizeId.includes('pequeno') || sizeId.includes('300')) return 'pequeno';
            if (sizeId.includes('medio') || sizeId.includes('médio') || sizeId.includes('500')) return 'medio';
            if (sizeId.includes('grande') || sizeId.includes('700')) return 'grande';
            return undefined;
          })(),
          sizeGroup: (productData as any).sizeGroup,
        };
        setProduct(mappedProduct);

        const toppingsData = await toppingsService.getAll();
        setToppings(toppingsData);

        try {
          const limitsData = await toppingsService.getProductLimits(productId);
          const limitsMap: Record<string, Record<ToppingCategory, number>> = {};
          limitsData.forEach(limit => {
            if (!limitsMap[limit.sizeId]) {
              limitsMap[limit.sizeId] = { frutas: 0, complementos: 0, cremes: 0, caldas: 0, extras: 0 };
            }
            const category = limit.toppingCategoryName.toLowerCase();
            if (category.includes('fruta')) limitsMap[limit.sizeId].frutas = limit.maxQuantity;
            else if (category.includes('complemento')) limitsMap[limit.sizeId].complementos = limit.maxQuantity;
            else if (category.includes('creme')) limitsMap[limit.sizeId].cremes = limit.maxQuantity;
            else if (category.includes('calda')) limitsMap[limit.sizeId].caldas = limit.maxQuantity;
            else if (category.includes('extra') || category.includes('premium')) limitsMap[limit.sizeId].extras = limit.maxQuantity;
          });
          setToppingLimits(limitsMap);
        } catch {
          setToppingLimits({});
        }
      } catch (err: any) {
        let errorMessage = 'Erro ao carregar produto';
        if (err.response?.data?.message) errorMessage = err.response.data.message;
        setError(errorMessage);
        toast.error('Erro ao carregar produto', { description: errorMessage });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId]);

  // Funções auxiliares (MANTIDO IGUAL)
  const getToppingsByCategory = (category: ToppingCategory): Topping[] => {
    return toppings
      .filter(t => t.category === category && (t.inStock || t.available))
      .sort((a, b) => a.order - b.order);
  };

  const getToppingLimit = (sizeId: string | undefined, category: ToppingCategory): number => {
    if (!sizeId) return 0;
    const sizeLimits = toppingLimits[sizeId];
    if (sizeLimits) return sizeLimits[category] || 0;
    const defaultLimits: Record<ToppingCategory, number> = {
      frutas: sizeId === 'pequeno' ? 2 : sizeId === 'medio' ? 3 : 4,
      complementos: sizeId === 'pequeno' ? 2 : sizeId === 'medio' ? 3 : 4,
      cremes: sizeId === 'pequeno' ? 1 : sizeId === 'medio' ? 1 : 2,
      caldas: sizeId === 'pequeno' ? 1 : sizeId === 'medio' ? 2 : 2,
      extras: 0,
    };
    return defaultLimits[category] || 0;
  };

  const currentSizeId = product?.sizeId;

  // Cálculo do preço total (MANTIDO IGUAL)
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let price = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
    ALL_TOPPING_CATEGORIES.forEach((category) => {
      const categoryToppings = getToppingsByCategory(category);
      const freeLimit = getToppingLimit(currentSizeId, category);
      const isExtras = category === 'extras';
      let totalInCategory = 0;
      categoryToppings.forEach((topping) => { totalInCategory += toppingQuantities[topping.id] || 0; });

      if (isExtras) {
        categoryToppings.forEach((topping) => {
          price += topping.price * (toppingQuantities[topping.id] || 0);
        });
      } else {
        const paidQuantity = Math.max(0, totalInCategory - freeLimit);
        if (paidQuantity > 0) {
          const selectedWithQty = categoryToppings
            .filter((t) => (toppingQuantities[t.id] || 0) > 0)
            .flatMap((t) => Array((toppingQuantities[t.id] || 0)).fill(t))
            .sort((a, b) => b.price - a.price);
          selectedWithQty.slice(0, paidQuantity).forEach((topping) => { price += topping.price; });
        }
      }
    });
    return price * quantity;
  }, [product, toppingQuantities, quantity, currentSizeId, toppings]);

  // Validação do formulário (MANTIDO IGUAL)
  const isFormValid = useMemo(() => {
    const errors: string[] = [];
    const freeCategories: ToppingCategory[] = ['frutas', 'complementos', 'cremes'];
    freeCategories.forEach((category) => {
      const isSkipped = skippedCategories[category] || false;
      const hasSelection = getToppingsByCategory(category).some((topping) => (toppingQuantities[topping.id] || 0) > 0);
      if (!isSkipped && !hasSelection) errors.push('erro');
    });
    if (wantsCutlery === null) errors.push('erro');
    return errors.length === 0;
  }, [toppingQuantities, skippedCategories, wantsCutlery, currentSizeId, toppings]);

  // Handlers de ação (MANTIDO IGUAL)
  const handleToppingIncrease = (topping: Topping) => {
    if (skippedCategories[topping.category]) {
      setSkippedCategories((prev) => ({ ...prev, [topping.category]: false }));
    }
    setToppingQuantities((prev) => ({ ...prev, [topping.id]: (prev[topping.id] || 0) + 1 }));
  };

  const handleToppingDecrease = (topping: Topping) => {
    setToppingQuantities((prev) => {
      const currentQty = prev[topping.id] || 0;
      if (currentQty <= 1) {
        const updated = { ...prev };
        delete updated[topping.id];
        return updated;
      }
      return { ...prev, [topping.id]: currentQty - 1 };
    });
  };

  const handleSkipCategory = (category: ToppingCategory) => {
    const isCurrentlySkipped = skippedCategories[category];
    setSkippedCategories((prev) => ({ ...prev, [category]: !isCurrentlySkipped }));
    if (!isCurrentlySkipped) {
      setToppingQuantities((prev) => {
        const updated = { ...prev };
        getToppingsByCategory(category).forEach((t) => { delete updated[t.id]; });
        return updated;
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const toppingsData = toppings.map(t => ({ id: t.id, name: t.name, price: t.price, category: t.category }));
    const limits: Record<string, number> = {};
    ALL_TOPPING_CATEGORIES.forEach(cat => { limits[cat] = getToppingLimit(currentSizeId, cat); });
    const skippedCategoriesList = Object.entries(skippedCategories).filter(([, isSkipped]) => isSkipped).map(([cat]) => cat);
    
    const customization = createCustomization(
      currentSizeId, toppingQuantities, toppingsData, limits, wantsCutlery === true, observations, skippedCategoriesList
    );

    addItem(product, quantity, customization);
    toast.success('Adicionado ao carrinho!', { duration: 2000 });
    router.push('/');
  };

  // Loading e Error States (MANTIDO IGUAL)
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0094]"></div></div>;
  }
  if (error || !product) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-center"><h1 className="text-xl font-bold mb-2">Produto não encontrado</h1><Button onClick={() => router.back()}>Voltar</Button></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-background border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {/* ✅ MUDANÇA 1: Título do header alterado */}
          <h1 className="font-semibold text-lg truncate">Detalhes do produto</h1>
        </div>
      </header>


      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto">
        
        {/* Container Flex: Agora é SEMPRE 'flex-row' (lado a lado), mesmo no mobile */}
        <div className="p-4 flex flex-row gap-4 items-start border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          
          {/* Coluna da Imagem */}
          {/* 1. w-36 h-36 (144px): Tamanho ideal para celular (grande, mas deixa espaço pro texto).
             2. sm:w-56 sm:h-56: Fica maior em tablets/PC.
             3. rounded-[2rem]: Bordas bem arredondadas (inferiores e superiores) como na referência.
          */}
          <div className="relative w-36 h-36 sm:w-56 sm:h-56 shrink-0 bg-white rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm">
            {imageError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Cherry className="w-12 h-12" style={{ color: '#c69abf' }} />
              </div>
            ) : (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-2"
                priority
                onError={() => setImageError(true)}
              />
            )}
            {product.hasPromo && product.promoText && (
              <Badge
                className="absolute top-2 right-2 z-10 font-bold text-[10px] px-2 py-0.5 shadow-sm"
                style={{ backgroundColor: '#fcc90c', color: '#430238' }}
              >
                {product.promoText}
              </Badge>
            )}
          </div>

          {/* Coluna das Informações */}
          <div className="flex-1 min-w-0 flex flex-col justify-center h-36 sm:h-56"> 
            {/* min-w-0 ajuda o texto a não estourar a largura no flexbox */}
            
            <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-1 line-clamp-2">
              {product.name}
            </h2>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl sm:text-3xl font-bold" style={{ color: '#9d0094' }}>
                R$ {Number(product.price || 0).toFixed(2)}
              </span>
              {product.hasPromo && product.originalPrice && (
                <span className="text-xs sm:text-sm text-neutral-400 line-through">
                  R$ {Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {product.description}
            </p>
          </div>
        </div>

        {/* SELEÇÃO DE ACOMPANHAMENTOS (Mantido o restante do código) */}
        <div>
          {ALL_TOPPING_CATEGORIES.map((category) => {
            const toppingsList = getToppingsByCategory(category);
            const selectedCount = toppingsList.reduce((sum, t) => sum + (toppingQuantities[t.id] || 0), 0);
            const limit = getToppingLimit(currentSizeId, category);
            const isExtras = category === 'extras';
            const isSkipped = skippedCategories[category];

            if (toppingsList.length === 0) return null;

            return (
              <Card key={category} className="rounded-none border-x-0 border-t-0 shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{TOPPING_CATEGORY_LABELS[category]}</CardTitle>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {isExtras
                          ? 'Adicionais pagos'
                          : limit > 0
                            ? `Escolha até ${limit} grátis`
                            : 'Selecione quantos quiser'
                        }
                      </p>
                    </div>
                    {!isExtras && limit > 0 && !isSkipped && (
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${selectedCount >= limit ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-neutral-100 text-neutral-600 dark:bg-muted dark:text-neutral-400'}`}>
                        {selectedCount}/{limit}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isExtras && (
                    <button
                      onClick={() => handleSkipCategory(category)}
                      className={`w-full mb-3 p-3 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${isSkipped ? 'border-selected' : ''}`}
                    >
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={isSkipped ? { borderColor: '#9d0094', backgroundColor: '#9d0094' } : { borderColor: '#d1d5db' }}>
                        {isSkipped && <X className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`font-medium text-sm ${isSkipped ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        Não quero {TOPPING_CATEGORY_LABELS[category].toLowerCase()}
                      </span>
                    </button>
                  )}
                  {!isSkipped && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {toppingsList.map((topping) => (
                        <ToppingItem
                          key={topping.id}
                          topping={topping}
                          quantity={toppingQuantities[topping.id] || 0}
                          showPrice={isExtras || selectedCount >= limit}
                          onIncrease={() => handleToppingIncrease(topping)}
                          onDecrease={() => handleToppingDecrease(topping)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Talheres */}
          <Card className="rounded-none border-x-0 border-t-0 shadow-none">
            <CardHeader>
              <CardTitle>Talheres <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button onClick={() => setWantsCutlery(true)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${wantsCutlery === true ? 'border-selected-light dark:border-selected-dark' : ''}`}>
                  <UtensilsCrossed className="w-5 h-5" style={{ color: wantsCutlery === true ? '#9d0094' : '#9ca3af' }} />
                  <span className="font-medium flex-1 text-left">Quero talheres</span>
                  {wantsCutlery === true && <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#9d0094', backgroundColor: '#9d0094' }}><Check className="w-3 h-3 text-white" /></div>}
                </button>
                <button onClick={() => setWantsCutlery(false)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 ${wantsCutlery === false ? 'border-selected-light dark:border-selected-dark' : ''}`}>
                  <X className="w-5 h-5" style={{ color: wantsCutlery === false ? '#9d0094' : '#9ca3af' }} />
                  <span className="font-medium flex-1 text-left">Não quero talheres</span>
                  {wantsCutlery === false && <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#9d0094', backgroundColor: '#9d0094' }}><X className="w-3 h-3 text-white" /></div>}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="rounded-none border-0 pb-0 shadow-none">
            <CardHeader>
              <CardTitle>Alguma observação?</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={observations}
                onChange={(e) => setObservations(sanitizeObservations(e.target.value))}
                placeholder="Ex: Sem banana, pouco açúcar..."
                maxLength={500}
                className="w-full p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-transparent resize-none h-24 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none transition-colors"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 shadow-lg z-50 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-muted rounded-xl p-0.5">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${quantity <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-200 dark:hover:bg-muted/80'}`}>
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-semibold text-base">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-muted/80 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleAddToCart} disabled={!isFormValid} className="flex-1 h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed max-w-md" style={{ backgroundColor: '#139948' }}>
            Adicionar • R$ {totalPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}