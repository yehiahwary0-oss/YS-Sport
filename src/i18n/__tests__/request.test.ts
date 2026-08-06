import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn((fn: (params: { requestLocale: Promise<string | undefined> }) => unknown) => fn),
}))

vi.mock('next-intl', () => ({
  hasLocale: vi.fn((locales: readonly string[], requested: unknown) => (locales as readonly string[]).includes(requested as string)),
}))

const importRequest = async () => {
  vi.resetModules()
  vi.clearAllMocks()
  return (await import('../request')).default
}

afterEach(() => {
  vi.resetModules()
})

describe('i18n request config', () => {
  it('uses the requested locale when it is supported', async () => {
    const getRequestConfig = await importRequest()
    const config = await getRequestConfig({ requestLocale: Promise.resolve('ar') } as never)
    expect(config.locale).toBe('ar')
  })

  it('falls back to the default locale for unsupported values', async () => {
    const getRequestConfig = await importRequest()
    const config = await getRequestConfig({ requestLocale: Promise.resolve('fr') } as never)
    expect(config.locale).toBe('en')
  })

  it('falls back to the default locale when the request locale is undefined', async () => {
    const getRequestConfig = await importRequest()
    const config = await getRequestConfig({ requestLocale: Promise.resolve(undefined) } as never)
    expect(config.locale).toBe('en')
  })

  it('loads the messages for the resolved locale', async () => {
    const getRequestConfig = await importRequest()
    const config = await getRequestConfig({ requestLocale: Promise.resolve('en') } as never)
    expect(config.messages).toBeDefined()
    expect(typeof config.messages).toBe('object')
  })
})
