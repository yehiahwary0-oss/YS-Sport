import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { MetricCard } from '../MetricCard'

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard icon={Users} label="Total Users" value={42} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders a positive delta in green', () => {
    render(<MetricCard icon={Users} label="Users" value={10} delta={25} deltaLabel="vs last month" />)
    expect(screen.getByText('vs last month')).toBeInTheDocument()
    expect(screen.getByText('vs last month').className).toContain('text-green-400')
  })

  it('renders a negative delta in red', () => {
    render(<MetricCard icon={Users} label="Users" value={10} delta={-12} deltaLabel="vs last month" />)
    expect(screen.getByText('vs last month').className).toContain('text-red-400')
  })

  it('renders no delta when not provided', () => {
    const { container } = render(<MetricCard icon={Users} label="Users" value={10} />)
    expect(container.querySelector('svg[data-lucide="trending-up"], svg[data-lucide="trending-down"]')).toBeNull()
  })

  it('highlights the card when flagged', () => {
    const { container } = render(<MetricCard icon={Users} label="Pending" value={3} highlight />)
    expect(container.firstChild?.className).toContain('border-amber-500/40')
  })
})
