// app/admin/layout.tsx
import { AutoRefresh } from "@/components/admin/dashboard/auto-refres"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <AutoRefresh interval={30000} /> {/* 30 segundos */}
        {children}
      </main>
    </div>
  )
}
