import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from '../editorStore'
import {
  createRectElement,
  createTextElement,
  createCircleElement,
  createLineElement,
} from '../../types/elements'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetStore() {
  useEditorStore.setState({ elements: [], selectedIds: [], clipboard: [] })
  useEditorStore.temporal.getState().clear()
}

function rect(id: string, overrides = {}) {
  return createRectElement({ id, x: 0, y: 0, ...overrides })
}

function text(id: string, overrides = {}) {
  return createTextElement({ id, x: 0, y: 0, ...overrides })
}

function getState() {
  return useEditorStore.getState()
}

// ─── addElement ───────────────────────────────────────────────────────────────

describe('addElement', () => {
  beforeEach(resetStore)

  it('appends the element to the list', () => {
    getState().addElement(rect('r1'))
    expect(getState().elements).toHaveLength(1)
    expect(getState().elements[0].id).toBe('r1')
  })

  it('selects the newly added element', () => {
    getState().addElement(rect('r1'))
    expect(getState().selectedIds).toEqual(['r1'])
  })

  it('preserves existing elements when adding more', () => {
    getState().addElement(rect('r1'))
    getState().addElement(rect('r2'))
    expect(getState().elements).toHaveLength(2)
    expect(getState().selectedIds).toEqual(['r2'])
  })
})

// ─── addElements ─────────────────────────────────────────────────────────────

describe('addElements', () => {
  beforeEach(resetStore)

  it('appends all elements and selects them', () => {
    getState().addElements([rect('r1'), rect('r2'), text('t1')])
    expect(getState().elements).toHaveLength(3)
    expect(getState().selectedIds).toEqual(['r1', 'r2', 't1'])
  })
})

// ─── selectElement ────────────────────────────────────────────────────────────

describe('selectElement', () => {
  beforeEach(() => {
    resetStore()
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
  })

  it('selects a single element', () => {
    getState().selectElement('r1')
    expect(getState().selectedIds).toEqual(['r1'])
  })

  it('replaces selection when not using addToSelection', () => {
    getState().selectElement('r1')
    getState().selectElement('r2')
    expect(getState().selectedIds).toEqual(['r2'])
  })

  it('adds element to selection with addToSelection=true', () => {
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    expect(getState().selectedIds).toContain('r1')
    expect(getState().selectedIds).toContain('r2')
  })

  it('removes element from selection if already selected (toggle)', () => {
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().selectElement('r1', true)
    expect(getState().selectedIds).not.toContain('r1')
    expect(getState().selectedIds).toContain('r2')
  })

  it('clears selection when called with null', () => {
    getState().selectElement('r1')
    getState().selectElement(null)
    expect(getState().selectedIds).toEqual([])
  })
})

// ─── updateElement ────────────────────────────────────────────────────────────

describe('updateElement', () => {
  beforeEach(resetStore)

  it('updates the specified properties', () => {
    getState().addElement(rect('r1', { x: 10, y: 20 }))
    useEditorStore.temporal.getState().clear()
    getState().updateElement('r1', { x: 50, width: 300 })
    const el = getState().elements.find((e) => e.id === 'r1')!
    expect(el.x).toBe(50)
    expect(el.width).toBe(300)
    expect(el.y).toBe(20) // untouched
  })

  it('does not affect other elements', () => {
    getState().addElements([rect('r1'), rect('r2', { x: 99 })])
    useEditorStore.temporal.getState().clear()
    getState().updateElement('r1', { x: 5 })
    expect(getState().elements.find((e) => e.id === 'r2')!.x).toBe(99)
  })
})

// ─── deleteElement ────────────────────────────────────────────────────────────

