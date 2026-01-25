import { Cookie, Layout, ShoppingCart, Package, MapPin, Settings, LayoutDashboard,  BarChart } from "lucide-react";

// components/admin/sidebar.tsx
const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: ShoppingCart, label: 'Pedidos', href: '/admin/pedidos', badge: 'live' },
    { icon: Package, label: 'Produtos', href: '/admin/produtos' },
    { icon: Cookie, label: 'Toppings', href: '/admin/toppings' },
    { icon: MapPin, label: 'Bairros', href: '/admin/bairros' },
    { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
    { icon: BarChart, label: 'Relatórios', href: '/admin/relatorios' }  
  ]
  