import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export const CURSOR_MAP: Record<ResizeHandle, string> = {
  nw: 'nw-resize',
  n: 'n-resize',
  ne: 'ne-resize',
  e: 'e-resize',
  se: 'se-resize',
  s: 's-resize',
  sw: 'sw-resize',
  w: 'w-resize',
}

const GRID_STEP = 8

function snap(v: number, enabled: boolean): number {
  return enabled ? Math.round(v / GRID_STEP) * GRID_STEP : Math.round(v)
}

export function useResizeElement() {
  const isResizing = useRef(false)
  const activeHandle = useRef<ResizeHandle | null>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startBounds = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const elementId = useRef<string | null>(null)

  const updateElement = useEditorStore((s) => s.updateElement)
  const zoom = useUIStore((s) => s.zoom)
  const showGrid = useUIStore((s) => s.showGrid)

  const handleResizeStart = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      handle: ResizeHandle,
      bounds: { x: number; y: number; width: number; height: number }
    ) => {
      e.stopPropagation()
      e.preventDefault()
      ;(e.target as Element).setPointerCapture(e.pointerId)

      isResizing.current = true
      activeHandle.current = handle
      elementId.current = id
      startPos.current = { x: e.clientX, y: e.clientY }
      startBounds.current = { ...bounds }

      useEditorStore.temporal.getState().pause()

      const onMove = (ev: PointerEvent) => {
        if (!isResizing.current || !elementId.current) return

        const dx = (ev.clientX - startPos.current.x) / zoom
        const dy = (ev.clientY - startPos.current.y) / zoom
        const { x, y, width, height } = startBounds.current
        const useSnap = showGrid

        let nx = x, ny = y, nw = width, nh = height
        const h = activeHandle.current!

        if (h === 'nw' || h === 'w' || h === 'sw') { nx = snap(x + dx, useSnap); nw = width - (nx - x) }
        if (h === 'ne' || h === 'e' || h === 'se') { nw = snap(width + dx, useSnap) }
        if (h === 'nw' || h === 'n' || h === 'ne') { ny = snap(y + dy, useSnap); nh = height - (ny - y) }
        if (h === 'sw' || h === 's' || h === 'se') { nh = snap(height + dy, useSnap) }

        const MIN = 10
        if (nw < MIN) {
          if (h === 'nw' || h === 'w' || h === 'sw') nx = x + width - MIN
          nw = MIN
        }
        if (nh < MIN) {
          if (h === 'nw' || h === 'n' || h === 'ne') ny = y + height - MIN
          nh = MIN
        }

        updateElement(elementId.current, {
          x: Math.round(nx),
          y: Math.round(ny),
          width: Math.round(nw),
          height: Math.round(nh),
        })
      }

      const onUp = () => {
        isResizing.current = false
        useEditorStore.temporal.getState().resume()
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [updateElement, zoom, showGrid]
  )

  return { handleResizeStart }
}