describe('deleteElement', () => {
  beforeEach(resetStore)

  it('removes the element from the list', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().deleteElement('r1')
    expect(getState().elements).toHaveLength(0)
  })

  it('removes the element from selectedIds', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().deleteElement('r1')
    expect(getState().selectedIds).not.toContain('r1')
  })

  it('leaves other elements untouched', () => {
    getState().addElements([rect('r1'), rect('r2')])
    useEditorStore.temporal.getState().clear()
    getState().deleteElement('r1')
    expect(getState().elements).toHaveLength(1)
    expect(getState().elements[0].id).toBe('r2')
  })
})

// ─── deleteSelected ───────────────────────────────────────────────────────────

describe('deleteSelected', () => {
  beforeEach(resetStore)

  it('removes all selected elements', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().deleteSelected()
    expect(getState().elements).toHaveLength(1)
    expect(getState().elements[0].id).toBe('r3')
    expect(getState().selectedIds).toEqual([])
  })
})

// ─── duplicateElement ─────────────────────────────────────────────────────────

describe('duplicateElement', () => {
  beforeEach(resetStore)

  it('creates a new element at +20 offset', () => {
    getState().addElement(rect('r1', { x: 100, y: 100 }))
    useEditorStore.temporal.getState().clear()
    getState().duplicateElement('r1')
    expect(getState().elements).toHaveLength(2)
    const copy = getState().elements[1]
    expect(copy.id).not.toBe('r1')
    expect(copy.x).toBe(120)
    expect(copy.y).toBe(120)
  })

  it('selects the duplicated element', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().duplicateElement('r1')
    const copy = getState().elements[1]
    expect(getState().selectedIds).toEqual([copy.id])
  })
})

// ─── Layer ordering ───────────────────────────────────────────────────────────

describe('bringForward / sendBackward / bringToFront / sendToBack', () => {
  beforeEach(resetStore)

  it('bringForward moves element one step up the stack', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().bringForward('r1') // r1 was index 0, should become 1
    expect(getState().elements.map((e) => e.id)).toEqual(['r2', 'r1', 'r3'])
  })

  it('sendBackward moves element one step down', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().sendBackward('r3') // r3 was index 2, should become 1
    expect(getState().elements.map((e) => e.id)).toEqual(['r1', 'r3', 'r2'])
  })

  it('bringToFront moves element to last position', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().bringToFront('r1')
    expect(getState().elements.map((e) => e.id)).toEqual(['r2', 'r3', 'r1'])
  })

  it('sendToBack moves element to first position', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().sendToBack('r3')
    expect(getState().elements.map((e) => e.id)).toEqual(['r3', 'r1', 'r2'])
  })
})

// ─── toggleElementVisibility / toggleElementLock ──────────────────────────────

describe('toggleElementVisibility', () => {
  beforeEach(resetStore)

  it('sets visible to false and back', () => {
    getState().addElement(rect('r1'))
    getState().toggleElementVisibility('r1')
    expect(getState().elements[0].visible).toBe(false)
    getState().toggleElementVisibility('r1')
    expect(getState().elements[0].visible).toBe(true)
  })
})

describe('toggleElementLock', () => {
  beforeEach(resetStore)

  it('sets locked to true and back', () => {
    getState().addElement(rect('r1'))
    getState().toggleElementLock('r1')
    expect(getState().elements[0].locked).toBe(true)
    getState().toggleElementLock('r1')
    expect(getState().elements[0].locked).toBe(false)
  })
})

// ─── moveElement / batchMoveElements ─────────────────────────────────────────

describe('moveElement', () => {
  beforeEach(resetStore)

  it('updates x and y', () => {
    getState().addElement(rect('r1'))
    getState().moveElement('r1', 42, 84)
    const el = getState().elements[0]
    expect(el.x).toBe(42)
    expect(el.y).toBe(84)
  })
})

describe('batchMoveElements', () => {
  beforeEach(resetStore)

  it('moves all listed elements simultaneously', () => {
    getState().addElements([rect('r1', { x: 0, y: 0 }), rect('r2', { x: 0, y: 0 })])
    useEditorStore.temporal.getState().clear()
    getState().batchMoveElements([
      { id: 'r1', x: 10, y: 20 },
      { id: 'r2', x: 30, y: 40 },
    ])
    expect(getState().elements[0]).toMatchObject({ x: 10, y: 20 })
    expect(getState().elements[1]).toMatchObject({ x: 30, y: 40 })
  })
})

