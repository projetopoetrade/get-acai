import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RecentActivity({ orders }: { orders: any[] }) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-[#9d0094]">
                #10{i}
              </div>
              <div>
                <p className="text-sm font-semibold">Novo Pedido: Gleba A</p>
                <p className="text-xs text-neutral-500">1x Açaí Tradicional 500ml • há 2 min</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">R$ 32,50</p>
              <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] h-5">Preparando</Badge>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-xs text-neutral-400 hover:text-[#9d0094]">
          Ver histórico completo
        </Button>
      </div>
    )
  }