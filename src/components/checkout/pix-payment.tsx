'use client';

import { useState } from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PixPaymentProps {
  qrCode: string;       // O código "copia e cola"
  qrCodeBase64: string; // A imagem em base64
  expiresAt: string;    // Data de expiração
}

export function PixPayment({ qrCode, qrCodeBase64, expiresAt }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Formata a hora de expiração
  const expiryTime = new Date(expiresAt).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="bg-white dark:bg-neutral-900 border rounded-2xl p-6 flex flex-col items-center gap-4 text-center shadow-sm">
      <div className="bg-green-50 text-green-700 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
        <QrCode className="w-4 h-4" />
        Aguardando Pagamento
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-lg">Escaneie o QR Code</h3>
        <p className="text-sm text-neutral-500">
          Válido até às <span className="font-bold text-neutral-800 dark:text-neutral-200">{expiryTime}</span>
        </p>
      </div>

      {/* Imagem do QR Code */}
      <div className="border-4 border-white shadow-lg rounded-xl overflow-hidden">
        {qrCodeBase64 ? (
          <img 
            src={qrCodeBase64} 
            alt="QR Code PIX" 
            className="w-64 h-64 object-contain mix-blend-multiply dark:mix-blend-normal bg-white"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center bg-neutral-100 text-neutral-400">
            Carregando QR Code...
          </div>
        )}
      </div>

      <div className="w-full max-w-xs space-y-3">
        <p className="text-xs text-neutral-500">
          Se preferir, use o código abaixo:
        </p>
        
        <Button 
          onClick={handleCopy} 
          className="w-full bg-[#9d0094] hover:bg-[#7a0073] text-white font-bold h-12 gap-2"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copiado!' : 'Copiar código PIX'}
        </Button>
      </div>

      <p className="text-xs text-neutral-400 mt-2">
        Após o pagamento, a confirmação é automática.
      </p>
    </div>
  );
}