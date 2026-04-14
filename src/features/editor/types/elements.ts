export interface BaseElement {
  id: string
  type: 'rect' | 'text' | 'circle' | 'line' | 'image'
  name?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
  visible: boolean
  /** If set, this element belongs to a group with other elements sharing the same groupId */
  groupId?: string
  /**
   * Optional fill override for dark mode.
   * When set, buildSvgString emits a CSS class with
   * @media(prefers-color-scheme:dark){ .rmk-dk-{id}{ fill: darkFill } }
   * so the element adapts automatically to the viewer's OS theme.
   * Applies to rect, circle, and text elements.
   */
  darkFill?: string
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize: number
  fontWeight: number
  fontFamily: string
  fill: string
  textAlign: 'left' | 'center' | 'right'
  background?: string
  bgPadding?: number
  bgRadius?: number
}

export interface CircleElement extends BaseElement {
  type: 'circle'
  fill: string
  stroke: string
  strokeWidth: number
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
}

/**
 * Line / Arrow element.
 * Start point = (x, y). End point = (x + width, y + height).
 * width and height CAN be negative to allow any direction.
 */
export interface LineElement extends BaseElement {
  type: 'line'
  stroke: string
  strokeWidth: number
  strokeDash: 'solid' | 'dashed' | 'dotted'
  arrowEnd: boolean
  arrowStart: boolean
}

/** Image element — renders a raster image from a URL. */
export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
}

export type EditorElement = RectElement | TextElement | CircleElement | LineElement | ImageElement

// ─── Factories ────────────────────────────────────────────────────────────────

export function createRectElement(overrides?: Partial<RectElement>): RectElement {
  return {
    id: '', type: 'rect',
    x: 100, y: 100, width: 200, height: 120,
    rotation: 0, opacity: 1, locked: false, visible: true,
    fill: '#6366f1', stroke: 'transparent', strokeWidth: 0, cornerRadius: 8,
    ...overrides,
  }
}

export function createCircleElement(overrides?: Partial<CircleElement>): CircleElement {
  return {
    id: '', type: 'circle',
    x: 100, y: 100, width: 120, height: 120,
    rotation: 0, opacity: 1, locked: false, visible: true,
    fill: '#22c55e', stroke: 'transparent', strokeWidth: 0,
    ...overrides,
  }
}

export function createTextElement(overrides?: Partial<TextElement>): TextElement {
  return {
    id: '', type: 'text',
    x: 100, y: 100, width: 200, height: 40,
    rotation: 0, opacity: 1, locked: false, visible: true,
    content: 'Text',
    fontSize: 24, fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fill: '#fafafa', textAlign: 'left',
    ...overrides,
  }
}

export function createLineElement(overrides?: Partial<LineElement>): LineElement {
  return {
    id: '', type: 'line',
    x: 100, y: 100, width: 200, height: 0,
    rotation: 0, opacity: 1, locked: false, visible: true,
    stroke: '#e4e4e7', strokeWidth: 2,
    strokeDash: 'solid',
    arrowEnd: true, arrowStart: false,
    ...overrides,
  }
}

export function createImageElement(overrides?: Partial<ImageElement>): ImageElement {
  return {
    id: '', type: 'image',
    x: 100, y: 100, width: 240, height: 160,
    rotation: 0, opacity: 1, locked: false, visible: true,
    src: '',
    ...overrides,
  }
}
