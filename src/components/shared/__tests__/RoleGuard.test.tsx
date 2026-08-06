import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RoleGuard } from '../RoleGuard'

const replace = vi.fn()

vi.mock('@/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/store/auth.store', () => ({ useAuthStore: vi.fn() }))

const { useAuthStore } = await import('@/store/auth.store')

interface MockUser {
  role: string
  status: string
}

function setAuthState(user: MockUser | null, isInitialized: boolean) {
  vi.mocked(useAuthStore).mockImplementation((selector: (s: never) => unknown) =>
    selector({ user, isInitialized } as never)
  )
}

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the spinner while initializing', () => {
    setAuthState(null, false)
    render(
      <RoleGuard allowedRoles={['athlete']}>
        <div>content</div>
      </RoleGuard>
    )
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users to login', async () => {
    setAuthState(null, true)
    render(
      <RoleGuard allowedRoles={['athlete']}>
        <div>content</div>
      </RoleGuard>
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/login'))
  })

  it('redirects suspended users to the suspended page', async () => {
    setAuthState({ role: 'athlete', status: 'suspended' }, true)
    render(
      <RoleGuard allowedRoles={['athlete']}>
        <div>content</div>
      </RoleGuard>
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/auth/suspended'))
  })

  it('redirects an athlete to the coach dashboard fallback', async () => {
    setAuthState({ role: 'coach', status: 'active' }, true)
    render(
      <RoleGuard allowedRoles={['athlete']}>
        <div>content</div>
      </RoleGuard>
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/coach/dashboard'))
  })

  it('redirects a coach to the athlete dashboard fallback', async () => {
    setAuthState({ role: 'athlete', status: 'active' }, true)
    render(
      <RoleGuard allowedRoles={['coach']}>
        <div>content</div>
      </RoleGuard>
    )
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/athlete/dashboard'))
  })

  it('renders the children for an allowed role', () => {
    setAuthState({ role: 'athlete', status: 'active' }, true)
    render(
      <RoleGuard allowedRoles={['athlete', 'coach']}>
        <div>content</div>
      </RoleGuard>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
