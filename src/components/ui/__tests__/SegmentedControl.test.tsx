import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SegmentedControl } from '../SegmentedControl'

const options = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
]

describe('SegmentedControl', () => {
  it('renders the options and highlights the active one', () => {
    const { container } = render(<SegmentedControl options={options} value="all" onChange={vi.fn()} />)
    const [all, pending] = screen.getAllByRole('button')
    expect(all.className).toContain('bg-green-500')
    expect(pending.className).toContain('text-zinc-400')
    expect(container.querySelector('.flex.gap-1')?.className).toContain('w-fit')
  })

  it('calls onChange with the clicked value', () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="all" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }))
    expect(onChange).toHaveBeenCalledWith('pending')
  })

  it('applies the sm size class', () => {
    render(<SegmentedControl options={options} value="all" onChange={vi.fn()} size="sm" />)
    expect(screen.getAllByRole('button')[0].className).toContain('px-3 py-1.5 text-xs')
  })

  it('applies a custom className', () => {
    const { container } = render(
      <SegmentedControl options={options} value="all" onChange={vi.fn()} className="custom-class" />
    )
    expect(container.querySelector('.flex.gap-1')?.className).toContain('custom-class')
  })
})
