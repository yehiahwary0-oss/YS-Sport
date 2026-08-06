import { test, expect, type Page } from '@playwright/test'

const UUID = 'payment-e2e-booking'
const USER = {
  uuid: 'e2e-athlete',
  email: 'athlete@example.com',
  role: 'athlete',
  status: 'active',
  email_verified_at: '2026-01-01T00:00:00Z',
}

const BOOKING = {
  uuid: UUID,
  sport_id: 1,
  status: 'confirmed',
  session_link: null,
  slot: { starts_at: '2026-01-10T10:00:00Z' },
  payment: {
    status: 'pending',
    amount: '100.00',
    currency: 'USD',
    payment_method: 'processor',
  },
}

const BOOKING_PAID = {
  ...BOOKING,
  payment: { ...BOOKING.payment, status: 'paid' },
}

async function mockApi(page: Page, { bookingStatus = 'pending' }: { bookingStatus?: 'pending' | 'paid' } = {}) {
  const booking = bookingStatus === 'paid' ? BOOKING_PAID : BOOKING

  await page.context().route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = req.url()
    const method = req.method()

    if (url.endsWith(`/bookings/${UUID}`) && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: booking }),
      })
    }

    if (url.endsWith(`/bookings/${UUID}/pay`) && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            provider: 'paymob',
            transaction_id: 'e2e-order-42',
            checkout_url: 'https://accept.paymobsandbox.com/iframe?token=e2e-pk',
          },
        }),
      })
    }

    if (url.endsWith(`/bookings/${UUID}/pay/success`) && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: BOOKING_PAID.payment }),
      })
    }

    if (url.endsWith('/auth/me') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: USER }),
      })
    }

    if (url.endsWith('/auth/refresh')) {
      return route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
    }

    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })
}

async function stubSandboxIframe(page: Page) {
  await page.context().route('https://accept.paymobsandbox.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<html><body>
        <h1>Paymob Sandbox</h1>
        <button id="complete"
          onclick="window.location.href='http://localhost:3000/en/athlete/bookings/${UUID}/payment/success'">
          Complete Payment
        </button>
      </body></html>`,
    })
  })
}

async function installAnalyticsRecorder(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __analyticsEvents: string[]
      plausible?: (...args: unknown[]) => void
    }
    w.__analyticsEvents = []
    w.plausible = (name: unknown) => {
      w.__analyticsEvents.push(String(name))
    }
  })
}

function analyticsEvents(page: Page) {
  return page.evaluate(() => (window as unknown as { __analyticsEvents: string[] }).__analyticsEvents)
}

test.describe('payment flow', () => {
  test('opens sandbox checkout and confirms the payment on return', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])
    await installAnalyticsRecorder(page)
    await mockApi(page)
    await stubSandboxIframe(page)

    await page.goto(`/en/athlete/bookings/${UUID}`)

    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: 'Pay Online' }).click()

    await expect.poll(() => analyticsEvents(page)).toContain('payment_initiated')

    const popup = await popupPromise
    await expect(popup.locator('h1')).toContainText('Paymob Sandbox')

    await popup.getByRole('button', { name: 'Complete Payment' }).click()

    await expect(popup.getByRole('heading', { name: 'Payment Successful' })).toBeVisible()
    await expect(popup.getByText('\$100')).toBeVisible()
  })

  test('confirms a paid payment when the success page is revisited', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])
    await installAnalyticsRecorder(page)
    await mockApi(page)

    await page.goto(`/en/athlete/bookings/${UUID}/payment/success`)

    await expect(page.getByRole('heading', { name: 'Payment Successful' })).toBeVisible()
    await expect(page.getByText('\$100')).toBeVisible()

    await expect.poll(() => analyticsEvents(page)).toContain('payment_success')
  })

  test('shows the waiting state while the payment is still pending', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])

    await page.context().route('**/api/v1/**', async (route) => {
      const req = route.request()
      const url = req.url()

      if (url.endsWith(`/bookings/${UUID}`) && req.method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: BOOKING }),
        })
      }
      if (url.endsWith(`/bookings/${UUID}/pay/success`) && req.method() === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: BOOKING.payment }),
        })
      }
      if (url.endsWith('/auth/me') && req.method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: USER }),
        })
      }
      if (url.endsWith('/auth/refresh')) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: '{}' })
      }
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    })

    await page.goto(`/en/athlete/bookings/${UUID}/payment/success`)

    await expect(page.getByRole('heading', { name: 'Awaiting payment confirmation' })).toBeVisible()
    await expect(page.getByText('\$100')).toBeVisible()
  })
})
