// components/reviews/review-list.tsx
'use client'

import { Review } from '@/types/review'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface ReviewListProps {
  reviews: Review[]
  productId: string
}

export function ReviewList({ reviews, productId }: ReviewListProps) {
  // Filtrar apenas reviews aprovadas e do produto correto
  const approvedReviews = reviews.filter(
    (review) => review.productId === productId && review.approved
  )

  if (approvedReviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            Ainda não há avaliações para este produto.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {approvedReviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Header com nome e data */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {review.user?.name || 'Anônimo'}
                  </p>
                  {review.createdAt && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                {/* Rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Comentário */}
              {review.comment && (
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {review.comment}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
