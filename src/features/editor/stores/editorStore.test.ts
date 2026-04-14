import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from './editorStore'
import type {
  RectElement,
  TextElement,
  CircleElement,
  LineElement,
  EditorElement,
} from '../types/elements'

// ── Factories ────────────────────────────────────────────────
function makeRect(overrides: Partial<RectElement> = {}): RectElement {
  return {
    id: `rect-${Math.random().toString(36).slice(2, 8)}`,
    type: 'rect',
    x: 0,
    y: 0,
    width: 100,
    height: 80,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    fill: '#6366f1',
    stroke: 'transparent',
    strokeWidth: 0,
    cornerRadius: 0,
    ...overrides,
  }
}

function makeText(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: `text-${Math.random().toString(36).slice(2, 8)}`,
    type: 'text',
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    content: 'Hello',
    fontSize: 24,
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fill: '#fafafa',
    textAlign: 'left',
    ...overrides,
  }
}

function makeCircle(overrides: Partial<CircleElement> = {}): CircleElement {
  return {
    id: `circle-${Math.random().toString(36).slice(2, 8)}`,
    type: 'circle',
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    fill: '#ec4899',
    stroke: 'transparent',
    strokeWidth: 0,
    ...overrides,
  }
}

function makeLine(overrides: Partial<LineElement> = {}): LineElement {
  return {
    id: `line-${Math.random().toString(36).slice(2, 8)}`,
    type: 'line',
    x: 0,
    y: 0,
    width: 200,
    height: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    stroke: '#ffffff',
    strokeWidth: 2,
    strokeDash: 'solid',
    arrowEnd: false,
    arrowStart: false,
    ...overrides,
  }
}

// ── Helpers ──────────────────────────────────────────────────
const store = () => useEditorStore.getState()
const reset = () =>
  useEditorStore.setState({ elements: [], selectedIds: [], clipboard: [] })

// ── Tests ────────────────────────────────────────────────────

beforeEach(() => {
  reset()
  // Clear temporal history
  useEditorStore.temporal?.getState()?.clear?.()
})

// ─────────────────────────────────────────────────────────────
// addElement
// ─────────────────────────────────────────────────────────────
describe('addElement', () => {
  it('adds a rect element to the elements array', () => {
    const r = makeRect({ id: 'r1' })
    store().addElement(r)
    expect(store().elements).toHaveLength(1)
    expect(store().elements[0].id).toBe('r1')
  })

  it('selects the newly added element', () => {
    const r = makeRect({ id: 'r2' })
    store().addElement(r)
    expect(store().selectedIds).toEqual(['r2'])
  })

  it('appends to existing elements', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeText({ id: 'b' }))
    expect(store().elements).toHaveLength(2)
    expect(store().elements[1].id).toBe('b')
  })

  it('replaces selection with the new element', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    expect(store().selectedIds).toEqual(['b'])
  })
})

// ─────────────────────────────────────────────────────────────
// addElements
// ─────────────────────────────────────────────────────────────
describe('addElements', () => {
  it('adds multiple elements at once', () => {
    const elems = [makeRect({ id: 'a' }), makeCircle({ id: 'b' })]
    store().addElements(elems)
    expect(store().elements).toHaveLength(2)
  })

  it('selects all added elements', () => {
    const elems = [makeRect({ id: 'a' }), makeCircle({ id: 'b' })]
    store().addElements(elems)
    expect(store().selectedIds).toEqual(['a', 'b'])
  })
})

// ─────────────────────────────────────────────────────────────
// selectElement
// ─────────────────────────────────────────────────────────────
describe('selectElement', () => {
  it('selects a single element', () => {
    store().addElement(makeRect({ id: 'r1' }))
    store().selectElement('r1')
    expect(store().selectedIds).toEqual(['r1'])
  })

  it('clears selection when id is null', () => {
    store().addElement(makeRect({ id: 'r1' }))
    store().selectElement(null)
    expect(store().selectedIds).toEqual([])
  })

  it('replaces selection without addToSelection flag', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().selectElement('a')
    expect(store().selectedIds).toEqual(['a'])
  })

  it('adds to selection with addToSelection = true', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().selectElement('a')
    store().selectElement('b', true)
    expect(store().selectedIds).toContain('a')
    expect(store().selectedIds).toContain('b')
  })

  it('toggles off an already-selected element with addToSelection', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().selectElements(['a', 'b'])
    store().selectElement('a', true)
    expect(store().selectedIds).toEqual(['b'])
  })
})

