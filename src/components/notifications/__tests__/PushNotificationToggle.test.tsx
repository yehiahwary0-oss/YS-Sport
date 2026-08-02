import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PushNotificationToggle } from '../PushNotificationToggle'

vi.mock('@/hooks/usePushNotifications', () => ({
  usePushNotifications: vi.fn(),
}))

import { usePushNotifications } from '@/hooks/usePushNotifications'

const mockHook = usePushNotifications as ReturnType<typeof vi.fn>

describe('PushNotificationToggle', () => {
  it('renders nothing when push is unsupported', () => {
    mockHook.mockReturnValue({ supported: false })
    const { container } = render(<PushNotificationToggle />)
    expect(container.firstChild).toBeNull()
  })

  it('shows disabled state and enables on click', () => {
    const enable = vi.fn().mockResolvedValue(true)
    const disable = vi.fn()
    mockHook.mockReturnValue({ supported: true, isEnabled: false, loading: false, enable, disable })

    render(<PushNotificationToggle />)

    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(toggle)
    expect(enable).toHaveBeenCalled()
  })

  it('shows enabled state and disables on click', () => {
    const enable = vi.fn()
    const disable = vi.fn().mockResolvedValue(undefined)
    mockHook.mockReturnValue({ supported: true, isEnabled: true, loading: false, enable, disable })

    render(<PushNotificationToggle />)

    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(disable).toHaveBeenCalled()
  })

  it('disables the switch while loading', () => {
    mockHook.mockReturnValue({ supported: true, isEnabled: false, loading: true, enable: vi.fn(), disable: vi.fn() })

    render(<PushNotificationToggle />)

    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
