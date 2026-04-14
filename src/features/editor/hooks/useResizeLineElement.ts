import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useResizeLineElement() {
  const isResizing = useRef(false)
  const activeHandle = useRef<'start' | 'end' | null>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startBounds = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const elementId = useRef<string | null>(null)

  const updateElement = useEditorStore((s) => s.updateElement)
  const zoom = useUIStore((s) => s.zoom)

  const handleResizeStart = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      handle: 'start' | 'end',
      bounds: { x: number; y: number; width: number; height: number },
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

        if (activeHandle.current === 'start') {
          // Move start, keep end point (x+width, y+height) fixed
          const endX = x + width
          const endY = y + height
          const newX = Math.round(x + dx)
          const newY = Math.round(y + dy)
          updateElement(elementId.current, {
            x: newX, y: newY,
            width: endX - newX, height: endY - newY,
          })
        } else {
          // Move end, keep start fixed
          updateElement(elementId.current, {
            width: Math.round(width + dx),
            height: Math.round(height + dy),
          })
        }
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
    [updateElement, zoom],
  )

  return { handleResizeStart }
}
