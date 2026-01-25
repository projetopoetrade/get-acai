// components/admin/neighborhoods/bulk-import-dialog.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function BulkImportDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const router = useRouter()

  const handleImport = async () => {
    setLoading(true)

    try {
      const neighborhoods = JSON.parse(jsonData)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/neighborhoods/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(neighborhoods)
      })

      if (response.ok) {
        toast.success('Bairros importados com sucesso!')
        setOpen(false)
        setJsonData('')
        router.refresh()
      } else {
        toast.error('Erro ao importar bairros')
      }
    } catch (error) {
      toast.error('JSON inválido')
    } finally {
      setLoading(false)
    }
  }

  const exampleJson = `[
  {
    "name": "Centro",
    "customDeliveryFee": 5.00,
    "estimatedTime": "30-40 min"
  },
  {
    "name": "Gleba A",
    "customDeliveryFee": 7.00,
    "estimatedTime": "40-50 min"
  }
]`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar em Massa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Bairros em Massa</DialogTitle>
          <DialogDescription>
            Cole um JSON com a lista de bairros
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder={exampleJson}
              className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Formato: Array JSON com name, customDeliveryFee e estimatedTime
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={loading || !jsonData}>
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
