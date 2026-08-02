import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { InstallPWA } from '../InstallPWA'

type PromptEvent = Event & {
  preventDefault: ReturnType<typeof vi.fn>
  prompt: ReturnType<typeof vi.fn>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const firePrompt = (outcome: 'accepted' | 'dismissed' = 'accepted'): PromptEvent => {
  const event = new Event('beforeinstallprompt') as PromptEvent
  Object.assign(event, {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome, platform: 'web' }),
  })
  act(() => {
    window.dispatchEvent(event)
  })
  return event
}

const matchMediaMock = (standalone = false, mobile = true) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: query === '(display-mode: standalone)' ? standalone : mobile,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

describe('InstallPWA', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = matchMediaMock() as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    vi.restoreAllMocks()
  })

  it('shows the install button on mobile when the prompt fires', async () => {
    render(<InstallPWA />)
    firePrompt()
    expect(await screen.findByRole('button', { name: 'install' })).toBeInTheDocument()
  })

  it('hides the button when dismissed and remembers for 7 days', async () => {
    render(<InstallPWA />)
    firePrompt('dismissed')

    const button = await screen.findByRole('button', { name: 'install' })
    fireEvent.click(button)

    await waitFor(() => expect(screen.queryByRole('button', { name: 'install' })).not.toBeInTheDocument())
    expect(localStorage.getItem('ys-install-dismissed-at')).not.toBeNull()
  })

  it('does not show again after dismissal until the TTL expires', async () => {
    localStorage.setItem('ys-install-dismissed-at', String(Date.now()))
    render(<InstallPWA />)
    firePrompt()
    expect(screen.queryByRole('button', { name: 'install' })).not.toBeInTheDocument()
  })

  it('accepts the install prompt and hides', async () => {
    render(<InstallPWA />)
    const promptEvent = firePrompt('accepted')

    const button = await screen.findByRole('button', { name: 'install' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(promptEvent.prompt).toHaveBeenCalled()
      expect(screen.queryByRole('button', { name: 'install' })).not.toBeInTheDocument()
    })
  })

  it('does not show the button while running as an installed PWA', () => {
    window.matchMedia = matchMediaMock(true) as unknown as typeof window.matchMedia
    render(<InstallPWA />)
    firePrompt()
    expect(screen.queryByRole('button', { name: 'install' })).not.toBeInTheDocument()
  })
})
