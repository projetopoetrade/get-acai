// components/admin/settings/payment-settings.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PaymentSettingsProps {
  settings: any
}

export function PaymentSettings({ settings }: PaymentSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  // Converter valores de string para boolean corretamente
  const getBooleanValue = (value: any, defaultValue: boolean = true) => {
    if (value === undefined || value === null) return defaultValue
    if (typeof value === 'string') return value.toLowerCase() === 'true'
    return Boolean(value)
  }

  const [formData, setFormData] = useState({
    acceptCash: getBooleanValue(settings?.accept_cash, true),
    acceptCreditCard: getBooleanValue(settings?.accept_credit_card, true),
    acceptDebitCard: getBooleanValue(settings?.accept_debit_card, true),
    acceptPix: getBooleanValue(settings?.accept_pix, true),
    pixKey: settings?.pix_key || '',
    pixType: settings?.pix_type || 'phone',
    minimumOrderValue: settings?.minimum_order?.toString() || '',
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
        acceptCash: getBool(settings?.accept_cash, true),
        acceptCreditCard: getBool(settings?.accept_credit_card, true),
        acceptDebitCard: getBool(settings?.accept_debit_card, true),
        acceptPix: getBool(settings?.accept_pix, true),
        pixKey: settings?.pix_key || '',
        pixType: settings?.pix_type || 'phone',
        minimumOrderValue: settings?.minimum_order?.toString() || '',
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
        { key: 'accept_cash', value: String(formData.acceptCash) }, // Backend espera string "true" ou "false"
        { key: 'accept_credit_card', value: String(formData.acceptCreditCard) },
        { key: 'accept_debit_card', value: String(formData.acceptDebitCard) },
        { key: 'accept_pix', value: String(formData.acceptPix) },
        { key: 'pix_key', value: String(formData.pixKey || '') },
        { key: 'pix_type', value: String(formData.pixType || 'phone') },
        { key: 'minimum_order', value: formData.minimumOrderValue ? String(Number(parseFloat(formData.minimumOrderValue))) : null },
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
        toast.success('Configurações de pagamento salvas!')
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

  const copyPixKey = () => {
    navigator.clipboard.writeText(formData.pixKey)
    setCopied(true)
    toast.success('Chave PIX copiada!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Métodos de Pagamento */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Métodos de Pagamento
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Selecione as formas de pagamento aceitas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">💵 Dinheiro</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Pagamento na entrega
                </p>
              </div>
              <Switch
                checked={formData.acceptCash}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptCash: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">💳 Cartão de Crédito</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Maquininha na entrega
                </p>
              </div>
              <Switch
                checked={formData.acceptCreditCard}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptCreditCard: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">💳 Cartão de Débito</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Maquininha na entrega
                </p>
              </div>
              <Switch
                checked={formData.acceptDebitCard}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptDebitCard: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border-2 border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-neutral-900 dark:text-neutral-100">🔑 PIX</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Pagamento instantâneo
                </p>
              </div>
              <Switch
                checked={formData.acceptPix}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptPix: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações PIX */}
      {formData.acceptPix && (
        <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Configurações PIX
            </CardTitle>
            <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
              Configure sua chave PIX
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pixType" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Tipo de Chave
                </Label>
                <select
                  id="pixType"
                  value={formData.pixType}
                  onChange={(e) => setFormData({ ...formData, pixType: e.target.value })}
                  className="flex h-10 w-full rounded-md border-2 border-neutral-200 dark:border-neutral-800 bg-background px-3 py-2 text-sm"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pixKey" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Chave PIX
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="pixKey"
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    placeholder="sua-chave-pix"
                    className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
                  />
                  {formData.pixKey && (
                    <Button type="button" variant="outline" size="icon" onClick={copyPixKey} className="border-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pedido Mínimo */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Valor Mínimo do Pedido
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400">
            Configure o valor mínimo para aceitar pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="minimumOrderValue" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Valor Mínimo (R$)
            </Label>
            <Input
              id="minimumOrderValue"
              type="number"
              step="0.01"
              value={formData.minimumOrderValue}
              onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
              placeholder="Deixe vazio para não ter mínimo"
              className="border-2 border-neutral-200 dark:border-neutral-800 h-10"
            />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Pedidos abaixo deste valor não serão aceitos
            </p>
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
