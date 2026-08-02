import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportToCsv, timestampedFilename } from '../csvExport'

function stubDomDownload() {
  let captured: Blob | null = null
  let capturedLink: Record<string, unknown> | null = null
  const click = vi.fn()
  const link: Record<string, unknown> = { click, setAttribute: vi.fn(), style: {}, href: '' }
  const revokeObjectURL = vi.fn()
  const createObjectURL = vi.fn((b: Blob) => {
    captured = b
    return 'blob:mock'
  })

  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  document.createElement = vi.fn(() => {
    capturedLink = link
    return link as unknown as HTMLElement
  })
  document.body.appendChild = vi.fn()
  document.body.removeChild = vi.fn()

  return {
    click,
    revokeObjectURL,
    getBlob: () => captured as Blob,
    getLink: () => capturedLink as Record<string, unknown>,
  }
}

describe('csvExport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('writes a BOM-prefixed CSV and triggers a download', () => {
    const { click, revokeObjectURL, getBlob, getLink } = stubDomDownload()

    exportToCsv(
      'users.csv',
      [
        { email: 'a@b.com', role: 'athlete' },
        { email: 'b@c.com', role: 'coach' },
      ],
      [
        { key: 'email', header: 'Email', value: (r) => r.email },
        { key: 'role', header: 'Role', value: (r) => r.role },
      ]
    )

    const blob = getBlob()
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/csv;charset=utf-8;')
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
    expect(getLink().download).toBe('users.csv')
    expect(getLink().href).toBe('blob:mock')
  })

  it('escapes commas, quotes and newlines and includes the BOM in the raw bytes', async () => {
    const { getBlob } = stubDomDownload()

    exportToCsv('t.csv', [{ a: 'he said "hi"\nand, more' }], [
      { key: 'a', header: 'Field,One', value: (r) => r.a },
    ])

    const blob = getBlob()
    const raw = new Uint8Array(await blob.arrayBuffer())
    // BOM = EF BB BF, then the UTF-8 payload.
    expect([raw[0], raw[1], raw[2]]).toEqual([0xef, 0xbb, 0xbf])

    const payload = new TextDecoder().decode(raw.subarray(3))
    expect(payload).toContain('"Field,One"')
    expect(payload).toContain('"he said ""hi""\nand, more"')
  })

  it('formats a timestamped filename', () => {
    const name = timestampedFilename('users')
    expect(name).toMatch(/^users_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.csv$/)
  })
})
