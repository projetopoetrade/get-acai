'use client';

import { useState } from 'react';
import { Ticket, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
// 👇 Certifique-se que o caminho da sua API (axios) está correto
import api from '@/lib/api';
import { useCart } from '@/hooks/useCart';

export function CouponInput() {
  // Pega as funções e estados do contexto global do carrinho
  const { subtotal, setDiscount, couponCode, setCouponCode } = useCart();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para validar no backend
  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    
    setLoading(true);

    try {
      // GET /coupons/validate?code=XYZ&value=100
      const response = await api.get(`/coupons/validate`, {
        params: { 
          code: code.toUpperCase(), 
          value: subtotal 
        }
      });

      const { discountAmount, couponCode: validatedCode } = response.data;

      // ✅ Atualiza o Carrinho Global
      setDiscount(discountAmount); 
      setCouponCode(validatedCode);   
      
      toast.success('Cupom aplicado com sucesso!', {
        description: `Desconto de R$ ${discountAmount.toFixed(2)}`
      });
      
      setCode(''); // Limpa o input
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Erro ao aplicar cupom';
      toast.error(errorMessage);
      
      // Segurança: Limpa desconto se der erro
      setDiscount(0);
      setCouponCode(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para remover cupom
  const handleRemove = () => {
    setDiscount(0);
    setCouponCode(null);
    toast.info('Cupom removido');
  };

  // ===============================================
  // ESTADO 1: CUPOM JÁ APLICADO (Mostra card verde)
  // ===============================================
  if (couponCode) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
           <Ticket className="w-5 h-5 text-[#9d0094]" />
           <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Cupom de desconto</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="font-bold text-green-700 dark:text-green-400 uppercase tracking-wide text-sm">
              {couponCode}
            </span>
          </div>
          <button 
            onClick={handleRemove} 
            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase"
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  // ===============================================
  // ESTADO 2: CAMPO PARA DIGITAR (Input normal)
  // ===============================================
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
         <Ticket className="w-5 h-5 text-[#9d0094]" />
         <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Cupom de desconto</span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Código do cupom"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="uppercase bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 h-10 font-medium"
          maxLength={20}
        />
        <Button 
          onClick={handleApplyCoupon} 
          disabled={loading || !code || subtotal === 0}
          className="bg-[#9d0094] hover:bg-[#9d0094]/90 text-white font-bold h-10 px-6 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
        </Button>
      </div>
    </div>
  );
}