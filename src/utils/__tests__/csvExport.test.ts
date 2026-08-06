import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCsv, timestampedFilename } from '../csvExport'

describe('exportToCsv', () => {
  const createObjectURL = vi.fn(() => 'blob:test')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function lastBlob(): Blob {
    return createObjectURL.mock.calls[createObjectURL.mock.calls.length - 1][0] as Blob
  }

  it('writes a CSV with header, body and BOM', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const appendChild = vi.spyOn(document.body, 'appendChild')
    const removeChild = vi.spyOn(document.body, 'removeChild')

    exportToCsv(
      'report.csv',
      [
        { name: 'Ali', score: 10 },
        { name: 'Sara', score: 20 },
      ],
      [
        { key: 'name', header: 'Name', value: (r) => r.name },
        { key: 'score', header: 'Score', value: (r) => r.score },
      ]
    )

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(appendChild).toHaveBeenCalled()
    expect(removeChild).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
    expect(click).toHaveBeenCalled()

    const bytes = new Uint8Array(await lastBlob().arrayBuffer())
    expect(bytes[0]).toBe(0xef)
    expect(bytes[1]).toBe(0xbb)
    expect(bytes[2]).toBe(0xbf)
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain('Name,Score')
    expect(text).toContain('Ali,10')
    expect(text).toContain('Sara,20')
  })

  it('quotes cells that contain commas or quotes', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    exportToCsv(
      'x.csv',
      [{ note: 'Hello, world', quote: 'He said "hi"' }],
      [
        { key: 'note', header: 'Note', value: (r) => r.note },
        { key: 'quote', header: 'Quote', value: (r) => r.quote },
      ]
    )
    const text = new TextDecoder().decode(await lastBlob().arrayBuffer())
    expect(text).toContain('"Hello, world"')
    expect(text).toContain('"He said ""hi"""')
  })

  it('turns null and undefined values into empty cells', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    exportToCsv(
      'x.csv',
      [{ a: null, b: undefined }],
      [
        { key: 'a', header: 'A', value: (r) => r.a },
        { key: 'b', header: 'B', value: (r) => r.b },
      ]
    )
    const text = new TextDecoder().decode(await lastBlob().arrayBuffer())
    expect(text).toContain('A,B')
    expect(text).toContain('A,')
  })
})

describe('timestampedFilename', () => {
  it('prefixes the timestamp in the expected format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5, 9, 30))
    expect(timestampedFilename('payouts')).toBe('payouts_2026-01-05_09-30.csv')
    vi.useRealTimers()
  })
})
