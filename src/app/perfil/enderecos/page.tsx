'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { addressService, Address } from '@/services/address';
import { 
  ArrowLeft, MapPin, Plus, Trash2, CheckCircle2, 
  Home, Briefcase, MapPinned, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// Importação do modal que você já possui
import { AddressModal } from '@/components/address/address-modal'; 

export default function MyAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  // Estado para controlar a abertura do modal na mesma página
  const [showModal, setShowModal] = useState(false); 

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefault(id);
      toast.success('Endereço padrão atualizado!');
      loadAddresses(); 
    } catch (error: any) {
      console.error('Erro ao definir padrão:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao definir padrão';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
    try {
      await addressService.delete(id);
      toast.success('Endereço removido');
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      toast.error('Erro ao excluir endereço');
    }
  };

  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('casa')) return Home;
    if (l.includes('trab')) return Briefcase;
    return MapPinned;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/perfil')} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Meus Endereços</h1>
        </div>

        <Button 
          // Agora o botão altera o estado local em vez de redirecionar
          onClick={() => setShowModal(true)} 
          className="w-full h-14 bg-[#9d0094] hover:bg-[#800078] text-white rounded-2xl mb-6 gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar Novo Endereço
        </Button>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#9d0094]" /></div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => {
              const Icon = getIcon(address.label);
              return (
                <div key={address.id} className={`bg-white dark:bg-neutral-900 p-4 rounded-2xl border-2 transition-all ${address.isDefault ? 'border-[#9d0094]' : 'border-transparent shadow-sm'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${address.isDefault ? 'bg-[#9d0094]/10 text-[#9d0094]' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{address.label}</span>
                        {address.isDefault && <span className="text-[10px] bg-[#9d0094] text-white px-2 py-0.5 rounded-full uppercase font-black">Padrão</span>}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {address.street}, {address.number}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {address.neighborhood} - {address.city}/{address.state}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleDelete(address.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {!address.isDefault && (
                        <button onClick={() => handleSetDefault(address.id)} className="p-2 text-neutral-400 hover:text-[#9d0094] rounded-lg">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Renderização do Modal de Endereço na mesma página */}
      {showModal && (
        <AddressModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onSave={(newAddr: Address) => {
            // Atualiza a lista local e fecha o modal
            setAddresses(prev => [newAddr, ...prev]);
            setShowModal(false);
            // Se for o primeiro endereço, sua API já o define como padrão
            if (addresses.length === 0) loadAddresses(); 
          }} 
        />
      )}
    </div>
  );
}