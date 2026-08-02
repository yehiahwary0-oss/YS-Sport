import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '../ActivityFeed'
import type { AuditLogEntry } from '@/services/admin.service'

const entry = (overrides: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  id: 1,
  action: 'user.suspended',
  target_type: 'App\\Models\\User',
  target_uuid: 'uuid-1',
  notes: 'spam',
  admin: { uuid: 'admin-1', email: 'admin@test.com' },
  created_at: '2026-08-01T10:00:00Z',
  ...overrides,
})

describe('ActivityFeed', () => {
  it('renders entries with mapped labels and admin email', () => {
    render(<ActivityFeed items={[entry(), entry({ id: 2, action: 'payment.confirmed', notes: null })]} />)
    expect(screen.getAllByText(/admin@test\.com/)).toHaveLength(2)
    expect(screen.getByText(/actionUserSuspended/)).toBeInTheDocument()
    expect(screen.getByText(/spam/)).toBeInTheDocument()
  })

  it('falls back to the raw action for unknown actions', () => {
    render(<ActivityFeed items={[entry({ action: 'custom.action', notes: null })]} />)
    expect(screen.getByText('custom action')).toBeInTheDocument()
  })

  it('shows empty state when there are no items', () => {
    render(<ActivityFeed items={[]} />)
    expect(screen.getByText('emptyTitle')).toBeInTheDocument()
  })
})
