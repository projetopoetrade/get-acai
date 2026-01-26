'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string; // URL da imagem vinda do banco/S3
  onChange: (url: string) => void; // Atualiza o valor no formulário pai
  onRemove: () => void; // Limpa o campo no formulário pai
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file); // O nome 'file' deve bater com o @FileInterceptor('file') no NestJS

    try {
      // 2. Requisição para o seu Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: {
          // ✅ Importante: Enviando o token para autorização no backend
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no upload');
      }

      const data = await response.json();
      
      // 3. Sucesso: Passa a URL retornada pela AWS para o componente pai
      onChange(data.url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('[UPLOAD_ERROR]:', error);
      toast.error(error.message || 'Erro ao enviar imagem para o servidor');
    } finally {
      setIsUploading(false);
      // Limpa o input para permitir selecionar a mesma imagem novamente se necessário
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center w-full">
        {value ? (
          // --- ESTADO: IMAGEM JÁ CARREGADA ---
          <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
            <Image 
              src={value} 
              alt="Preview do Produto" 
              fill 
              className="object-cover transition-transform group-hover:scale-105" 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay de remoção no hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={onRemove}
                className="rounded-full shadow-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          // --- ESTADO: ÁREA DE UPLOAD ---
          <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:border-[#9d0094] transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#9d0094] animate-spin" />
                  <p className="text-sm font-medium text-neutral-600">Processando na Amazon S3...</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3 group-hover:bg-purple-100 transition-colors">
                    <UploadCloud className="w-8 h-8 text-neutral-500 group-hover:text-[#9d0094]" />
                  </div>
                  <p className="mb-1 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold text-[#9d0094]">Clique para subir</span> ou arraste a foto
                  </p>
                  <p className="text-xs text-neutral-400">PNG, JPG ou WEBP (Máx. 5MB)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}