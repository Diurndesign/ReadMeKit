import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

const GRID_STEP = 8
// Alignment snap threshold in screen pixels
const ALIGN_PX = 6

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

        // Single-element drag: check smart alignment guides
        if (startPositions.current.length === 1) {
          const { elements: els } = useEditorStore.getState()
          const { id, x: startX, y: startY } = startPositions.current[0]
          const moving = els.find((e) => e.id === id)

          if (moving) {
            let nx = startX + dx
            let ny = startY + dy
            const w = moving.width, h = moving.height
            const snapDist = ALIGN_PX / zoom
            const guides: { x?: number; y?: number } = {}

            // X-axis alignment points of the dragged element
            const myXs = [nx, nx + w / 2, nx + w]
            // Y-axis alignment points
            const myYs = [ny, ny + h / 2, ny + h]

            for (const other of els) {
              if (other.id === id || other.visible === false) continue
              const otherXs = [other.x, other.x + other.width / 2, other.x + other.width]
              const otherYs = [other.y, other.y + other.height / 2, other.y + other.height]

              if (guides.x === undefined) {
                for (let i = 0; i < myXs.length; i++) {
                  for (const ox of otherXs) {
                    if (Math.abs(myXs[i] - ox) < snapDist) {
                      nx = ox - (myXs[i] - nx)
                      guides.x = ox
                      break
                    }
                  }
                  if (guides.x !== undefined) break
                }
              }

              if (guides.y === undefined) {
                for (let i = 0; i < myYs.length; i++) {
                  for (const oy of otherYs) {
                    if (Math.abs(myYs[i] - oy) < snapDist) {
                      ny = oy - (myYs[i] - ny)
                      guides.y = oy
                      break
                    }
                  }
                  if (guides.y !== undefined) break
                }
              }

              if (guides.x !== undefined && guides.y !== undefined) break
            }

            // Fall back to grid snap if no alignment found
            if (guides.x === undefined) nx = snapToGrid(nx, showGrid)
            if (guides.y === undefined) ny = snapToGrid(ny, showGrid)

            useUIStore.getState().setSnapGuides(guides)
            batchMoveElements([{ id, x: Math.round(nx), y: Math.round(ny) }])
            return
          }
        }

        // Multi-element drag: grid snap only, no guides
        useUIStore.getState().setSnapGuides({})
        batchMoveElements(
          startPositions.current.map(({ id, x, y }) => ({
            id,
            x: snapToGrid(x + dx, showGrid),
            y: snapToGrid(y + dy, showGrid),
          }))
        )
      }

      const handlePointerUp = () => {
        isDragging.current = false
        useEditorStore.temporal.getState().resume()
        useUIStore.getState().setSnapGuides({})
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
