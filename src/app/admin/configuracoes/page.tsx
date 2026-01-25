// app/admin/configuracoes/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/admin/settings/general-settings"
import { DeliverySettings } from "@/components/admin/settings/delivery-settings"
import { PaymentSettings } from "@/components/admin/settings/payment-settings"
import { NotificationSettings } from "@/components/admin/settings/notification-settings"
import { Store, Truck, CreditCard, Bell, Settings } from "lucide-react"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSettings() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    redirect('/login?redirect=/admin/configuracoes')
  }
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirect('/login?redirect=/admin/configuracoes')
    }
    return null
  }

  const settingsArray = await response.json()
  
  // Transformar array de settings em objeto { key: value }
  const settingsObj: Record<string, any> = {}
  if (Array.isArray(settingsArray)) {
    settingsArray.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value
    })
  }
  
  return settingsObj
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#9d0094] rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Configurações da Loja</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Configure o funcionamento da sua loja
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl">
            <TabsTrigger 
              value="general" 
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Store className="h-4 w-4" />
              <span className="font-medium">Geral</span>
            </TabsTrigger>
            <TabsTrigger 
              value="delivery" 
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Truck className="h-4 w-4" />
              <span className="font-medium">Entrega</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Pagamento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg data-[state=active]:bg-[#9d0094] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Bell className="h-4 w-4" />
              <span className="font-medium">Notificações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-6">
            <GeneralSettings settings={settings} />
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-6">
            <DeliverySettings settings={settings} />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-6">
            <PaymentSettings settings={settings} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <NotificationSettings settings={settings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
