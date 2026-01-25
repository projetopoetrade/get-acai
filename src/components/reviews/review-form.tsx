// components/reviews/review-form.tsx
'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ReviewFormProps {
  productId: string
  productName: string
  orderId?: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, productName, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para avaliar');
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          comment: comment.trim() || undefined
        })
      })

      if (response.ok) {
        toast.success('Avaliação enviada com sucesso!')
        setRating(0)
        setComment('')
        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao enviar avaliação')
      }
    } catch (error) {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar Produto</CardTitle>
        <CardDescription>{productName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Sua avaliação *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Muito ruim'}
                {rating === 2 && 'Ruim'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bom'}
                {rating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos sobre sua experiência..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
