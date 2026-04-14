import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type { EditorElement } from '../types/elements'

interface EditorState {
  elements: EditorElement[]
  selectedId: string | null

  // Actions
  addElement: (element: EditorElement) => void
  selectElement: (id: string | null) => void
  updateElement: (id: string, updates: Partial<EditorElement>) => void
  deleteElement: (id: string) => void
  moveElement: (id: string, x: number, y: number) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
}

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set) => ({
      elements: [],
      selectedId: null,

      addElement: (element) =>
        set((state) => {
          state.elements.push(element)
          state.selectedId = element.id
        }),

      selectElement: (id) =>
        set((state) => {
          state.selectedId = id
        }),

      updateElement: (id, updates) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) Object.assign(el, updates)
        }),

      deleteElement: (id) =>
        set((state) => {
          state.elements = state.elements.filter((e) => e.id !== id)
          if (state.selectedId === id) state.selectedId = null
        }),

      moveElement: (id, x, y) =>
        set((state) => {
          const el = state.elements.find((e) => e.id === id)
          if (el) {
            el.x = x
            el.y = y
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
    })),
    { limit: 50 }
  )
)
