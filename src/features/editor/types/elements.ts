export interface BaseElement {
  id: string
  type: 'rect' | 'text'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize: number
  fontWeight: number
  fontFamily: string
  fill: string
  textAlign: 'left' | 'center' | 'right'
}

export type EditorElement = RectElement | TextElement

export function createRectElement(overrides?: Partial<RectElement>): RectElement {
  return {
    id: '',
    type: 'rect',
    x: 100,
    y: 100,
    width: 200,
    height: 120,
    rotation: 0,
    opacity: 1,
    locked: false,
    fill: '#6366f1',
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 8,
    ...overrides,
  }
}

export function createTextElement(overrides?: Partial<TextElement>): TextElement {
  return {
    id: '',
    type: 'text',
    x: 100,
    y: 100,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    content: 'Text',
    fontSize: 24,
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fill: '#fafafa',
    textAlign: 'left',
    ...overrides,
  }
}
