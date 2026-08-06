import { test, expect, type Page } from '@playwright/test'

const USER = {
  uuid: 'e2e-athlete',
  email: 'athlete@example.com',
  role: 'athlete',
  status: 'active',
  email_verified_at: '2026-01-01T00:00:00Z',
}

async function mockApi(page: Page, { loginStatus = 200 }: { loginStatus?: number } = {}) {
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = req.url()
    const method = req.method()
    if (url.endsWith('/auth/login')) {
      if (loginStatus === 401) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid credentials' } }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { access_token: 'e2e-access-token', token_type: 'Bearer', expires_in: 900 },
        }),
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

test.describe('login', () => {
  test('shows an error toast on failed credentials', async ({ page }) => {
    await mockApi(page, { loginStatus: 401 })
    await page.goto('/en/auth/login')

    await page.getByPlaceholder('you@example.com').fill('athlete@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrong-password')
    await page.getByRole('button', { name: 'Log In' }).click()

    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL(/\/en\/auth\/login$/)
  })

  test('logs in and redirects an athlete to their dashboard', async ({ page, context }) => {
    await mockApi(page)
    await page.goto('/en/auth/login')

    await page.getByPlaceholder('you@example.com').fill('athlete@example.com')
    await page.getByPlaceholder('Enter your password').fill('correct-password')

    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])

    await page.getByRole('button', { name: 'Log In' }).click()

    await expect(page).toHaveURL(/\/en\/athlete\/dashboard$/, { timeout: 15_000 })
    await expect(page.locator('h2').first()).toBeVisible()
  })

  test('shows the session expired banner when expired=1', async ({ page }) => {
    await mockApi(page)
    await page.goto('/en/auth/login?expired=1')

    await expect(
      page.getByText('Your session has expired. Please log in again.')
    ).toBeVisible()
  })
})
