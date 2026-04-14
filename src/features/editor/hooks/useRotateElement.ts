import { useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useRotateElement() {
  const isRotating = useRef(false)
  const startAngle = useRef(0)
  const startRotation = useRef(0)
  const elementId = useRef<string | null>(null)
  const centerScreen = useRef({ x: 0, y: 0 })

  const updateElement = useEditorStore((s) => s.updateElement)
  const zoom = useUIStore((s) => s.zoom)
  const panOffset = useUIStore((s) => s.panOffset)

  const handleRotateStart = useCallback(
    (
      e: React.PointerEvent,
      id: string,
      /** Center of the element in canvas coordinates */
      centerCanvasX: number,
      centerCanvasY: number,
      currentRotation: number,
    ) => {
      e.stopPropagation()
      e.preventDefault()
      ;(e.target as Element).setPointerCapture(e.pointerId)

      // Convert element center from canvas coords to screen coords
      const svgEl = (e.target as Element).closest('svg')
      const svgRect = svgEl?.getBoundingClientRect() ?? { left: 0, top: 0 }
      const scx = svgRect.left + (centerCanvasX - panOffset.x) * zoom
      const scy = svgRect.top + (centerCanvasY - panOffset.y) * zoom

      centerScreen.current = { x: scx, y: scy }
      elementId.current = id
      startAngle.current = Math.atan2(e.clientY - scy, e.clientX - scx)
      startRotation.current = currentRotation
      isRotating.current = true

      useEditorStore.temporal.getState().pause()

      const onMove = (ev: PointerEvent) => {
        if (!isRotating.current || !elementId.current) return
        const { x, y } = centerScreen.current
        const angle = Math.atan2(ev.clientY - y, ev.clientX - x)
        let newRot = startRotation.current + (angle - startAngle.current) * (180 / Math.PI)
        // Shift key: snap to 15° increments
        if (ev.shiftKey) newRot = Math.round(newRot / 15) * 15
        newRot = ((newRot % 360) + 360) % 360
        updateElement(elementId.current, { rotation: Math.round(newRot) })
      }

      const onUp = () => {
        isRotating.current = false
        useEditorStore.temporal.getState().resume()
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [updateElement, zoom, panOffset]
  )

  return { handleRotateStart }
}
