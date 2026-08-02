import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationControls, type PaginationMeta } from '../PaginationControls'

const meta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 1,
  last_page: 5,
  per_page: 20,
  total: 100,
  ...overrides,
})

describe('PaginationControls', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = render(<PaginationControls meta={meta({ last_page: 1 })} onPageChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons with labels', () => {
    render(
      <PaginationControls
        meta={meta()}
        onPageChange={vi.fn()}
        previousLabel="Prev"
        nextLabel="Next"
        pageLabel={(p) => `Page ${p}`}
      />
    )
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination')
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
  })

  it('collapses pages into a window and shows gaps', () => {
    render(
      <PaginationControls
        meta={meta({ current_page: 10, last_page: 30 })}
        onPageChange={vi.fn()}
        previousLabel="Prev"
        nextLabel="Next"
        pageLabel={(p) => `Page ${p}`}
      />
    )
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 9' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 10' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 11' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 30' })).toBeInTheDocument()
    expect(screen.getAllByText('…')).toHaveLength(2)
  })

  it('disables next on the last page and calls onPageChange', () => {
    const onPageChange = vi.fn()
    render(
      <PaginationControls
        meta={meta({ current_page: 5 })}
        onPageChange={onPageChange}
        previousLabel="Prev"
        nextLabel="Next"
        pageLabel={(p) => `Page ${p}`}
      />
    )
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })
})
