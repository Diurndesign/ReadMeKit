import { create } from 'zustand'

export type ActiveTool = 'select' | 'rect' | 'text' | 'circle' | 'line' | 'image'

interface UIState {
  activeTool: ActiveTool
  zoom: number
  showGrid: boolean
  panOffset: { x: number; y: number }
  editingId: string | null
  showTemplates: boolean
  showShortcuts: boolean
  canvasBg: string
  canvasWidth: number | null
  canvasHeight: number | null
  snapGuides: { x?: number; y?: number }

  setActiveTool: (tool: ActiveTool) => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  setPanOffset: (offset: { x: number; y: number }) => void
  resetView: () => void
  setEditingId: (id: string | null) => void
  setShowTemplates: (show: boolean) => void
  setShowShortcuts: (show: boolean) => void
  setCanvasBg: (color: string) => void
  setCanvasSize: (w: number | null, h: number | null) => void
  setSnapGuides: (guides: { x?: number; y?: number }) => void
}

export const useUIStore = create<UIState>()((set) => ({
  activeTool: 'select',
  zoom: 1,
  showGrid: true,
  panOffset: { x: 0, y: 0 },
  editingId: null,
  showTemplates: false,
  showShortcuts: false,
  canvasBg: 'transparent',
  canvasWidth: null,
  canvasHeight: null,
  snapGuides: {},

  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setPanOffset: (offset) => set({ panOffset: offset }),
  resetView: () => set({ zoom: 1, panOffset: { x: 0, y: 0 } }),
  setEditingId: (id) => set({ editingId: id }),
  setShowTemplates: (show) => set({ showTemplates: show }),
  setShowShortcuts: (show) => set({ showShortcuts: show }),
  setCanvasBg: (color) => set({ canvasBg: color }),
  setCanvasSize: (w, h) => set({ canvasWidth: w, canvasHeight: h }),
  setSnapGuides: (guides) => set({ snapGuides: guides }),
}))
