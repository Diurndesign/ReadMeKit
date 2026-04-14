import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useDragElement() {
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startPositions = useRef<{ id: string; x: number; y: number }[]>([])

  const selectElement = useEditorStore((s) => s.selectElement)
  const batchMoveElements = useEditorStore((s) => s.batchMoveElements)
  const zoom = useUIStore((s) => s.zoom)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, elementId: string, elementX: number, elementY: number) => {
      e.stopPropagation()
      e.preventDefault()

      // Shift+click: toggle element in/out of selection, don't drag
      if (e.shiftKey) {
        selectElement(elementId, true)
        return
      }

      // Determine which elements to drag
      const { selectedIds, elements } = useEditorStore.getState()
      const isInMultiSelection = selectedIds.includes(elementId) && selectedIds.length > 1

      if (isInMultiSelection) {
        // Drag all selected elements
        startPositions.current = selectedIds.map((id) => {
          const el = elements.find((e) => e.id === id)!
          return { id, x: el.x, y: el.y }
        })
      } else {
        // Select this element alone and drag it
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

        batchMoveElements(
          startPositions.current.map(({ id, x, y }) => ({
            id,
            x: Math.round(x + dx),
            y: Math.round(y + dy),
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
    [selectElement, batchMoveElements, zoom]
  )

  return { handlePointerDown }
}
