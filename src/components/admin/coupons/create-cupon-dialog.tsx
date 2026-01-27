'use client';

import { useState } from 'react';
import { Loader2, Plus, Ticket, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { couponsService, CreateCouponData } from '@/services/coupons';

interface CreateCouponDialogProps {
  onSuccess: () => void;
}

export function CreateCouponDialog({ onSuccess }: CreateCouponDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateCouponData>({
    code: '',
    type: 'percentage',
    value: 0,
    minOrderValue: 0,
    maxUsage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || formData.value <= 0) {
      toast.error('O código e o valor do desconto são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await couponsService.create(formData);
      toast.success('Cupom criado com sucesso!');
      setOpen(false);
      onSuccess();
      
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        maxUsage: 0
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9d0094] hover:bg-[#9d0094]/90 text-white shadow-lg shadow-[#9d0094]/20 rounded-xl px-6">
          <Plus className="w-5 h-5 mr-2" />
          Novo Cupom
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 rounded-2xl bg-white dark:bg-neutral-900">
        
        {/* Header Colorido */}
        <div className="bg-gradient-to-r from-[#9d0094] to-[#70006a] p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">Criar novo cupom</DialogTitle>
          </div>
          <p className="text-white/80 text-sm">
            Configure as regras da promoção para seus clientes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Código do Cupom */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Código do Cupom
            </Label>
            <div className="relative">
              <Input 
                placeholder="EX: BEMVINDO10" 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                className="uppercase font-bold text-lg h-12 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 dark:border-neutral-700 pl-11"
                maxLength={20}
              />
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </div>
            <p className="text-[10px] text-neutral-400">Somente letras e números, sem espaços.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Tipo
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(val: any) => setFormData({...formData, type: val})}
              >
                <SelectTrigger className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Valor do Desconto
              </Label>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0"
                  value={formData.value || ''}
                  onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 pl-9 font-semibold"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {formData.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
            {/* Mínimo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Mínimo do Pedido
              </Label>
              <div className="relative">
                <Input 
                  type="number"
                  value={formData.minOrderValue || ''}
                  onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                  placeholder="0.00"
                  className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50 pl-9"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">R$</span>
              </div>
            </div>

            {/* Limite de Usos */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Limite de Usos
              </Label>
              <Input 
                type="number"
                value={formData.maxUsage || ''}
                onChange={e => setFormData({...formData, maxUsage: Number(e.target.value)})}
                placeholder="0 = Infinito"
                className="h-11 bg-neutral-50 border-neutral-200 dark:bg-neutral-800/50"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              O desconto será aplicado no <strong>subtotal</strong> dos itens, não incluindo a taxa de entrega.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#9d0094] hover:bg-[#9d0094]/90 text-white font-bold rounded-xl text-base shadow-lg shadow-[#9d0094]/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Cupom'}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}