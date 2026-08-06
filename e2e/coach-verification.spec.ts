import { test, expect, type Page } from '@playwright/test'

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

async function mockApi(page: Page) {
  const setState = (patch: { status?: VerificationStatus; rejectionReason?: string | null }) =>
    page.request.post('http://localhost:8000/__e2e/state', { data: patch })

  const setRole = (role: string) => page.request.post('http://localhost:8000/__e2e/role', { data: { role } })

  return { setRole, setState }
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

test.describe('coach verification flow', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ serviceWorkers: 'block' })

  test('coach submits a certificate, admin approves, coach sees the verified badge', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])
    await installAnalyticsRecorder(page)
    const api = await mockApi(page)
    await api.setState({ status: 'unverified', rejectionReason: null })
    await api.setRole('coach')

    await page.goto('/en/coach/profile')

    await expect(page.getByText('Certification Document')).toBeVisible()
    await page.locator('input[type="file"][accept="application/pdf"]').setInputFiles({
      name: 'certificate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% E2E certificate'),
    })

    await expect(page.getByRole('status')).toContainText('Certificate uploaded.')
    await expect.poll(() => analyticsEvents(page)).toContain('coach_verification_submitted')

    await page.goto('/en/coach/dashboard')

    await expect(page.getByText('Under Review')).toBeVisible()
    await expect(page.getByText('Your documents are being reviewed. Please wait.')).toBeVisible()

    api.setRole('admin')
    await page.goto('/en/admin/coaches')

    await expect(page.getByText('Hassan Coach')).toBeVisible()
    await page.getByRole('button', { name: 'Verify Coach' }).click()

    await expect(page.getByRole('status')).toContainText('Coach verified.')
    await page.reload()
    await expect(page.getByText('All coach applications have been reviewed.')).toBeVisible()

    api.setRole('coach')
    await page.goto('/en/coach/dashboard')

    await expect(page.getByText('Verified')).toBeVisible()
    await expect(page.getByText('Your badge is live on the marketplace.')).toBeVisible()
  })

  test('shows the rejection reason and a re-submit path when the application is rejected', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])
    const api = await mockApi(page)
    await api.setState({ status: 'rejected', rejectionReason: 'Certificate was not legible.' })
    await api.setRole('coach')

    await page.goto('/en/coach/dashboard')

    await expect(page.getByText('Rejected')).toBeVisible()
    await expect(page.getByText('Reason: Certificate was not legible.')).toBeVisible()

    await page.getByRole('link', { name: 'Re-submit' }).click()
    await page.waitForURL('**/en/coach/profile')

    await expect(page.getByText('Reason for rejection')).toBeVisible()
    await expect(page.getByText('Certificate was not legible.')).toBeVisible()
    await expect(page.getByText('Re-upload your certificate below to reapply for verification.')).toBeVisible()
  })

  test('shows the unverified state with a get-verified call to action', async ({ page, context }) => {
    await context.addCookies([
      { name: 'refresh_token', value: 'e2e-refresh', domain: 'localhost', path: '/' },
    ])
    const api = await mockApi(page)
    await api.setState({ status: 'unverified', rejectionReason: null })

    await page.goto('/en/coach/dashboard')

    await expect(page.getByText('Not Submitted')).toBeVisible()
    await expect(page.getByText('Upload your certificate to get verified.')).toBeVisible()

    await page.getByRole('link', { name: 'Get Verified' }).click()
    await page.waitForURL('**/en/coach/profile')
    await expect(page.getByText('Upload Certificate')).toBeVisible()
  })
})