// ─────────────────────────────────────────────────────────────
// selectElements / clearSelection
// ─────────────────────────────────────────────────────────────
describe('selectElements / clearSelection', () => {
  it('selects multiple elements by ids', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().selectElements(['a', 'b'])
    expect(store().selectedIds).toEqual(['a', 'b'])
  })

  it('clearSelection empties the selection', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().clearSelection()
    expect(store().selectedIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────
// updateElement
// ─────────────────────────────────────────────────────────────
describe('updateElement', () => {
  it('updates partial properties of an element', () => {
    store().addElement(makeRect({ id: 'r1', fill: '#000' }))
    store().updateElement('r1', { fill: '#fff' })
    const el = store().elements.find((e) => e.id === 'r1') as RectElement
    expect(el.fill).toBe('#fff')
  })

  it('does not touch other elements', () => {
    store().addElement(makeRect({ id: 'a', x: 10 }))
    store().addElement(makeRect({ id: 'b', x: 20 }))
    store().updateElement('a', { x: 99 })
    expect(store().elements.find((e) => e.id === 'b')!.x).toBe(20)
  })

  it('ignores updates for non-existent ids', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().updateElement('zzz', { x: 999 })
    expect(store().elements).toHaveLength(1)
    expect(store().elements[0].x).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// deleteElement / deleteSelected
// ─────────────────────────────────────────────────────────────
describe('deleteElement', () => {
  it('removes an element by id', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().deleteElement('a')
    expect(store().elements).toHaveLength(1)
    expect(store().elements[0].id).toBe('b')
  })

  it('clears selectedIds if the deleted element was selected', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().deleteElement('a')
    expect(store().selectedIds).not.toContain('a')
  })
})

describe('deleteSelected', () => {
  it('removes all selected elements', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().addElement(makeRect({ id: 'c' }))
    store().selectElements(['a', 'c'])
    store().deleteSelected()
    expect(store().elements).toHaveLength(1)
    expect(store().elements[0].id).toBe('b')
  })

  it('clears selection after delete', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().deleteSelected()
    expect(store().selectedIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────
// duplicateElement
// ─────────────────────────────────────────────────────────────
describe('duplicateElement', () => {
  it('creates a copy with a new unique id', () => {
    store().addElement(makeRect({ id: 'a', x: 50, y: 50 }))
    store().duplicateElement('a')
    expect(store().elements).toHaveLength(2)
    expect(store().elements[1].id).not.toBe('a')
  })

  it('offsets the duplicate by +20 pixels', () => {
    store().addElement(makeRect({ id: 'a', x: 50, y: 50 }))
    store().duplicateElement('a')
    const dup = store().elements[1]
    expect(dup.x).toBe(70)
    expect(dup.y).toBe(70)
  })

  it('selects the duplicate', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().duplicateElement('a')
    const dupId = store().elements[1].id
    expect(store().selectedIds).toContain(dupId)
  })
})

// ─────────────────────────────────────────────────────────────
// Layer ordering
// ─────────────────────────────────────────────────────────────
describe('layer ordering', () => {
  beforeEach(() => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().addElement(makeRect({ id: 'c' }))
  })

  it('bringForward moves element one index up', () => {
    store().bringForward('a')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['b', 'a', 'c'])
  })

  it('bringForward does nothing for the last element', () => {
    store().bringForward('c')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['a', 'b', 'c'])
  })

  it('sendBackward moves element one index down', () => {
    store().sendBackward('c')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['a', 'c', 'b'])
  })

  it('sendBackward does nothing for the first element', () => {
    store().sendBackward('a')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['a', 'b', 'c'])
  })

  it('bringToFront moves element to the end', () => {
    store().bringToFront('a')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['b', 'c', 'a'])
  })

  it('sendToBack moves element to the beginning', () => {
    store().sendToBack('c')
    const ids = store().elements.map((e) => e.id)
    expect(ids).toEqual(['c', 'a', 'b'])
  })
})

// ─────────────────────────────────────────────────────────────
// toggleElementVisibility / toggleElementLock
// ─────────────────────────────────────────────────────────────
describe('toggleElementVisibility', () => {
  it('toggles visible from true to false', () => {
    store().addElement(makeRect({ id: 'a', visible: true }))
    store().toggleElementVisibility('a')
    expect(store().elements[0].visible).toBe(false)
  })

  it('toggles visible from false to true', () => {
    store().addElement(makeRect({ id: 'a', visible: false }))
    store().toggleElementVisibility('a')
    expect(store().elements[0].visible).toBe(true)
  })
})