// ─── alignElements ────────────────────────────────────────────────────────────

describe('alignElements', () => {
  beforeEach(resetStore)

  function setup() {
    getState().addElements([
      rect('a', { x: 10, y: 20, width: 50, height: 40 }),
      rect('b', { x: 80, y: 60, width: 30, height: 20 }),
    ])
    useEditorStore.temporal.getState().clear()
  }

  it('left — aligns all elements to the leftmost x', () => {
    setup()
    getState().alignElements(['a', 'b'], 'left')
    expect(getState().elements[0].x).toBe(10)
    expect(getState().elements[1].x).toBe(10)
  })

  it('right — aligns all right edges to the rightmost', () => {
    setup()
    getState().alignElements(['a', 'b'], 'right')
    // maxX = max(10+50, 80+30) = max(60,110) = 110
    expect(getState().elements[0].x).toBe(110 - 50) // 60
    expect(getState().elements[1].x).toBe(110 - 30) // 80
  })

  it('top — aligns all elements to the topmost y', () => {
    setup()
    getState().alignElements(['a', 'b'], 'top')
    expect(getState().elements[0].y).toBe(20)
    expect(getState().elements[1].y).toBe(20)
  })

  it('bottom — aligns all bottom edges to the bottommost', () => {
    setup()
    getState().alignElements(['a', 'b'], 'bottom')
    // maxY = max(20+40, 60+20) = max(60,80) = 80
    expect(getState().elements[0].y).toBe(80 - 40) // 40
    expect(getState().elements[1].y).toBe(80 - 20) // 60
  })

  it('center-h — centers horizontally', () => {
    setup()
    getState().alignElements(['a', 'b'], 'center-h')
    // centerX = (10 + 110) / 2 = 60
    expect(getState().elements[0].x).toBe(60 - 25) // 35
    expect(getState().elements[1].x).toBe(60 - 15) // 45
  })

  it('middle-v — centers vertically', () => {
    setup()
    getState().alignElements(['a', 'b'], 'middle-v')
    // centerY = (20 + 80) / 2 = 50
    expect(getState().elements[0].y).toBe(50 - 20) // 30
    expect(getState().elements[1].y).toBe(50 - 10) // 40
  })
})

// ─── distributeElements ───────────────────────────────────────────────────────

describe('distributeElements', () => {
  beforeEach(resetStore)

  it('distributes 3 elements evenly on the horizontal axis', () => {
    getState().addElements([
      rect('a', { x: 0, y: 0, width: 20, height: 20 }),
      rect('b', { x: 200, y: 0, width: 20, height: 20 }),
      rect('c', { x: 500, y: 0, width: 20, height: 20 }),
    ])
    useEditorStore.temporal.getState().clear()
    getState().distributeElements(['a', 'b', 'c'], 'h')
    // span = 500+20 - 0 = 520; totalW = 60; gap = (520-60)/2 = 230
    // a stays at 0, b should be at 0+20+230=250, c stays at 500
    expect(getState().elements[0].x).toBe(0)
    expect(getState().elements[1].x).toBe(250)
    expect(getState().elements[2].x).toBe(500)
  })

  it('does not change positions if fewer than 3 elements', () => {
    getState().addElements([
      rect('a', { x: 10, y: 0, width: 20, height: 20 }),
      rect('b', { x: 200, y: 0, width: 20, height: 20 }),
    ])
    useEditorStore.temporal.getState().clear()
    const before = getState().elements.map((e) => e.x)
    getState().distributeElements(['a', 'b'], 'h')
    expect(getState().elements.map((e) => e.x)).toEqual(before)
  })
})

// ─── copySelected / paste ─────────────────────────────────────────────────────

