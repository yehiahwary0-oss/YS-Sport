import { describe, it, expect } from 'vitest'
import { absoluteUrl, generateSeoMetadata, localizedPath } from '../seo'

describe('absoluteUrl', () => {
  it('joins the site URL with a leading-slash path', () => {
    expect(absoluteUrl('/en/marketplace')).toBe('http://localhost:3000/en/marketplace')
  })

  it('adds a leading slash when missing', () => {
    expect(absoluteUrl('en/marketplace')).toBe('http://localhost:3000/en/marketplace')
  })

  it('handles an empty path', () => {
    expect(absoluteUrl()).toBe('http://localhost:3000/')
  })
})

describe('generateSeoMetadata', () => {
  it('builds title, description, canonical and OG defaults', () => {
    const meta = generateSeoMetadata({
      title: 'Marketplace',
      description: 'Find coaches',
      path: '/en/marketplace',
    })

    expect(meta.title).toBe('Marketplace')
    expect(meta.description).toBe('Find coaches')
    expect(meta.alternates?.canonical).toBe('http://localhost:3000/en/marketplace')
    expect(meta.openGraph?.url).toBe('http://localhost:3000/en/marketplace')
    expect(meta.openGraph?.title).toBe('Marketplace')
    expect(meta.openGraph?.description).toBe('Find coaches')
    expect(meta.openGraph?.locale).toBe('en_US')
    expect(meta.openGraph?.type).toBe('website')
    expect(meta.openGraph?.images).toEqual([
      { url: 'http://localhost:3000/cover.png', width: 1200, height: 630 },
    ])
    expect(meta.twitter?.card).toBe('summary_large_image')
    expect(meta.twitter?.images).toEqual(['http://localhost:3000/cover.png'])
    expect(meta.openGraph?.alternates).toBeUndefined()
    expect(meta.alternates?.languages).toBeUndefined()
  })

  it('uses custom OG fields and locale alternates when provided', () => {
    const meta = generateSeoMetadata({
      title: 'Page',
      ogTitle: 'OG Page',
      ogDescription: 'OG desc',
      path: '/x',
      image: '/custom.png',
      locales: { en: 'http://localhost:3000/en/x', ar: 'http://localhost:3000/ar/x' },
    })

    expect(meta.openGraph?.title).toBe('OG Page')
    expect(meta.openGraph?.description).toBe('OG desc')
    expect(meta.twitter?.title).toBe('OG Page')
    expect(meta.openGraph?.images).toEqual([{ url: 'http://localhost:3000/custom.png', width: 1200, height: 630 }])
    expect(meta.openGraph?.alternates).toEqual({
      locales: { en: 'http://localhost:3000/en/x', ar: 'http://localhost:3000/ar/x' },
    })
    expect(meta.alternates?.languages).toEqual({
      en: 'http://localhost:3000/en/x',
      ar: 'http://localhost:3000/ar/x',
    })
  })
})

describe('localizedPath', () => {
  it('prefixes the locale', () => {
    expect(localizedPath('ar', '/marketplace')).toBe('/ar/marketplace')
  })
})
