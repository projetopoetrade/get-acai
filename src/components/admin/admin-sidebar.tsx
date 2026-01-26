'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Cookie, 
  MapPin, 
  Layers,
  PackageCheck,
  Settings,
  BarChart3,
  Menu,
  X,
  UploadCloud, // ✅ Novo ícone importado
  Users
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/admin/pedidos' },
  { icon: Package, label: 'Produtos', href: '/admin/produtos' },
  { icon: Cookie, label: 'Toppings', href: '/admin/toppings' },
  { icon: Layers, label: 'Categorias', href: '/admin/categorias' },
  { icon: PackageCheck, label: 'Estoque', href: '/admin/estoque' },
  { icon: UploadCloud, label: 'Uploads', href: '/admin/upload' }, // ✅ Nova rota adicionada
  { icon: MapPin, label: 'Bairros', href: '/admin/bairros' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
  { icon: Users, label: 'Usuários', href: '/admin/usuarios' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-900 border-r-2 border-neutral-200 dark:border-neutral-800 z-40 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#9d0094] rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  Admin Panel
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  GetAçaí
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group',
                    isActive
                      ? 'bg-[#9d0094] text-white shadow-md shadow-[#9d0094]/20'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              © 2026 GetAçaí
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}