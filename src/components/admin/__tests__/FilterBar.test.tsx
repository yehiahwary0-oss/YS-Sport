import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '../FilterBar'

describe('FilterBar', () => {
  it('renders search, selects and date inputs', () => {
    render(
      <FilterBar
        search=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search users"
        options={[
          {
            name: 'role',
            label: 'Role',
            value: '',
            onChange: vi.fn(),
            options: [
              { value: '', label: 'All' },
              { value: 'coach', label: 'Coaches' },
            ],
          },
        ]}
        dateFrom=""
        dateTo=""
        onDateChange={vi.fn()}
        onExport={vi.fn()}
        exportLabel="Export CSV"
      />
    )
    expect(screen.getByLabelText('Search users')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument()
  })

  it('fires search, select and date change callbacks', () => {
    const onSearchChange = vi.fn()
    const onRoleChange = vi.fn()
    const onDateChange = vi.fn()
    render(
      <FilterBar
        search=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Search users"
        options={[
          {
            name: 'role',
            label: 'Role',
            value: '',
            onChange: onRoleChange,
            options: [
              { value: '', label: 'All' },
              { value: 'coach', label: 'Coaches' },
            ],
          },
        ]}
        dateFrom=""
        dateTo=""
        onDateChange={onDateChange}
      />
    )
    fireEvent.change(screen.getByLabelText('Search users'), { target: { value: 'sarah' } })
    expect(onSearchChange).toHaveBeenCalledWith('sarah')

    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'coach' } })
    expect(onRoleChange).toHaveBeenCalledWith('coach')

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-07-01' } })
    expect(onDateChange).toHaveBeenCalledWith({ dateFrom: '2026-07-01', dateTo: '' })
  })

  it('shows the reset button only when a filter is active', () => {
    const onReset = vi.fn()
    const { rerender } = render(
      <FilterBar search="" onSearchChange={vi.fn()} searchPlaceholder="Search" onReset={onReset} resetLabel="Reset" showDates={false} />
    )
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()

    rerender(
      <FilterBar search="x" onSearchChange={vi.fn()} searchPlaceholder="Search" onReset={onReset} resetLabel="Reset" showDates={false} />
    )
    const reset = screen.getByRole('button', { name: 'Reset' })
    fireEvent.click(reset)
    expect(onReset).toHaveBeenCalled()
  })

  it('hides dates when showDates is false', () => {
    render(<FilterBar showDates={false} />)
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument()
  })
})