describe('toggleElementLock', () => {
  it('toggles locked from false to true', () => {
    store().addElement(makeRect({ id: 'a', locked: false }))
    store().toggleElementLock('a')
    expect(store().elements[0].locked).toBe(true)
  })

  it('toggles locked from true to false', () => {
    store().addElement(makeRect({ id: 'a', locked: true }))
    store().toggleElementLock('a')
    expect(store().elements[0].locked).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// moveElement / batchMoveElements
// ─────────────────────────────────────────────────────────────
describe('moveElement', () => {
  it('sets x and y on the element', () => {
    store().addElement(makeRect({ id: 'a', x: 0, y: 0 }))
    store().moveElement('a', 150, 200)
    const el = store().elements[0]
    expect(el.x).toBe(150)
    expect(el.y).toBe(200)
  })
})

describe('batchMoveElements', () => {
  it('moves multiple elements at once', () => {
    store().addElement(makeRect({ id: 'a', x: 0, y: 0 }))
    store().addElement(makeRect({ id: 'b', x: 10, y: 10 }))
    store().batchMoveElements([
      { id: 'a', x: 100, y: 100 },
      { id: 'b', x: 200, y: 200 },
    ])
    expect(store().elements[0].x).toBe(100)
    expect(store().elements[1].x).toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────
// alignElements
// ─────────────────────────────────────────────────────────────
describe('alignElements', () => {
  beforeEach(() => {
    store().addElement(makeRect({ id: 'a', x: 10, y: 10, width: 50, height: 30 }))
    store().addElement(makeRect({ id: 'b', x: 100, y: 80, width: 60, height: 40 }))
    store().addElement(makeRect({ id: 'c', x: 200, y: 50, width: 40, height: 20 }))
  })

  it('aligns left to the minimum x', () => {
    store().alignElements(['a', 'b', 'c'], 'left')
    expect(store().elements.every((e) => e.x === 10)).toBe(true)
  })

  it('aligns right to the maximum right edge', () => {
    store().alignElements(['a', 'b', 'c'], 'right')
    // Max right edge = max(10+50, 100+60, 200+40) = 240
    store().elements.forEach((e) => {
      expect(e.x + e.width).toBe(240)
    })
  })

  it('aligns top to the minimum y', () => {
    store().alignElements(['a', 'b', 'c'], 'top')
    expect(store().elements.every((e) => e.y === 10)).toBe(true)
  })

  it('aligns bottom to the maximum bottom edge', () => {
    store().alignElements(['a', 'b', 'c'], 'bottom')
    // Max bottom = max(10+30, 80+40, 50+20) = 120
    store().elements.forEach((e) => {
      expect(e.y + e.height).toBe(120)
    })
  })

  it('aligns center-h to the horizontal center of the bounding box', () => {
    store().alignElements(['a', 'b', 'c'], 'center-h')
    // Bounding box: minX=10, maxRight=240 => center = 125
    const centers = store().elements.map((e) => e.x + e.width / 2)
    expect(new Set(centers).size).toBe(1) // all same center
  })

  it('aligns middle-v to the vertical center of the bounding box', () => {
    store().alignElements(['a', 'b', 'c'], 'middle-v')
    // Bounding box: minY=10, maxBottom=120 => center = 65
    const centers = store().elements.map((e) => e.y + e.height / 2)
    expect(new Set(centers).size).toBe(1) // all same center
  })
})

// ─────────────────────────────────────────────────────────────
// distributeElements
// ─────────────────────────────────────────────────────────────
describe('distributeElements', () => {
  it('distributes horizontally with uniform spacing', () => {
    store().addElement(makeRect({ id: 'a', x: 0, width: 40 }))
    store().addElement(makeRect({ id: 'b', x: 200, width: 40 }))
    store().addElement(makeRect({ id: 'c', x: 50, width: 40 }))
    store().distributeElements(['a', 'b', 'c'], 'h')
    const xs = store().elements.map((e) => e.x).sort((a, b) => a - b)
    // Spacing should be uniform
    const gap1 = xs[1] - xs[0]
    const gap2 = xs[2] - xs[1]
    expect(Math.abs(gap1 - gap2)).toBeLessThan(1)
  })

  it('distributes vertically with uniform spacing', () => {
    store().addElement(makeRect({ id: 'a', y: 0, height: 30 }))
    store().addElement(makeRect({ id: 'b', y: 200, height: 30 }))
    store().addElement(makeRect({ id: 'c', y: 50, height: 30 }))
    store().distributeElements(['a', 'b', 'c'], 'v')
    const ys = store().elements.map((e) => e.y).sort((a, b) => a - b)
    const gap1 = ys[1] - ys[0]
    const gap2 = ys[2] - ys[1]
    expect(Math.abs(gap1 - gap2)).toBeLessThan(1)
  })

  it('no-op when fewer than 3 elements', () => {
    store().addElement(makeRect({ id: 'a', x: 0 }))
    store().addElement(makeRect({ id: 'b', x: 100 }))
    const before = store().elements.map((e) => e.x)
    store().distributeElements(['a', 'b'], 'h')
    const after = store().elements.map((e) => e.x)
    expect(after).toEqual(before)
  })
})

// ─────────────────────────────────────────────────────────────
// copySelected / paste
// ─────────────────────────────────────────────────────────────
describe('copySelected / paste', () => {
  it('copies selected elements to clipboard', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().copySelected()
    expect(store().clipboard).toHaveLength(1)
  })

  it('paste creates new elements with unique ids', () => {
    store().addElement(makeRect({ id: 'a', x: 50, y: 50 }))
    store().selectElement('a')
    store().copySelected()
    store().paste()
    expect(store().elements).toHaveLength(2)
    expect(store().elements[1].id).not.toBe('a')
  })

  it('paste offsets pasted elements', () => {
    store().addElement(makeRect({ id: 'a', x: 50, y: 50 }))
    store().selectElement('a')
    store().copySelected()
    store().paste()
    const pasted = store().elements[1]
    expect(pasted.x).toBeGreaterThan(50)
    expect(pasted.y).toBeGreaterThan(50)
  })

  it('paste selects the newly pasted elements', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().copySelected()
    store().paste()
    const pastedId = store().elements[1].id
    expect(store().selectedIds).toContain(pastedId)
  })

  it('supports multi-paste (paste twice from same clipboard)', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().copySelected()
    store().paste()
    store().paste()
    expect(store().elements).toHaveLength(3)
    const ids = store().elements.map((e) => e.id)
    expect(new Set(ids).size).toBe(3) // all unique
  })
})

// ─────────────────────────────────────────────────────────────
// Undo / Redo
// ─────────────────────────────────────────────────────────────
describe('undo / redo', () => {
  it('undo reverts the last action', () => {
    store().addElement(makeRect({ id: 'a' }))
    expect(store().elements).toHaveLength(1)
    useEditorStore.temporal.getState().undo()
    expect(store().elements).toHaveLength(0)
  })

  it('redo re-applies the undone action', () => {
    store().addElement(makeRect({ id: 'a' }))
    useEditorStore.temporal.getState().undo()
    useEditorStore.temporal.getState().redo()
    expect(store().elements).toHaveLength(1)
  })

  it('supports multi-step undo', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().addElement(makeRect({ id: 'b' }))
    store().addElement(makeRect({ id: 'c' }))
    useEditorStore.temporal.getState().undo()
    useEditorStore.temporal.getState().undo()
    expect(store().elements).toHaveLength(1)
    expect(store().elements[0].id).toBe('a')
  })

  it('clipboard is excluded from undo history (partialize)', () => {
    store().addElement(makeRect({ id: 'a' }))
    store().selectElement('a')
    store().copySelected()
    // Undo should NOT undo the copy — it should undo the selectElement
    useEditorStore.temporal.getState().undo()
    // Clipboard should still contain the copied element
    expect(store().clipboard).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────
// Factories — default values
// ─────────────────────────────────────────────────────────────
describe('element factories produce valid defaults', () => {
  it('rect has expected default values', () => {
    const r = makeRect()
    expect(r.type).toBe('rect')
    expect(r.rotation).toBe(0)
    expect(r.opacity).toBe(1)
    expect(r.locked).toBe(false)
    expect(r.visible).toBe(true)
    expect(r.cornerRadius).toBe(0)
  })

  it('text has expected default values', () => {
    const t = makeText()
    expect(t.type).toBe('text')
    expect(t.fontSize).toBe(24)
    expect(t.fontWeight).toBe(600)
    expect(t.textAlign).toBe('left')
  })

  it('circle has expected default values', () => {
    const c = makeCircle()
    expect(c.type).toBe('circle')
    expect(c.width).toBe(60)
    expect(c.height).toBe(60)
  })

  it('line has expected default values', () => {
    const l = makeLine()
    expect(l.type).toBe('line')
    expect(l.strokeDash).toBe('solid')
    expect(l.arrowEnd).toBe(false)
    expect(l.arrowStart).toBe(false)
  })
})
