import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { EditorElement } from '../types/elements'
import { generateId } from '@/utils/generateId'

interface EditorState {
  elements: EditorElement[]
  selectedIds: string[]
  clipboard: EditorElement[]

  addElement: (element: EditorElement) => void
  addElements: (elements: EditorElement[]) => void
  selectElement: (id: string | null, addToSelection?: boolean) => void
  selectElements: (ids: string[]) => void
  clearSelection: () => void
  updateElement: (id: string, updates: Partial<EditorElement>) => void
  deleteElement: (id: string) => void
  deleteSelected: () => void
  moveElement: (id: string, x: number, y: number) => void
  batchMoveElements: (moves: { id: string; x: number; y: number }[]) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  reorderElement: (id: string, toIndex: number) => void
  duplicateElement: (id: string) => void
  toggleElementVisibility: (id: string) => void
  toggleElementLock: (id: string) => void
  renameElement: (id: string, name: string) => void
  alignElements: (ids: string[], direction: 'left' | 'center-h' | 'right' | 'top' | 'middle-v' | 'bottom') => void
  distributeElements: (ids: string[], axis: 'h' | 'v') => void
  copySelected: () => void
  paste: () => void
  groupSelected: () => void
  ungroupSelected: () => void
}

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set) => ({
      elements: [],
      selectedIds: [],
      clipboard: [],

      addElement: (element) =>
        set((state) => {
          state.elements.push(element)
          state.selectedIds = [element.id]
        }),

      addElements: (elements) =>
        set((state) => {
          state.elements.push(...elements)
          state.selectedIds = elements.map((e) => e.id)
        }),

      selectElement: (id, addToSelection = false) =>
        set((state) => {
          if (id === null) {
            state.selectedIds = []
          } else if (addToSelection) {
            const idx = state.selectedIds.indexOf(id)
            if (idx >= 0) {
              state.selectedIds.splice(idx, 1)
            } else {
              state.selectedIds.push(id)
            }
          } else {
            state.selectedIds = [id]
          }
        }),

      selectElements: (ids) =>
        set((state) => {
          state.selectedIds = ids
        }),

      clearSelection: () =>
        set((state) => {
          state.selectedIds = []
        }),

      updateElement: (id, updates) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) Object.assign(el, updates)
        }),

      deleteElement: (id) =>
        set((state) => {
          state.elements = state.elements.filter((e) => e.id !== id)
          state.selectedIds = state.selectedIds.filter((sid) => sid !== id)
        }),

      deleteSelected: () =>
        set((state) => {
          state.elements = state.elements.filter((e) => !state.selectedIds.includes(e.id))
          state.selectedIds = []
        }),

      moveElement: (id, x, y) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) { el.x = x; el.y = y }
        }),

      batchMoveElements: (moves) =>
        set((state) => {
          for (const { id, x, y } of moves) {
            const el = state.elements.find((e) => e.id === id)
            if (el) { el.x = x; el.y = y }
          }
        }),

      bringForward: (id) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id)
          if (idx < state.elements.length - 1) {
            const [el] = state.elements.splice(idx, 1)
            state.elements.splice(idx + 1, 0, el)
          }
        }),

      sendBackward: (id) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id)
          if (idx > 0) {
            const [el] = state.elements.splice(idx, 1)
            state.elements.splice(idx - 1, 0, el)
          }
        }),

      bringToFront: (id) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id)
          if (idx < 0) return
          const [el] = state.elements.splice(idx, 1)
          state.elements.push(el)
        }),

      sendToBack: (id) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id)
          if (idx < 0) return
          const [el] = state.elements.splice(idx, 1)
          state.elements.unshift(el)
        }),

      reorderElement: (id, toIndex) =>
        set((state) => {
          const idx = state.elements.findIndex((e) => e.id === id)
          if (idx < 0) return
          const [el] = state.elements.splice(idx, 1)
          state.elements.splice(Math.max(0, Math.min(toIndex, state.elements.length)), 0, el)
        }),

      duplicateElement: (id) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (!el) return
          const newEl = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20 }
          state.elements.push(newEl)
          state.selectedIds = [newEl.id]
        }),

      toggleElementVisibility: (id) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) el.visible = !el.visible
        }),

      toggleElementLock: (id) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) el.locked = !el.locked
        }),

      renameElement: (id, name) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) el.name = name
        }),

      alignElements: (ids, direction) =>
        set((state) => {
          const targets = state.elements.filter((e) => ids.includes(e.id))
          if (targets.length < 2) return
          const minX = Math.min(...targets.map((e) => e.x))
          const maxX = Math.max(...targets.map((e) => e.x + e.width))
          const minY = Math.min(...targets.map((e) => e.y))
          const maxY = Math.max(...targets.map((e) => e.y + e.height))
          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2
          for (const el of targets) {
            if (direction === 'left') el.x = minX
            else if (direction === 'center-h') el.x = centerX - el.width / 2
            else if (direction === 'right') el.x = maxX - el.width
            else if (direction === 'top') el.y = minY
            else if (direction === 'middle-v') el.y = centerY - el.height / 2
            else if (direction === 'bottom') el.y = maxY - el.height
          }
        }),

      distributeElements: (ids, axis) =>
        set((state) => {
          const targets = state.elements.filter((e) => ids.includes(e.id))
          if (targets.length < 3) return
          if (axis === 'h') {
            const sorted = [...targets].sort((a, b) => a.x - b.x)
            const totalW = sorted.reduce((sum, e) => sum + e.width, 0)
            const span = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x
            const gap = (span - totalW) / (sorted.length - 1)
            let cursor = sorted[0].x
            for (const el of sorted) {
              const found = state.elements.find((e) => e.id === el.id)
              if (found) { found.x = Math.round(cursor); cursor += found.width + gap }
            }
          } else {
            const sorted = [...targets].sort((a, b) => a.y - b.y)
            const totalH = sorted.reduce((sum, e) => sum + e.height, 0)
            const span = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y
            const gap = (span - totalH) / (sorted.length - 1)
            let cursor = sorted[0].y
            for (const el of sorted) {
              const found = state.elements.find((e) => e.id === el.id)
              if (found) { found.y = Math.round(cursor); cursor += found.height + gap }
            }
          }
        }),

      copySelected: () =>
        set((state) => {
          state.clipboard = state.elements.filter((e) => state.selectedIds.includes(e.id))
        }),

      paste: () =>
        set((state) => {
          if (state.clipboard.length === 0) return
          // Remap groupIds so pasted groups get fresh group identities
          const groupIdMap = new Map<string, string>()
          const newEls = state.clipboard.map((el) => {
            let newGroupId: string | undefined
            if (el.groupId) {
              if (!groupIdMap.has(el.groupId)) groupIdMap.set(el.groupId, generateId())
              newGroupId = groupIdMap.get(el.groupId)
            }
            return { ...el, id: generateId(), x: el.x + 20, y: el.y + 20, groupId: newGroupId }
          })
          state.elements.push(...newEls)
          state.selectedIds = newEls.map((e) => e.id)
        }),

      groupSelected: () =>
        set((state) => {
          if (state.selectedIds.length < 2) return
          const groupId = generateId()
          for (const el of state.elements) {
            if (state.selectedIds.includes(el.id)) el.groupId = groupId
          }
        }),

      ungroupSelected: () =>
        set((state) => {
          // Collect all groupIds referenced by the selection
          const groupIds = new Set(
            state.elements
              .filter((el) => state.selectedIds.includes(el.id) && el.groupId)
              .map((el) => el.groupId!),
          )
          if (groupIds.size === 0) return
          // Remove groupId from every element in those groups
          for (const el of state.elements) {
            if (el.groupId && groupIds.has(el.groupId)) {
              el.groupId = undefined
            }
          }
        }),
    })),
    { limit: 50, partialize: (state) => ({ elements: state.elements }) }
  )
)
