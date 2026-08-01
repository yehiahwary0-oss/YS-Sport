import { api } from '@/lib/api'

export interface ReferralStats {
  total: number
  pending: number
  qualified: number
  total_reward: number
}

export interface ReferralHistoryItem {
  id: number
  referee_email: string
  status: string
  reward_amount: number
  qualified_at: string | null
  created_at: string
}

export interface ReferralData {
  code: string
  share_url: string
  stats: ReferralStats
  history: ReferralHistoryItem[]
}

export const referralService = {
  async getReferralInfo(): Promise<ReferralData> {
    const { data } = await api.get('/referral')
    return data.data as ReferralData
  },

  async regenerateCode(): Promise<{ code: string; share_url: string }> {
    const { data } = await api.post('/referral/generate-code')
    return data.data as { code: string; share_url: string }
  },
}
