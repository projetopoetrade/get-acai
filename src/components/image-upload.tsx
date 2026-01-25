// src/components/admin/image-upload.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string; // URL atual da imagem (se houver)
  onChange: (url: string) => void; // Função para avisar o formulário que a URL mudou
  onRemove: () => void; // Função para limpar a imagem
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validação básica no front antes de enviar
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. Envia para o seu Backend NestJS
      // Ajuste a URL se sua API estiver em outra porta/domínio
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha no upload');

      const data = await response.json();
      
      // 3. Sucesso: Chama a função do pai passando a URL do S3
      onChange(data.url);
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      
      {/* Visualização da Imagem */}
      <div className="flex items-center justify-center w-full">
        {value ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-neutral-200 group">
            <Image 
              src={value} 
              alt="Preview" 
              fill 
              className="object-cover" 
            />
            {/* Botão de Remover (aparece no hover) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                onClick={onRemove}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <>
                  <Loader2 className="w-10 h-10 mb-3 text-purple-500 animate-spin" />
                  <p className="text-sm text-neutral-500">Enviando para Amazon S3...</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 mb-3 text-neutral-400" />
                  <p className="mb-2 text-sm text-neutral-500">
                    <span className="font-semibold">Clique para enviar</span>
                  </p>
                  <p className="text-xs text-neutral-400">PNG, JPG ou WEBP (Max 5MB)</p>
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