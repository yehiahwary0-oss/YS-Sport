import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTrainingTemplates, useTrainingTemplate } from '../useTrainingPlans'

vi.mock('@/services/training-plan.service', () => ({
  trainingPlanService: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
  },
}))

const { trainingPlanService } = await import('@/services/training-plan.service')

const template = { uuid: 't1', name: 'Beginner plan' }

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('training plan hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useTrainingTemplates fetches with filters', async () => {
    vi.mocked(trainingPlanService.getTemplates).mockResolvedValue([template] as never)
    const { result } = renderHook(() => useTrainingTemplates({ sport_id: 1 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(trainingPlanService.getTemplates).toHaveBeenCalledWith({ sport_id: 1 })
    expect(result.current.data).toEqual([template])
  })

  it('useTrainingTemplates is disabled when enabled=false', () => {
    const { result } = renderHook(() => useTrainingTemplates({}, false), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(trainingPlanService.getTemplates).not.toHaveBeenCalled()
  })

  it('useTrainingTemplate fetches by uuid', async () => {
    vi.mocked(trainingPlanService.getTemplate).mockResolvedValue(template as never)
    const { result } = renderHook(() => useTrainingTemplate('t1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(trainingPlanService.getTemplate).toHaveBeenCalledWith('t1')
  })

  it('useTrainingTemplate is disabled without uuid', () => {
    const { result } = renderHook(() => useTrainingTemplate(undefined), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(trainingPlanService.getTemplate).not.toHaveBeenCalled()
  })

  it('reports the error state', async () => {
    vi.mocked(trainingPlanService.getTemplates).mockRejectedValue(new Error('down'))
    const { result } = renderHook(() => useTrainingTemplates({}), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
