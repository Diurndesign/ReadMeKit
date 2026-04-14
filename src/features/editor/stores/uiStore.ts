import { create } from 'zustand'

export type ActiveTool = 'select' | 'rect' | 'text' | 'circle'

interface UIState {
  activeTool: ActiveTool
  zoom: number
  showGrid: boolean
  panOffset: { x: number; y: number }

  setActiveTool: (tool: ActiveTool) => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  setPanOffset: (offset: { x: number; y: number }) => void
  resetView: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  zoom: 1,
  showGrid: true,
  panOffset: { x: 0, y: 0 },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setPanOffset: (offset) => set({ panOffset: offset }),
  resetView: () => set({ zoom: 1, panOffset: { x: 0, y: 0 } }),
}))
