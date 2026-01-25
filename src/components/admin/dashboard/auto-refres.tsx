// components/admin/dashboard/auto-refresh.tsx
'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AutoRefresh({ interval = 30000 }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, interval)

    return () => clearInterval(timer)
  }, [router, interval])

  return null
}
