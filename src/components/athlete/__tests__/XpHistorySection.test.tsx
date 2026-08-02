import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { XpHistorySection } from '../XpHistorySection'

describe('XpHistorySection', () => {
  it('should render the coming soon placeholder', () => {
    render(<XpHistorySection />)

    expect(screen.getByText('xp_history')).toBeInTheDocument()
    expect(screen.getByText('xp_history_desc')).toBeInTheDocument()
    expect(screen.getByText('coming_soon')).toBeInTheDocument()
  })

  it('should be labelled for screen readers', () => {
    render(<XpHistorySection />)

    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
