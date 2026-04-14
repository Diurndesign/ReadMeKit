import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'

export function useDragElement() {
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startElementPos = useRef({ x: 0, y: 0 })
  const dragElementId = useRef<string | null>(null)

  const moveElement = useEditorStore((s) => s.moveElement)
  const selectElement = useEditorStore((s) => s.selectElement)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, elementId: string, elementX: number, elementY: number) => {
      e.stopPropagation()
      e.preventDefault()

      selectElement(elementId)

      isDragging.current = true
      dragElementId.current = elementId
      startPos.current = { x: e.clientX, y: e.clientY }
      startElementPos.current = { x: elementX, y: elementY }

      // Pause undo history during drag
      useEditorStore.temporal.getState().pause()

      const handlePointerMove = (ev: PointerEvent) => {
        if (!isDragging.current || !dragElementId.current) return

        const dx = ev.clientX - startPos.current.x
        const dy = ev.clientY - startPos.current.y

        moveElement(
          dragElementId.current,
          Math.round(startElementPos.current.x + dx),
          Math.round(startElementPos.current.y + dy)
        )
      }

      const handlePointerUp = () => {
        isDragging.current = false
        dragElementId.current = null

        // Resume undo history — whole drag = one undo step
        useEditorStore.temporal.getState().resume()

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [moveElement, selectElement]
  )

  return { handlePointerDown }
}
