import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayoutRequestModal } from '../PayoutRequestModal'

vi.mock('@/hooks/useCoachPayouts', () => ({
  useRequestPayout: vi.fn(),
}))

const { useRequestPayout } = await import('@/hooks/useCoachPayouts')

function mockMutation() {
  const mutate = vi.fn()
  vi.mocked(useRequestPayout).mockReturnValue({ mutate, isPending: false } as never)
  return mutate
}

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  availableBalance: 500,
  currency: 'USD',
  hasPendingPayout: false,
}

describe('PayoutRequestModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    baseProps.onOpenChange.mockClear()
  })

  it('submits a valid payout request with the backend contract fields', async () => {
    const mutate = mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.type(screen.getByLabelText('amountLabel'), '100')
    await user.selectOptions(screen.getByLabelText('methodLabel'), 'bank_transfer')
    await user.type(screen.getByLabelText('referenceLabel'), 'account-123')
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { amount: 100, payout_method: 'bank_transfer', payout_reference: 'account-123' },
        expect.anything()
      )
    )
  })

  it('omits empty reference from the payload', async () => {
    const mutate = mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.type(screen.getByLabelText('amountLabel'), '250')
    await user.selectOptions(screen.getByLabelText('methodLabel'), 'wallet')
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { amount: 250, payout_method: 'wallet', payout_reference: undefined },
        expect.anything()
      )
    )
  })

  it('shows validation errors for an empty form', async () => {
    mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(screen.getByText('amountRequired')).toBeInTheDocument()
    expect(screen.getByText('methodRequired')).toBeInTheDocument()
  })

  it('shows a minimum amount error below $20', async () => {
    mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.type(screen.getByLabelText('amountLabel'), '10')
    await user.selectOptions(screen.getByLabelText('methodLabel'), 'bank_transfer')
    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(screen.getByText('amountMin')).toBeInTheDocument()
  })

  it('shows a maximum amount error above the available balance', async () => {
    mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.type(screen.getByLabelText('amountLabel'), '600')
    await user.selectOptions(screen.getByLabelText('methodLabel'), 'bank_transfer')
    await user.click(screen.getByRole('button', { name: 'submit' }))

    expect(screen.getByText('amountMax')).toBeInTheDocument()
  })

  it('does not submit when a payout is already pending', async () => {
    const mutate = mockMutation()
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} hasPendingPayout />)

    expect(screen.getByText('pendingBlocked')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'submit' }))
    expect(mutate).not.toHaveBeenCalled()
  })

  it('disables submit when the available balance is below the minimum', () => {
    mockMutation()
    render(<PayoutRequestModal {...baseProps} availableBalance={10} />)
    expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled()
  })

  it('closes and resets after a successful submission', async () => {
    const mutate = vi.fn()
    vi.mocked(useRequestPayout).mockReturnValue({ mutate, isPending: false } as never)
    const user = userEvent.setup()
    render(<PayoutRequestModal {...baseProps} />)

    await user.type(screen.getByLabelText('amountLabel'), '100')
    await user.selectOptions(screen.getByLabelText('methodLabel'), 'bank_transfer')
    await user.click(screen.getByRole('button', { name: 'submit' }))

    const onSuccess = (mutate.mock.calls[0]?.[1] as { onSuccess?: () => void })?.onSuccess

    expect(mutate).toHaveBeenCalled()
    onSuccess?.()
    expect(baseProps.onOpenChange).toHaveBeenCalledWith(false)
  })
})
