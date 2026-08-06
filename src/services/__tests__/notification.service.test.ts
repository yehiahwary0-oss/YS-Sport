import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notificationService } from '../notification.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}))

const { api } = await import('@/lib/api')

describe('notificationService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list paginates with filters', async () => {
    const envelope = { data: { data: { data: [{ id: 1 }], current_page: 1, per_page: 15, last_page: 1, total: 1 } } }
    vi.mocked(api.get).mockResolvedValue(envelope)

    const result = await notificationService.list({ page: 2, type: ['booking'], read: false })

    expect(api.get).toHaveBeenCalledWith('/notifications', { params: { page: 2, type: ['booking'], read: false } })
    expect(result.meta.total).toBe(1)
    expect(result.data).toEqual([{ id: 1 }])
  })

  it('list works without params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { data: [] } } })
    await notificationService.list()
    expect(api.get).toHaveBeenCalledWith('/notifications', { params: undefined })
  })

  it('unreadCount reads data.data.count', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { count: 3 } } })
    await expect(notificationService.unreadCount()).resolves.toBe(3)
    expect(api.get).toHaveBeenCalledWith('/notifications/unread-count')
  })

  it('markRead PUTs the uuid', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await notificationService.markRead('n1')
    expect(api.put).toHaveBeenCalledWith('/notifications/n1/read')
  })

  it('markAllRead PUTs the read-all endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await notificationService.markAllRead()
    expect(api.put).toHaveBeenCalledWith('/notifications/read-all')
  })
})
