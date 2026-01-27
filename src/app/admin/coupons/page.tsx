'use client';

import { useEffect, useState } from 'react';
import { 
  Trash2, 
  Ticket, 
  Percent, 
  DollarSign, 
  Users, 
  Search, 
  CalendarOff,
  MoreHorizontal
} from 'lucide-react';
import { CreateCouponDialog } from '@/components/admin/coupons/create-cupon-dialog';
import { couponsService, Coupon } from '@/services/coupons';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCoupons = async () => {
    try {
      const data = await couponsService.findAll();
      setCoupons(data);
    } catch (error) {
      toast.error('Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await couponsService.delete(id);
      toast.success('Cupom removido com sucesso');
      fetchCoupons();
    } catch (error) {
      toast.error('Erro ao deletar cupom');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Cupons de Desconto
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie as campanhas e códigos promocionais da loja.
          </p>
        </div>
        <CreateCouponDialog onSuccess={fetchCoupons} />
      </div>

      {/* Filtros e Busca */}
      <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Buscar por código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
          />
        </div>
        <div className="text-sm text-neutral-500 ml-auto">
          Total: <b>{filteredCoupons.length}</b> cupons
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-50/50">
              <TableHead className="w-[180px]">Código</TableHead>
              <TableHead>Valor do Desconto</TableHead>
              <TableHead>Regras</TableHead>
              <TableHead>Uso / Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-neutral-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#9d0094] border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-full">
                      <Ticket className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium">Nenhum cupom encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  {/* Código */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#9d0094]/10 p-2 rounded-lg text-[#9d0094]">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span className="font-mono font-bold text-base tracking-wide text-neutral-700 dark:text-neutral-200">
                        {coupon.code}
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Valor */}
                  <TableCell>
                    {coupon.type === 'percentage' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                        <Percent className="w-3 h-3" /> {Number(coupon.value)}% OFF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-800">
                        <DollarSign className="w-3 h-3" /> R$ {Number(coupon.value).toFixed(2)} OFF
                      </span>
                    )}
                  </TableCell>

                  {/* Regras */}
                  <TableCell className="text-sm text-neutral-600 dark:text-neutral-400">
                    {Number(coupon.minOrderValue) > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-neutral-400 uppercase font-semibold">Mínimo</span>
                        <span className="font-medium">R$ {Number(coupon.minOrderValue).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs italic">Sem valor mínimo</span>
                    )}
                  </TableCell>

                  {/* Uso */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        <Users className="w-4 h-4 text-neutral-400" />
                        {coupon.usageCount}
                        <span className="text-neutral-400">/</span>
                        {coupon.maxUsage === 0 ? '∞' : coupon.maxUsage}
                      </div>
                      {/* Barra de progresso visual simples */}
                      {coupon.maxUsage > 0 && (
                        <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#9d0094] rounded-full transition-all"
                            style={{ width: `${Math.min((coupon.usageCount / coupon.maxUsage) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Status (Exemplo base) */}
                  <TableCell>
                     <div className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={coupon.isActive ? 'Ativo' : 'Inativo'} />
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}