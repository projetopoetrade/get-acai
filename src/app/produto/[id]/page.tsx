'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, Minus, Plus, Check, UtensilsCrossed, Cherry, 
  X, Maximize2, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress'; // ✅ Importei Progress (se não tiver, pode usar div simples)

const TOPPING_CATEGORY_LABELS: Record<ToppingCategory, string> = {
  frutas: 'Frutas',
  complementos: 'Complementos',
  cremes: 'Cremes',
  caldas: 'Caldas',
  extras: 'Extras Premium',
};

const ALL_TOPPING_CATEGORIES: ToppingCategory[] = ['frutas', 'complementos', 'cremes', 'caldas', 'extras'];

// Interface para guardar a configuração de cada etapa do combo
interface StepConfiguration {
  toppingQuantities: Record<string, number>;
  wantsCutlery: boolean | null;
  observations: string;
  skippedCategories: Record<string, boolean>;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [toppingLimits, setToppingLimits] = useState<Record<string, Record<ToppingCategory, number>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // ==========================================
  // ESTADOS DO FORMULÁRIO (ATUAL)
  // ==========================================
  const [toppingQuantities, setToppingQuantities] = useState<Record<string, number>>({});
  const [skippedCategories, setSkippedCategories] = useState<Record<string, boolean>>({});
  const [wantsCutlery, setWantsCutlery] = useState<boolean | null>(null);
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1); // Quantidade do PRODUTO FINAL (Ex: 1 Combo)

  // ==========================================
  // NOVA LÓGICA DE COMBO
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [comboConfigurations, setComboConfigurations] = useState<StepConfiguration[]>([]);
  
  // Defina aqui quantos itens tem o combo se for isCombo. 
  // O ideal é vir do backend (product.comboCount), mas vou deixar um fallback de 2.
  const comboLimit = product?.isCombo ? ((product as any).comboCount || 2) : 1; 
  const isLastStep = currentStep === comboLimit;

  // Estados Visuais
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

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
          // productsService já devolve sizeId; manter fallback para payloads antigos
          sizeId: (productData as any).sizeId ?? (productData as any).size?.id,
          sizeGroup: (productData as any).sizeGroup,
        };
        setProduct(mappedProduct);

        const toppingsData = await toppingsService.getAll();
        setToppings(toppingsData);

        try {
          const limitsData = await toppingsService.getProductLimits(productId);
          const limitsMap: Record<string, Record<ToppingCategory, number>> = {};

          // Backend pode retornar:
          // 1) Array de limites por sizeId/categoria (formato antigo/documentado)
          // 2) Objeto direto por categoria (ex: { frutas: 2 }) (formato novo)
          if (Array.isArray(limitsData)) {
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
          } else if (limitsData && typeof limitsData === 'object') {
            const key = mappedProduct.sizeId;
            if (key) {
              limitsMap[key] = {
                frutas: Number((limitsData as any).frutas) || 0,
                complementos: Number((limitsData as any).complementos) || 0,
                cremes: Number((limitsData as any).cremes) || 0,
                caldas: Number((limitsData as any).caldas) || 0,
                extras: Number((limitsData as any).extras) || 0,
              };
            }
          }

          setToppingLimits(limitsMap);
        } catch {
          setToppingLimits({});
        }
      } catch (err: any) {
        console.error(err);
        setError('Erro ao carregar');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [productId]);

  const getToppingsByCategory = (category: ToppingCategory): Topping[] => {
    return toppings.filter(t => t.category === category && (t.inStock || t.available)).sort((a, b) => a.order - b.order);
  };

  const getToppingLimit = (sizeId: string | undefined, category: ToppingCategory): number => {
    if (!sizeId) return 0;
    const sizeLimits = toppingLimits[sizeId];
    if (sizeLimits) return sizeLimits[category] || 0;
    return 0;
  };

  const currentSizeId = product?.sizeId;

  // ==========================================
  // CÁLCULO DE PREÇO (ADAPTADO PARA COMBO)
  // ==========================================
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let basePrice = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
    
    // Função auxiliar para calcular extras de um set de toppings
    const calculateExtraPrice = (qtys: Record<string, number>) => {
      let extra = 0;
      ALL_TOPPING_CATEGORIES.forEach((category) => {
        const categoryToppings = getToppingsByCategory(category);
        const freeLimit = getToppingLimit(currentSizeId, category);
        const isExtras = category === 'extras';
        let totalInCategory = 0;
        
        categoryToppings.forEach((topping) => { totalInCategory += qtys[topping.id] || 0; });

        if (isExtras) {
          categoryToppings.forEach((topping) => {
            extra += topping.price * (qtys[topping.id] || 0);
          });
        } else {
          const paidQuantity = Math.max(0, totalInCategory - freeLimit);
          if (paidQuantity > 0) {
            const selectedWithQty = categoryToppings
              .filter((t) => (qtys[t.id] || 0) > 0)
              .flatMap((t) => Array((qtys[t.id] || 0)).fill(t))
              .sort((a, b) => b.price - a.price);
            selectedWithQty.slice(0, paidQuantity).forEach((topping) => { extra += topping.price; });
          }
        }
      });
      return extra;
    };

    // 1. Soma extras das etapas já concluídas
    let totalExtras = 0;
    comboConfigurations.forEach(config => {
      totalExtras += calculateExtraPrice(config.toppingQuantities);
    });

    // 2. Soma extras da etapa atual
    totalExtras += calculateExtraPrice(toppingQuantities);

    return (basePrice + totalExtras) * quantity;
  }, [product, toppingQuantities, quantity, currentSizeId, toppings, comboConfigurations]);

  const isFormValid = useMemo(() => {
    const errors: string[] = [];
    const freeCategories: ToppingCategory[] = ['frutas', 'complementos', 'cremes'];
    freeCategories.forEach((category) => {
      const isSkipped = skippedCategories[category] || false;
      const hasSelection = getToppingsByCategory(category).some((topping) => (toppingQuantities[topping.id] || 0) > 0);
      const limit = getToppingLimit(currentSizeId, category);
      if (limit > 0 && !isSkipped && !hasSelection) errors.push('erro');
    });
    if (wantsCutlery === null) errors.push('erro');
    return errors.length === 0;
  }, [toppingQuantities, skippedCategories, wantsCutlery, currentSizeId, toppings]);

  const handleToppingIncrease = (topping: Topping) => {
    if (skippedCategories[topping.category]) setSkippedCategories((prev) => ({ ...prev, [topping.category]: false }));
    setToppingQuantities((prev) => ({ ...prev, [topping.id]: (prev[topping.id] || 0) + 1 }));
  };

  const handleToppingDecrease = (topping: Topping) => {
    setToppingQuantities((prev) => {
      const currentQty = prev[topping.id] || 0;
      if (currentQty <= 1) { const updated = { ...prev }; delete updated[topping.id]; return updated; }
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

  // ==========================================
  // FUNÇÕES DE NAVEGAÇÃO DO COMBO
  // ==========================================
  
  const handleNextStep = () => {
    // 1. Salva a configuração atual
    const currentConfig: StepConfiguration = {
      toppingQuantities: { ...toppingQuantities },
      wantsCutlery,
      observations,
      skippedCategories: { ...skippedCategories }
    };

    setComboConfigurations(prev => [...prev, currentConfig]);

    // 2. Reseta o form para o próximo item
    setToppingQuantities({});
    setSkippedCategories({});
    setWantsCutlery(null); // Ou pode manter a escolha anterior se preferir
    setObservations('');
    
    // 3. Avança etapa
    setCurrentStep(prev => prev + 1);
    
    // Scroll para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Item ${currentStep} configurado! Agora monte o item ${currentStep + 1}.`);
  };

  const handleAddToCart = () => {
    if (!product) return;

    // 1. Prepara a lista final de configurações (Acumuladas + Atual)
    const finalConfigs = [
      ...comboConfigurations,
      {
        toppingQuantities,
        wantsCutlery,
        observations,
        skippedCategories
      }
    ];

    // 2. Mescla os Toppings para o cálculo de preço/estoque no carrinho
    // (Isso é uma simplificação para caber na estrutura atual de Customization)
    const mergedQuantities: Record<string, number> = {};
    let mergedCutlery = false;
    let mergedObservations = "";

    finalConfigs.forEach((config, index) => {
      // Mescla quantidades
      Object.entries(config.toppingQuantities).forEach(([id, qty]) => {
        mergedQuantities[id] = (mergedQuantities[id] || 0) + qty;
      });

      // Mescla talheres (se algum item pediu, assumimos que quer)
      if (config.wantsCutlery) mergedCutlery = true;

      // Cria uma observação estruturada para a cozinha
      const stepName = product.isCombo ? `[ITEM ${index + 1}]` : '';
      
      const stepToppingsNames = Object.entries(config.toppingQuantities)
        .map(([tId, tQty]) => {
          const tName = toppings.find(t => t.id === tId)?.name;
          return tQty > 1 ? `${tQty}x ${tName}` : tName;
        })
        .join(', ');

      const parts = [];
      if (stepName) parts.push(stepName);
      // Se tiver toppings, mostra. Se não, escreve "Puro" ou nada.
      if (stepToppingsNames) {
        parts.push(stepToppingsNames);
      } else {
         parts.push("Sem adicionais");
      }

      parts.push(config.wantsCutlery ? 'Com talher' : 'Sem talher');
      
      if (config.observations) parts.push(`Obs: ${config.observations}`);

      // Junta tudo com " - " ou ". " para ficar bonito
      mergedObservations += parts.join(' - ') + '\n';
    });

    // 3. Cria a customização usando o hook existente
    const toppingsData = toppings.map(t => ({ id: t.id, name: t.name, price: t.price, category: t.category }));
    const limits: Record<string, number> = {};
    ALL_TOPPING_CATEGORIES.forEach(cat => { limits[cat] = getToppingLimit(currentSizeId, cat); });
    
    // Nota: Passamos as listas mescladas para gerar o objeto final
    // Para skippedCategories, passamos vazio pois a validação já foi feita passo a passo
    const customization = createCustomization(
      currentSizeId, 
      mergedQuantities, 
      toppingsData, 
      limits, 
      mergedCutlery, 
      mergedObservations.trim(), // Aqui vai o segredo da separação
      [] 
    );

    addItem(product, quantity, customization);
    toast.success('Combo adicionado ao carrinho!', { duration: 2000 });
    router.push('/carrinho');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0094]"></div></div>;
  if (error || !product) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Produto não encontrado</p></div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* =======================
          HEADER DE PRODUTO
      ======================= */}
      {/* ... (Mesmo código do Header Mobile e Desktop que você já tinha) ... */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 pointer-events-none">
         <div className="p-4 flex justify-between">
            <button onClick={() => router.back()} className="pointer-events-auto p-2 bg-white/90 backdrop-blur-md rounded-full shadow-md text-neutral-800 hover:bg-white transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </button>
         </div>
      </div>

      <header className="hidden md:block bg-background border-b border-neutral-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-lg truncate">Detalhes do produto</h1>
        </div>
      </header>
      
      {/* =======================
          MODAL DE IMAGEM
      ======================= */}
       {showDesktopModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out" onClick={() => setShowDesktopModal(false)}>
           <div className="relative w-full h-full max-w-5xl max-h-[85dvh] p-2">
               <Image src={product.imageUrl} alt={product.name} fill className="object-contain" priority />
           </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* =======================
            INFO DO PRODUTO
        ======================= */}
        <div className="flex flex-col md:flex-row md:p-6 md:gap-8 bg-white md:border border-neutral-100 md:shadow-md md:rounded-b-[2rem] md:mt-4">
          <div className="relative w-full md:w-auto shrink-0">
             <div onClick={() => window.innerWidth >= 768 && setShowDesktopModal(true)} className={`relative w-full bg-white overflow-hidden shadow-sm ${isMobileExpanded ? 'aspect-square' : 'aspect-[4/3]'} md:aspect-square md:w-[300px] md:h-[300px] md:rounded-[2rem] md:cursor-zoom-in`}>
                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Cherry className="w-16 h-16 text-[#c69abf]" /></div>
                ) : (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover md:object-contain" onError={() => setImageError(true)} />
                )}
             </div>
          </div>

          <div className="p-4 md:p-0 md:py-4 flex-1 space-y-3">
             <div className="flex justify-between items-start gap-4">
                <h2 className="text-2xl font-bold text-neutral-900 leading-tight">{product.name}</h2>
                {product.hasPromo && <Badge className="bg-[#fcc90c] text-[#430238] font-bold">{product.promoText || 'Oferta'}</Badge>}
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-2xl font-bold" style={{ color: '#9d0094' }}>R$ {Number(product.price || 0).toFixed(2)}</span>
             </div>
             <p className="text-neutral-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* =======================
            ✅ BARRA DE PROGRESSO DO COMBO
        ======================= */}
        {product.isCombo && (
          <div className="mx-4 mt-6 md:mx-0 p-4 bg-purple-50 border border-purple-100 rounded-xl">
             <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-purple-900 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Montando Item {currentStep} de {comboLimit}
                </span>
                <span className="text-xs font-medium text-purple-600">
                  {Math.round((currentStep / comboLimit) * 100)}%
                </span>
             </div>
             <div className="h-2 w-full bg-purple-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#9d0094] transition-all duration-500" 
                  style={{ width: `${(currentStep / comboLimit) * 100}%` }} 
                />
             </div>
          </div>
        )}

        <div className="md:mt-6">
          {ALL_TOPPING_CATEGORIES.map((category) => {
            const toppingsList = getToppingsByCategory(category);
            const selectedCount = toppingsList.reduce((sum, t) => sum + (toppingQuantities[t.id] || 0), 0);
            const limit = getToppingLimit(currentSizeId, category);
            const isExtras = category === 'extras';
            const isSkipped = skippedCategories[category];

            if (toppingsList.length === 0) return null;

            return (
              <Card key={category} className="rounded-none md:rounded-xl border-x-0 md:border border-t-0 md:border-t mb-0 md:mb-4 shadow-none md:shadow-md border-neutral-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{TOPPING_CATEGORY_LABELS[category]}</CardTitle>
                      {isExtras && (
                        <p className="text-xs text-neutral-500 mt-1">Adicionais pagos</p>
                      )}
                    </div>
                    {!isExtras && limit > 0 && !isSkipped && (
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${selectedCount >= limit ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {selectedCount}/{limit}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isExtras && (
                    <button onClick={() => handleSkipCategory(category)} className={`w-full mb-3 p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${isSkipped ? 'border-[#9d0094]' : 'border-neutral-100'}`}>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={isSkipped ? { borderColor: '#9d0094', backgroundColor: '#9d0094' } : { borderColor: '#d1d5db' }}>
                        {isSkipped && <X className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-sm">Não quero {TOPPING_CATEGORY_LABELS[category].toLowerCase()}</span>
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

          <Card className="rounded-none md:rounded-xl border-x-0 md:border border-t-0 md:border-t mb-0 md:mb-4 shadow-none md:shadow-md border-neutral-100">
            <CardHeader><CardTitle>Talheres <span className="text-red-500">*</span></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button onClick={() => setWantsCutlery(true)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${wantsCutlery === true ? 'border-[#9d0094]' : 'border-neutral-100'}`}>
                  <UtensilsCrossed className="w-5 h-5" style={{ color: wantsCutlery === true ? '#9d0094' : '#9ca3af' }} />
                  <span className="font-medium flex-1 text-left">Quero talheres</span>
                  {wantsCutlery === true && <div className="w-5 h-5 rounded-full border-2 bg-[#9d0094] border-[#9d0094] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                </button>
                <button onClick={() => setWantsCutlery(false)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${wantsCutlery === false ? 'border-[#9d0094]' : 'border-neutral-100'}`}>
                  <X className="w-5 h-5" style={{ color: wantsCutlery === false ? '#9d0094' : '#9ca3af' }} />
                  <span className="font-medium flex-1 text-left">Não quero talheres</span>
                  {wantsCutlery === false && <div className="w-5 h-5 rounded-full border-2 bg-[#9d0094] border-[#9d0094] flex items-center justify-center"><X className="w-3 h-3 text-white" /></div>}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none md:rounded-xl border-x-0 md:border border-t-0 md:border-t shadow-none md:shadow-md border-neutral-100">
            <CardHeader><CardTitle>Alguma observação?</CardTitle></CardHeader>
            <CardContent>
              <textarea
                value={observations}
                onChange={(e) => setObservations(sanitizeObservations(e.target.value))}
                placeholder="Ex: Sem banana, pouco açúcar..."
                maxLength={500}
                className="w-full p-3 rounded-xl border-2 border-neutral-200 resize-none h-24 focus:border-neutral-400 focus:outline-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          
          {/* Só mostra controle de quantidade se não for combo, ou se for, controla quantos combos inteiros */}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-xl p-0.5">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${quantity <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-neutral-200'}`}>
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-semibold text-base">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* ✅ BOTÃO INTELIGENTE: Muda texto e ação dependendo do passo */}
          <Button 
            onClick={isLastStep ? handleAddToCart : handleNextStep} 
            disabled={!isFormValid} 
            className="flex-1 h-12 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed max-w-md" 
            style={{ backgroundColor: '#139948' }}
          >
            {isLastStep 
              ? `Adicionar • R$ ${totalPrice.toFixed(2)}` 
              : `Próximo Item (${currentStep}/${comboLimit})`
            }
          </Button>

        </div>
      </div>
    </div>
  );
}