describe('copySelected / paste', () => {
  beforeEach(resetStore)

  it('paste does nothing when clipboard is empty', () => {
    getState().paste()
    expect(getState().elements).toHaveLength(0)
  })

  it('copies selected elements to clipboard', () => {
    getState().addElements([rect('r1'), rect('r2')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().copySelected()
    expect(getState().clipboard).toHaveLength(1)
    expect(getState().clipboard[0].id).toBe('r1')
  })

  it('paste creates new elements at +20 offset with new ids', () => {
    getState().addElement(rect('r1', { x: 100, y: 100 }))
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().copySelected()
    getState().paste()
    expect(getState().elements).toHaveLength(2)
    const pasted = getState().elements[1]
    expect(pasted.id).not.toBe('r1')
    expect(pasted.x).toBe(120)
    expect(pasted.y).toBe(120)
  })

  it('paste selects the newly created elements', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().copySelected()
    getState().paste()
    const pasted = getState().elements[1]
    expect(getState().selectedIds).toEqual([pasted.id])
  })

  it('can paste multiple times to produce independent copies', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().copySelected()
    getState().paste()
    getState().paste()
    // original + 2 pastes
    expect(getState().elements).toHaveLength(3)
    const ids = getState().elements.map((e) => e.id)
    expect(new Set(ids).size).toBe(3) // all unique
  })
})

// ─── Undo / Redo ─────────────────────────────────────────────────────────────

describe('undo / redo', () => {
  beforeEach(resetStore)

  it('undoes addElement', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().undo()
    expect(getState().elements).toHaveLength(0)
  })

  it('redoes after undo', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().undo()
    useEditorStore.temporal.getState().redo()
    expect(getState().elements).toHaveLength(1)
  })

  it('undoes updateElement', () => {
    getState().addElement(rect('r1', { x: 10 }))
    useEditorStore.temporal.getState().clear()
    getState().updateElement('r1', { x: 99 })
    useEditorStore.temporal.getState().undo()
    expect(getState().elements[0].x).toBe(10)
  })

  it('undoes deleteElement', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().deleteElement('r1')
    useEditorStore.temporal.getState().undo()
    expect(getState().elements).toHaveLength(1)
  })

  it('undoes multiple steps', () => {
    getState().addElement(rect('r1'))
    getState().addElement(rect('r2'))
    getState().addElement(rect('r3'))
    useEditorStore.temporal.getState().undo()
    expect(getState().elements).toHaveLength(2)
    useEditorStore.temporal.getState().undo()
    expect(getState().elements).toHaveLength(1)
    useEditorStore.temporal.getState().undo()
    expect(getState().elements).toHaveLength(0)
  })

  it('clipboard and selectedIds are NOT in undo history', () => {
    // clipboard/selectedIds are excluded via partialize
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().copySelected()
    // undo should not affect clipboard
    useEditorStore.temporal.getState().undo()
    expect(getState().clipboard).toHaveLength(1)
  })
})

// ─── renameElement ────────────────────────────────────────────────────────────

describe('renameElement', () => {
  beforeEach(resetStore)

  it('updates the name property', () => {
    getState().addElement(rect('r1'))
    getState().renameElement('r1', 'My Rectangle')
    expect(getState().elements[0].name).toBe('My Rectangle')
  })
})

// ─── Element type factories ───────────────────────────────────────────────────

describe('createRectElement factory', () => {
  it('produces defaults for omitted fields', () => {
    const el = createRectElement({ id: 'x' })
    expect(el.type).toBe('rect')
    expect(el.rotation).toBe(0)
    expect(el.opacity).toBe(1)
    expect(el.locked).toBe(false)
    expect(el.visible).toBe(true)
    expect(el.strokeWidth).toBe(0)
    expect(el.cornerRadius).toBe(8)
  })
})

