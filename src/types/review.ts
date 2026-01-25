// types/review.ts
export interface Review {
    id: string
    userId: string
    productId: string
    orderId?: string
    rating: number // 1-5
    comment?: string
    helpful?: number
    notHelpful?: number
    approved: boolean
    createdAt: string
    user: {
      name: string
      avatar?: string
    }
    product: {
      name: string
    }
  }
  