// components/admin/settings/delivery-settings.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Truck, Clock, DollarSign, Power } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeliverySettingsProps {
  settings: any
}

export function DeliverySettings({ settings }: DeliverySettingsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Converter valores de string para boolean corretamente
  const getBooleanValue = (value: any, defaultValue: boolean = true) => {
    if (value === undefined || value === null) return defaultValue
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return Boolean(value)
  }

  const [formData, setFormData] = useState({
    deliveryFee: settings?.delivery_fee?.toString() || '5.00',
    freeDeliveryMinimum: settings?.free_delivery_minimum?.toString() || '0',
    deliveryTimeMin: settings?.delivery_time_min?.toString() || '40',
    deliveryTimeMax: settings?.delivery_time_max?.toString() || '60',
    deliveryEnabled: getBooleanValue(settings?.delivery_enabled, true),
  })

  // Atualizar valores quando settings mudarem
  useEffect(() => {
    if (settings) {
      const getBool = (value: any, defaultValue: boolean = true) => {
        if (value === undefined || value === null) return defaultValue
        if (typeof value === 'string') return value.toLowerCase() === 'true'
        return Boolean(value)
      }
      
      setFormData({
        deliveryFee: settings?.delivery_fee?.toString() || '5.00',
        freeDeliveryMinimum: settings?.free_delivery_minimum?.toString() || '0',
        deliveryTimeMin: settings?.delivery_time_min?.toString() || '40',
        deliveryTimeMax: settings?.delivery_time_max?.toString() || '60',
        deliveryEnabled: getBool(settings?.delivery_enabled, true),
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

      // Mapeamento de campos do formulário para chaves do backend
      // O backend espera strings mesmo para valores booleanos e números
      const settingsMap = [
        { key: 'delivery_fee', value: String(Number(parseFloat(formData.deliveryFee))) },
        { key: 'free_delivery_minimum', value: String(Number(parseFloat(formData.freeDeliveryMinimum) || 0)) },
        { key: 'delivery_time_min', value: String(Number(parseInt(formData.deliveryTimeMin))) },
        { key: 'delivery_time_max', value: String(Number(parseInt(formData.deliveryTimeMax))) },
        { key: 'delivery_enabled', value: String(formData.deliveryEnabled) }, // Backend espera string "true" ou "false"
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
        toast.success('Configurações de entrega salvas!')
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
      {/* Taxas */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#9d0094]" />
            Taxas de Entrega
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure os valores de entrega
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deliveryFee" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Taxa Padrão (R$) *
              </Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                required
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Taxa aplicada quando o bairro não tem taxa personalizada
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="freeDeliveryMinimum" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Pedido Mínimo para Frete Grátis (R$)
              </Label>
              <Input
                id="freeDeliveryMinimum"
                type="number"
                step="0.01"
                value={formData.freeDeliveryMinimum}
                onChange={(e) => setFormData({ ...formData, freeDeliveryMinimum: e.target.value })}
                placeholder="0 para desabilitar"
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Valor mínimo do pedido para isentar taxa de entrega
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tempo de Entrega */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#9d0094]" />
            Tempo de Entrega
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure os tempos estimados de entrega
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="deliveryTimeMin" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Tempo Mínimo (minutos) *
              </Label>
              <Input
                id="deliveryTimeMin"
                type="number"
                value={formData.deliveryTimeMin}
                onChange={(e) => setFormData({ ...formData, deliveryTimeMin: e.target.value })}
                placeholder="40"
                required
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deliveryTimeMax" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Tempo Máximo (minutos) *
              </Label>
              <Input
                id="deliveryTimeMax"
                type="number"
                value={formData.deliveryTimeMax}
                onChange={(e) => setFormData({ ...formData, deliveryTimeMax: e.target.value })}
                placeholder="60"
                required
                className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opções */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Power className="h-5 w-5 text-[#9d0094]" />
            Opções de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Delivery Habilitado</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Ativar/desativar serviço de delivery
              </p>
            </div>
            <Switch
              checked={formData.deliveryEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, deliveryEnabled: checked })}
            />
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
