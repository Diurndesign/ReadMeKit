import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { RectElementSVG } from '../RectElement'
import { CircleElementSVG } from '../CircleElement'
import { TextElementSVG } from '../TextElement'
import { LineElementSVG } from '../LineElement'
import { ImageElementSVG } from '../ImageElement'
import {
  createRectElement,
  createCircleElement,
  createTextElement,
  createLineElement,
  createImageElement,
} from '../../../types/elements'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const noop = () => {}

/** Wraps a component in an SVG root so SVG children are valid in jsdom */
function renderInSvg(ui: React.ReactElement) {
  return render(<svg>{ui}</svg>)
}

// ─── RectElementSVG ───────────────────────────────────────────────────────────

describe('RectElementSVG', () => {
  const base = createRectElement({ id: 'r1', x: 10, y: 20, width: 100, height: 50 })

  it('renders a <rect> element', () => {
    const { container } = renderInSvg(
      <RectElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('rect')).toBeTruthy()
  })

  it('applies fill and corner radius', () => {
    const { container } = renderInSvg(
      <RectElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    const rect = container.querySelector('rect')!
    expect(rect.getAttribute('fill')).toBe(base.fill)
    expect(rect.getAttribute('rx')).toBe(String(base.cornerRadius))
  })

  it('renders resize handles and rotation handle when selected', () => {
    const { container } = renderInSvg(
      <RectElementSVG element={base} isSelected={true} onPointerDown={noop} />
    )
    // Each handle = 2 circles (transparent hitbox r=8 + visual r=4)
    // 8 resize handles × 2 + 1 rotation handle × 2 = 18 circles in total
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(18)
  })

  it('renders no handles when not selected', () => {
    const { container } = renderInSvg(
      <RectElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelectorAll('circle').length).toBe(0)
  })

  it('renders a linearGradient when gradientFrom/To are set', () => {
    const el = createRectElement({ id: 'r2', gradientFrom: '#ff0000', gradientTo: '#0000ff' })
    const { container } = renderInSvg(
      <RectElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('linearGradient')).toBeTruthy()
  })

  it('applies rotation transform when rotation !== 0', () => {
    const el = createRectElement({ id: 'r3', rotation: 45 })
    const { container } = renderInSvg(
      <RectElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    const g = container.querySelector('g')!
    expect(g.getAttribute('transform')).toContain('rotate(45')
  })

  it('omits transform attribute when rotation is 0', () => {
    const { container } = renderInSvg(
      <RectElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    const g = container.querySelector('g')!
    expect(g.getAttribute('transform')).toBeNull()
  })
})

// ─── CircleElementSVG ─────────────────────────────────────────────────────────

describe('CircleElementSVG', () => {
  const base = createCircleElement({ id: 'c1', x: 0, y: 0, width: 80, height: 80 })

  it('renders an <ellipse>', () => {
    const { container } = renderInSvg(
      <CircleElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('ellipse')).toBeTruthy()
  })

  it('cx/cy are at element center', () => {
    const { container } = renderInSvg(
      <CircleElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    const ellipse = container.querySelector('ellipse')!
    expect(ellipse.getAttribute('cx')).toBe(String(base.x + base.width / 2))
    expect(ellipse.getAttribute('cy')).toBe(String(base.y + base.height / 2))
  })

  it('renders 8 resize + 1 rotation handle when selected', () => {
    const { container } = renderInSvg(
      <CircleElementSVG element={base} isSelected={true} onPointerDown={noop} />
    )
    // Each handle = 2 circles (transparent hitbox + visual) → 9 handles × 2 = 18
    expect(container.querySelectorAll('circle').length).toBe(18)
  })
})

// ─── TextElementSVG ───────────────────────────────────────────────────────────

describe('TextElementSVG', () => {
  const base = createTextElement({
    id: 't1', x: 0, y: 0, width: 200, height: 40,
    content: 'Hello World', fontSize: 20,
  })

  it('renders a <text> element', () => {
    const { container } = renderInSvg(
      <TextElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('text')).toBeTruthy()
  })

  it('renders tspan children with the text content', () => {
    const { container } = renderInSvg(
      <TextElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    const tspans = container.querySelectorAll('tspan')
    expect(tspans.length).toBeGreaterThan(0)
    const fullText = Array.from(tspans)
      .map((s) => s.textContent)
      .join(' ')
      .trim()
    expect(fullText).toContain('Hello')
  })

  it('renders background rect when background is set', () => {
    const el = createTextElement({ id: 't2', background: '#ff0000' })
    const { container } = renderInSvg(
      <TextElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    const rects = container.querySelectorAll('rect')
    const bgRect = Array.from(rects).find((r) => r.getAttribute('fill') === '#ff0000')
    expect(bgRect).toBeTruthy()
  })

  it('does not render background rect when background is undefined', () => {
    const { container } = renderInSvg(
      <TextElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('rect[fill="#ff0000"]')).toBeNull()
  })

  it('renders 6 resize + 1 rotation handle when selected', () => {
    const { container } = renderInSvg(
      <TextElementSVG element={base} isSelected={true} onPointerDown={noop} />
    )
    // Each handle = 2 circles (transparent hitbox + visual)
    // 6 resize handles × 2 + 1 rotation handle × 2 = 14
    expect(container.querySelectorAll('circle').length).toBe(14)
  })

  it('wraps multi-line text into multiple tspans', () => {
    // Content long enough to require wrapping in a narrow box
    const el = createTextElement({
      id: 't3',
      content: 'The quick brown fox jumps over the lazy dog indeed',
      width: 100,
      fontSize: 16,
    })
    const { container } = renderInSvg(
      <TextElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelectorAll('tspan').length).toBeGreaterThan(1)
  })
})

// ─── LineElementSVG ───────────────────────────────────────────────────────────

describe('LineElementSVG', () => {
  const base = createLineElement({ id: 'l1', x: 0, y: 0, width: 200, height: 0 })

  it('renders a visible <line>', () => {
    const { container } = renderInSvg(
      <LineElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    const lines = container.querySelectorAll('line')
    // 2 lines: hit area + visible
    expect(lines.length).toBeGreaterThanOrEqual(1)
  })

  it('renders a marker when arrowEnd is true', () => {
    const { container } = renderInSvg(
      <LineElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('marker')).toBeTruthy()
  })

  it('renders no marker when both arrows are false', () => {
    const el = createLineElement({ id: 'l2', arrowEnd: false, arrowStart: false })
    const { container } = renderInSvg(
      <LineElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('marker')).toBeNull()
  })

  it('renders start and end handles when selected', () => {
    const { container } = renderInSvg(
      <LineElementSVG element={base} isSelected={true} onPointerDown={noop} />
    )
    expect(container.querySelectorAll('circle').length).toBe(2)
  })

  it('applies stroke-dasharray for dashed style', () => {
    const el = createLineElement({ id: 'l3', strokeDash: 'dashed', strokeWidth: 2 })
    const { container } = renderInSvg(
      <LineElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    // The visible line (pointerEvents="none") should have the dasharray
    const visibleLine = Array.from(container.querySelectorAll('line')).find(
      (l) => l.getAttribute('pointer-events') === 'none'
    )
    expect(visibleLine?.getAttribute('stroke-dasharray')).toBeTruthy()
  })
})

// ─── ImageElementSVG ─────────────────────────────────────────────────────────

describe('ImageElementSVG', () => {
  const base = createImageElement({ id: 'i1', src: 'https://example.com/img.png' })

  it('renders an <image> element when src is set', () => {
    const { container } = renderInSvg(
      <ImageElementSVG element={base} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('image')).toBeTruthy()
  })

  it('renders a placeholder rect when src is empty', () => {
    const el = createImageElement({ id: 'i2', src: '' })
    const { container } = renderInSvg(
      <ImageElementSVG element={el} isSelected={false} onPointerDown={noop} />
    )
    expect(container.querySelector('image')).toBeNull()
    expect(container.querySelector('rect')).toBeTruthy()
  })

  it('renders 8 resize + 1 rotation handle when selected', () => {
    const { container } = renderInSvg(
      <ImageElementSVG element={base} isSelected={true} onPointerDown={noop} />
    )
    // Each handle = 2 circles (transparent hitbox + visual) → 9 handles × 2 = 18
    expect(container.querySelectorAll('circle').length).toBe(18)
  })
})
