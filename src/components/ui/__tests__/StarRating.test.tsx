import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating, StarDisplay } from '../StarRating'

function starClasses(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('svg')).map(
    (svg) => (svg as SVGElement).getAttribute('class') ?? ''
  )
}

describe('StarRating', () => {
  it('renders five stars', () => {
    render(<StarRating value={3} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('fills stars up to the value', () => {
    const { container } = render(<StarRating value={2} />)
    const classes = starClasses(container)
    expect(classes[0]).toContain('fill-amber-400')
    expect(classes[1]).toContain('fill-amber-400')
    expect(classes[2]).toContain('fill-none')
  })

  it('calls onChange with the star number', () => {
    const onChange = vi.fn()
    render(<StarRating value={1} onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('button')[3])
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('previews the hovered star', () => {
    const { container } = render(<StarRating value={1} />)
    fireEvent.mouseEnter(screen.getAllByRole('button')[4])
    let classes = starClasses(container)
    expect(classes[4]).toContain('fill-amber-400')
    fireEvent.mouseLeave(screen.getAllByRole('button')[4])
    classes = starClasses(container)
    expect(classes[4]).toContain('fill-none')
  })

  it('does not call onChange when readOnly', () => {
    const onChange = vi.fn()
    render(<StarRating value={2} readOnly onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('button')[0]).toBeDisabled()
  })

  it('applies the requested size class', () => {
    const { container } = render(<StarRating value={3} size="lg" />)
    expect(starClasses(container)[0]).toContain('h-9 w-9')
  })
})

describe('StarDisplay', () => {
  it('rounds the rating to decide fill', () => {
    const { container } = render(<StarDisplay rating={3.4} />)
    const classes = starClasses(container)
    expect(classes[2]).toContain('fill-amber-400')
    expect(classes[3]).toContain('fill-none')
  })

  it('applies the md size class', () => {
    const { container } = render(<StarDisplay rating={5} size="md" />)
    expect(starClasses(container)[0]).toContain('h-4 w-4')
  })
})
