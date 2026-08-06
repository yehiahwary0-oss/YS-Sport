import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../page'
import { EXPIRED_QUERY_PARAM } from '@/lib/session-events'

const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

const mockRouter = { push: vi.fn(), replace: vi.fn() }
vi.mock('@/navigation', () => ({
  useRouter: () => mockRouter,
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const mockStoreState = { user: null, login: vi.fn() }
vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => selector(mockStoreState),
}))

vi.mock('@/lib/api', () => ({
  getApiError: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/components/layout/AuthLayout', () => ({
  AuthLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete(EXPIRED_QUERY_PARAM)
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('loginTitle')).toBeInTheDocument()
    expect(screen.getByText('loginButton')).toBeInTheDocument()
  })

  it('does not show the session expired banner without the param', () => {
    render(<LoginPage />)
    expect(screen.queryByTestId('session-expired-banner')).not.toBeInTheDocument()
  })

  it('shows the session expired banner when expired=1 is present', () => {
    mockSearchParams.set(EXPIRED_QUERY_PARAM, '1')
    render(<LoginPage />)
    const banner = screen.getByTestId('session-expired-banner')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('sessionExpired')
    expect(banner).toHaveAttribute('role', 'alert')
  })

  it('does not show the banner when expired has a non-1 value', () => {
    mockSearchParams.set(EXPIRED_QUERY_PARAM, '0')
    render(<LoginPage />)
    expect(screen.queryByTestId('session-expired-banner')).not.toBeInTheDocument()
  })

  it('submits credentials and redirects an athlete', async () => {
    vi.mocked(mockStoreState.login).mockResolvedValue({ role: 'athlete' })
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByText('loginButton'))

    await waitFor(() => {
      expect(mockStoreState.login).toHaveBeenCalledWith('a@b.com', 'secret')
      expect(mockRouter.push).toHaveBeenCalledWith('/athlete/dashboard')
    })
  })

  it('redirects an admin to the admin dashboard', async () => {
    vi.mocked(mockStoreState.login).mockResolvedValue({ role: 'admin' })
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByText('loginButton'))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  it('shows an error toast on failed login', async () => {
    vi.mocked(mockStoreState.login).mockRejectedValue(new Error('Invalid credentials'))
    render(<LoginPage />)

    fireEvent.change(screen.getByPlaceholderText('emailPlaceholder'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('passwordPlaceholder'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('loginButton'))

    const toast = await import('react-hot-toast')
    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })
})
