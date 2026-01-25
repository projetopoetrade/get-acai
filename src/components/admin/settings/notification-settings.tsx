// components/admin/settings/notification-settings.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, MessageSquare, Mail, Bell, ShoppingCart, Package, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface NotificationSettingsProps {
  settings: any
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Converter valores de string para boolean corretamente
  const getBooleanValue = (value: any, defaultValue: boolean = false) => {
    if (value === undefined || value === null) return defaultValue
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return Boolean(value)
  }

  const [formData, setFormData] = useState({
    whatsappNumber: settings?.whatsapp_number || '',
    emailNotifications: getBooleanValue(settings?.email_notifications, true),
    whatsappNotifications: getBooleanValue(settings?.whatsapp_notifications, true),
    notifyNewOrders: getBooleanValue(settings?.notify_new_orders, true),
    notifyLowStock: getBooleanValue(settings?.notify_low_stock, true),
    autoAcceptOrders: getBooleanValue(settings?.auto_accept_orders, false),
  })

  // Atualizar valores quando settings mudarem
  useEffect(() => {
    if (settings) {
      const getBool = (value: any, defaultValue: boolean = false) => {
        if (value === undefined || value === null) return defaultValue
        if (typeof value === 'string') return value.toLowerCase() === 'true'
        return Boolean(value)
      }
      
      setFormData({
        whatsappNumber: settings?.whatsapp_number || '',
        emailNotifications: getBool(settings?.email_notifications, true),
        whatsappNotifications: getBool(settings?.whatsapp_notifications, true),
        notifyNewOrders: getBool(settings?.notify_new_orders, true),
        notifyLowStock: getBool(settings?.notify_low_stock, true),
        autoAcceptOrders: getBool(settings?.auto_accept_orders, false),
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
      // O backend espera strings mesmo para valores booleanos
      const settingsMap = [
        { key: 'whatsapp_number', value: String(formData.whatsappNumber || '') },
        { key: 'email_notifications', value: String(formData.emailNotifications) }, // Backend espera string "true" ou "false"
        { key: 'whatsapp_notifications', value: String(formData.whatsappNotifications) },
        { key: 'notify_new_orders', value: String(formData.notifyNewOrders) },
        { key: 'notify_low_stock', value: String(formData.notifyLowStock) },
        { key: 'auto_accept_orders', value: String(formData.autoAcceptOrders) },
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
        toast.success('Configurações de notificações salvas!')
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
      {/* WhatsApp */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#9d0094]" />
            WhatsApp
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure as notificações via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="whatsappNumber" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Número do WhatsApp
            </Label>
            <Input
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="5571999999999"
              className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
            />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Formato: código do país + DDD + número (sem espaços ou caracteres especiais)
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Notificações via WhatsApp</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Receber alertas no WhatsApp
              </p>
            </div>
            <Switch
              checked={formData.whatsappNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, whatsappNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-mail */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#9d0094]" />
            E-mail
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure as notificações por e-mail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Notificações por E-mail</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Receber alertas por e-mail
              </p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#9d0094]" />
            Tipos de Notificação
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Escolha quais eventos geram notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Novos Pedidos
              </Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Notificar quando houver um novo pedido
              </p>
            </div>
            <Switch
              checked={formData.notifyNewOrders}
              onCheckedChange={(checked) => setFormData({ ...formData, notifyNewOrders: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Estoque Baixo
              </Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Alertar quando produtos/toppings estiverem acabando
              </p>
            </div>
            <Switch
              checked={formData.notifyLowStock}
              onCheckedChange={(checked) => setFormData({ ...formData, notifyLowStock: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border-2 border-orange-200 dark:border-orange-800 p-4 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-950/30 transition-colors">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Aceitar Pedidos Automaticamente
              </Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                ⚠️ Pedidos serão confirmados sem revisão manual
              </p>
            </div>
            <Switch
              checked={formData.autoAcceptOrders}
              onCheckedChange={(checked) => setFormData({ ...formData, autoAcceptOrders: checked })}
              className="data-[state=checked]:bg-orange-600"
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
