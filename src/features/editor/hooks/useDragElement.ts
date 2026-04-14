import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

const GRID_STEP = 8

function snapToGrid(v: number, enabled: boolean): number {
  return enabled ? Math.round(v / GRID_STEP) * GRID_STEP : Math.round(v)
}

export function useDragElement() {
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startPositions = useRef<{ id: string; x: number; y: number }[]>([])

  const selectElement = useEditorStore((s) => s.selectElement)
  const batchMoveElements = useEditorStore((s) => s.batchMoveElements)
  const zoom = useUIStore((s) => s.zoom)
  const showGrid = useUIStore((s) => s.showGrid)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, elementId: string, elementX: number, elementY: number) => {
      e.stopPropagation()
      e.preventDefault()

      // Shift+click: toggle selection, no drag
      if (e.shiftKey) {
        selectElement(elementId, true)
        return
      }

      const { selectedIds, elements } = useEditorStore.getState()

      // Don't drag locked elements
      const el = elements.find((e) => e.id === elementId)
      if (el?.locked) {
        selectElement(elementId)
        return
      }

      const isInMultiSelection = selectedIds.includes(elementId) && selectedIds.length > 1

      if (isInMultiSelection) {
        startPositions.current = selectedIds
          .filter((id) => {
            const found = elements.find((e) => e.id === id)
            return found && !found.locked
          })
          .map((id) => {
            const found = elements.find((e) => e.id === id)!
            return { id, x: found.x, y: found.y }
          })
      } else {
        selectElement(elementId)
        startPositions.current = [{ id: elementId, x: elementX, y: elementY }]
      }

      isDragging.current = true
      startPos.current = { x: e.clientX, y: e.clientY }

      useEditorStore.temporal.getState().pause()

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDragging.current) return
        const dx = (ev.clientX - startPos.current.x) / zoom
        const dy = (ev.clientY - startPos.current.y) / zoom
        const snap = showGrid

        batchMoveElements(
          startPositions.current.map(({ id, x, y }) => ({
            id,
            x: snapToGrid(x + dx, snap),
            y: snapToGrid(y + dy, snap),
          }))
        )
      }

      const handlePointerUp = () => {
        isDragging.current = false
        useEditorStore.temporal.getState().resume()
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [selectElement, batchMoveElements, zoom, showGrid]
  )

  return { handlePointerDown }
}
