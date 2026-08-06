import { test, expect } from '@playwright/test'

test.describe('home page', () => {
  test('renders the hero and defaults to English', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.locator('html').getAttribute('lang')).toBe('en')
  })

  test('switches locale to Arabic and back', async ({ page }) => {
    await page.goto('/en')

    const enHero = await page.locator('h1').textContent()
    expect(enHero?.trim().length).toBeGreaterThan(0)

    await page.getByLabel('Switch language').click()
    await page.getByRole('menuitem', { name: 'العربية' }).click()
    await expect(page).toHaveURL(/\/ar$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')

    const arHero = await page.locator('h1').textContent()
    expect(arHero).not.toBe(enHero)

    await page.getByLabel('Switch language').click()
    await page.getByRole('menuitem', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en$/)
  })
})