'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  // 1. Lida com a seleção do arquivo e gera prévia local
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande! Máximo 5MB")
        return
      }
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setUploadedUrl(null)
    }
  }

  // 2. Envia para o seu Controller NestJS
  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file) // 'file' deve ser igual ao definido no @FileInterceptor('file')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: {
          // Nota: Não defina Content-Type manualmente ao usar FormData, 
          // o navegador fará isso automaticamente com o boundary correto.
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploadedUrl(data.url)
        toast.success("Imagem enviada com sucesso!")
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro no upload")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setUploadedUrl(null)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Upload de Imagens</h1>
        <p className="text-neutral-500 text-sm">Envie fotos de produtos para o seu Bucket S3</p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="image-upload" className="block p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl hover:border-[#9d0094] transition-colors cursor-pointer bg-neutral-50/50 dark:bg-neutral-900/50 text-center">
          <Input 
            id="image-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          
          {!preview ? (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-full shadow-sm">
                <Upload className="w-6 h-6 text-[#9d0094]" />
              </div>
              <span className="text-sm font-medium">Clique para selecionar ou arraste a imagem</span>
              <span className="text-xs text-neutral-400">PNG, JPG ou WEBP (Max 5MB)</span>
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-md mx-auto rounded-2xl overflow-hidden border">
              <Image src={preview} alt="Preview" fill className="object-cover" />
              <button 
                onClick={(e) => { e.preventDefault(); clearSelection(); }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </Label>

        {file && !uploadedUrl && (
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full h-12 bg-[#9d0094] hover:bg-[#8a0080] text-white rounded-2xl font-bold"
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando para AWS...</>
            ) : (
              "Confirmar Upload"
            )}
          </Button>
        )}

        {uploadedUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Upload Concluído!
            </div>
            <div className="text-xs break-all bg-white dark:bg-neutral-900 p-3 rounded-lg border font-mono">
              {uploadedUrl}
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(uploadedUrl)
                toast.success("Link copiado!")
              }}
              className="w-full text-xs"
            >
              Copiar Link da Imagem
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}