import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollToTop } from '../useScrollToTop'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/marketplace'),
}))

const { usePathname } = await import('next/navigation')

describe('useScrollToTop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
  })

  it('scrolls to the top on mount', () => {
    renderHook(() => useScrollToTop())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrolls again when the pathname changes', () => {
    const { rerender } = renderHook(() => useScrollToTop())
    expect(window.scrollTo).toHaveBeenCalledTimes(1)

    vi.mocked(usePathname).mockReturnValue('/en/coaches/c1')
    rerender()

    expect(window.scrollTo).toHaveBeenCalledTimes(2)
  })
})
