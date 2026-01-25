// components/admin/settings/general-settings.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Store, Lock, Unlock, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface GeneralSettingsProps {
  settings: any
}

export function GeneralSettings({ settings }: GeneralSettingsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Converter is_open de string para boolean corretamente
  const getIsOpenValue = () => {
    const isOpenValue = settings?.is_open
    if (isOpenValue === undefined || isOpenValue === null) {
      return true // Default
    }
    // Se for string, converter para boolean
    if (typeof isOpenValue === 'string') {
      return isOpenValue.toLowerCase() === 'true'
    }
    // Se já for boolean, usar diretamente
    return Boolean(isOpenValue)
  }

  const [formData, setFormData] = useState({
    storeName: settings?.store_name || 'GetAçaí',
    phone: settings?.store_phone || '',
    isOpen: getIsOpenValue(),
    openingHour: settings?.opening_hour || '',
    closingHour: settings?.closing_hour || '',
  })

  // Atualizar valores quando settings mudarem
  useEffect(() => {
    if (settings) {
      const isOpenValue = settings?.is_open
      let isOpen = true // Default
      if (isOpenValue !== undefined && isOpenValue !== null) {
        if (typeof isOpenValue === 'string') {
          isOpen = isOpenValue.toLowerCase() === 'true'
        } else {
          isOpen = Boolean(isOpenValue)
        }
      }
      
      setFormData({
        storeName: settings?.store_name || 'GetAçaí',
        phone: settings?.store_phone || '',
        isOpen,
        openingHour: settings?.opening_hour || '',
        closingHour: settings?.closing_hour || '',
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      if (!token) {
        toast.error('Token de autenticação não encontrado')
        return
      }

      // Mapeamento de campos do formulário para chaves do backend (apenas campos que existem no DB)
      // O backend espera strings mesmo para valores booleanos
      const settingsMap = [
        { key: 'store_name', value: String(formData.storeName) },
        { key: 'store_phone', value: String(formData.phone || '') },
        { key: 'is_open', value: String(formData.isOpen) }, // Backend espera string "true" ou "false"
        { key: 'opening_hour', value: String(formData.openingHour || '') },
        { key: 'closing_hour', value: String(formData.closingHour || '') },
      ]

      // Atualizar todas as configurações em paralelo
      const promises = settingsMap.map(async ({ key, value }) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/admin/${key}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ value })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
          return { ok: false, key, error: errorData }
        }
        return { ok: true, key }
      })

      const responses = await Promise.all(promises)
      const errors = responses.filter(r => !r.ok)
      const success = responses.filter(r => r.ok)

      if (errors.length === 0) {
        toast.success('Configurações salvas!')
        router.refresh()
      } else {
        const errorMessages = errors.map(e => `${e.key}: ${e.error?.message || 'Erro desconhecido'}`).join(', ')
        console.error('Erros ao salvar configurações:', errors)
        toast.error(`Erro ao salvar: ${errorMessages}`)
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Controle de Abertura/Fechamento */}
      <Card className={`border-2 shadow-sm transition-all ${
        formData.isOpen 
          ? 'border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/20' 
          : 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20'
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            {formData.isOpen ? (
              <>
                <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
                Loja Aberta
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                Loja Fechada
              </>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            {formData.isOpen 
              ? 'A loja está aberta e aceitando pedidos' 
              : 'A loja está fechada e não aceita pedidos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {formData.isOpen ? 'Fechar Loja' : 'Abrir Loja'}
              </Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {formData.isOpen 
                  ? 'Desative para fechar a loja temporariamente' 
                  : 'Ative para abrir a loja e aceitar pedidos'}
              </p>
            </div>
            <Switch
              checked={formData.isOpen}
              onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#9d0094]" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure os horários de abertura e fechamento da loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="openingHour" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Horário de Abertura
              </Label>
              <Input
                id="openingHour"
                type="time"
                value={formData.openingHour}
                onChange={(e) => setFormData({ ...formData, openingHour: e.target.value })}
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Horário em que a loja abre
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="closingHour" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Horário de Fechamento
              </Label>
              <Input
                id="closingHour"
                type="time"
                value={formData.closingHour}
                onChange={(e) => setFormData({ ...formData, closingHour: e.target.value })}
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Horário em que a loja fecha (aparece no header como "Aberto até")
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Loja */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Store className="h-5 w-5 text-[#9d0094]" />
            Informações da Loja
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Dados principais do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="storeName" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Nome da Loja *
              </Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="GetAçaí"
                required
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Telefone/WhatsApp
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="71999999999"
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#9d0094] hover:bg-[#8a0080] text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
