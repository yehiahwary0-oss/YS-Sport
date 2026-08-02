import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PayoutStatusBadge } from '../PayoutStatusBadge'

describe('PayoutStatusBadge', () => {
  it.each(['pending', 'approved', 'processing', 'sent', 'rejected', 'failed'] as const)(
    'renders the %s status label',
    (status) => {
      render(<PayoutStatusBadge status={status} />)
      expect(screen.getByText(`status_${status}`)).toBeInTheDocument()
    }
  )
})
