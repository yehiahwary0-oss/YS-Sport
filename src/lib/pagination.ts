import type { PaginatedResponse } from '@/types'

export interface RawPaginator<T> {
  data: T[]
  current_page: number
  per_page: number
  last_page: number
  total: number
}

export function toPaginated<T>(raw: RawPaginator<T>): PaginatedResponse<T> {
  return {
    data: raw.data,
    meta: {
      current_page: raw.current_page,
      per_page: raw.per_page,
      last_page: raw.last_page,
      total: raw.total,
    },
  }
}
