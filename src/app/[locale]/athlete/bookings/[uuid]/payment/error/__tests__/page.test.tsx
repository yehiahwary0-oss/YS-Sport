import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaymentErrorPage from '../page'

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ uuid: 'b1' })),
}))

describe('PaymentErrorPage', () => {
  it('shows the error state with a link back to the booking', () => {
    render(<PaymentErrorPage />)
    expect(screen.getByText('errorTitle')).toBeInTheDocument()
    expect(screen.getByText('errorDesc')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'backToBooking' })).toBeInTheDocument()
  })
})
