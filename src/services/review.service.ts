import { api } from '@/lib/api'
import type { Review } from '@/types'

export const reviewService = {

  async submit(payload: {
    booking_uuid: string
    rating: number
    comment?: string
  }): Promise<Review> {
    const { data } = await api.post('/reviews', payload)
    return data.data as Review
  },

  async reply(reviewUuid: string, reply: string): Promise<Review> {
    const { data } = await api.put(`/reviews/${reviewUuid}/reply`, { reply })
    return data.data as Review
  },

  async report(reviewUuid: string): Promise<void> {
    await api.post(`/reviews/${reviewUuid}/report`)
  },
}