describe('createTextElement factory', () => {
  it('produces defaults', () => {
    const el = createTextElement({ id: 'x' })
    expect(el.type).toBe('text')
    expect(el.content).toBe('Text')
    expect(el.fontSize).toBe(24)
    expect(el.textAlign).toBe('left')
  })
})

describe('createCircleElement factory', () => {
  it('has equal width and height by default', () => {
    const el = createCircleElement({ id: 'x' })
    expect(el.type).toBe('circle')
    expect(el.width).toBe(el.height)
  })
})

describe('createLineElement factory', () => {
  it('has arrowEnd true by default', () => {
    const el = createLineElement({ id: 'x' })
    expect(el.type).toBe('line')
    expect(el.arrowEnd).toBe(true)
    expect(el.arrowStart).toBe(false)
    expect(el.strokeDash).toBe('solid')
  })
})

// ─── groupSelected / ungroupSelected ─────────────────────────────────────────

describe('groupSelected / ungroupSelected', () => {
  beforeEach(resetStore)

  it('assigns the same groupId to all selected elements', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().groupSelected()
    const r1 = getState().elements.find((e) => e.id === 'r1')!
    const r2 = getState().elements.find((e) => e.id === 'r2')!
    const r3 = getState().elements.find((e) => e.id === 'r3')!
    expect(r1.groupId).toBeDefined()
    expect(r2.groupId).toBe(r1.groupId)
    expect(r3.groupId).toBeUndefined()
  })

  it('does nothing when fewer than 2 elements are selected', () => {
    getState().addElement(rect('r1'))
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().groupSelected()
    expect(getState().elements[0].groupId).toBeUndefined()
  })

  it('ungroupSelected clears groupId from all members', () => {
    getState().addElements([rect('r1'), rect('r2')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().groupSelected()
    getState().ungroupSelected()
    expect(getState().elements.every((e) => !e.groupId)).toBe(true)
  })

  it('ungroupSelected only removes the groups that include selected elements', () => {
    getState().addElements([rect('r1'), rect('r2'), rect('r3'), rect('r4')])
    useEditorStore.temporal.getState().clear()
    // Group r1+r2, then group r3+r4 separately
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().groupSelected()
    getState().selectElement('r3')
    getState().selectElement('r4', true)
    getState().groupSelected()
    // Now ungroup only the r1/r2 group by selecting one of them
    getState().selectElement('r1')
    getState().ungroupSelected()
    const r1 = getState().elements.find((e) => e.id === 'r1')!
    const r2 = getState().elements.find((e) => e.id === 'r2')!
    const r3 = getState().elements.find((e) => e.id === 'r3')!
    const r4 = getState().elements.find((e) => e.id === 'r4')!
    expect(r1.groupId).toBeUndefined()
    expect(r2.groupId).toBeUndefined() // r2 also ungrouped (same group)
    expect(r3.groupId).toBeDefined()   // r3/r4 group untouched
    expect(r4.groupId).toBe(r3.groupId)
  })

  it('paste remaps groupIds so pasted groups are independent', () => {
    getState().addElements([rect('r1'), rect('r2')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().groupSelected()
    getState().copySelected()
    getState().paste()
    const origGroupId = getState().elements.find((e) => e.id === 'r1')!.groupId!
    const pastedEls = getState().elements.slice(2) // the 2 pasted copies
    expect(pastedEls).toHaveLength(2)
    const pastedGroupId = pastedEls[0].groupId
    expect(pastedGroupId).toBeDefined()
    expect(pastedGroupId).not.toBe(origGroupId) // new groupId, not same as original
    expect(pastedEls[1].groupId).toBe(pastedGroupId) // both share the same new groupId
  })

  it('undo restores elements before grouping', () => {
    getState().addElements([rect('r1'), rect('r2')])
    useEditorStore.temporal.getState().clear()
    getState().selectElement('r1')
    getState().selectElement('r2', true)
    getState().groupSelected()
    useEditorStore.temporal.getState().undo()
    expect(getState().elements.every((e) => !e.groupId)).toBe(true)
  })
})
