import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { useDragElement } from '../hooks/useDragElement'
import { ElementRenderer } from './ElementRenderer'
import { createRectElement, createTextElement, createCircleElement } from '../types/elements'
import { generateId } from '@/utils/generateId'
import { Square, Type, Circle } from 'lucide-react'

function EmptyCanvasHint() {
  const setActiveTool = useUIStore((s) => s.setActiveTool)

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <div className="text-center pointer-events-auto">
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(99,102,241,0.2)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M7 8h10M7 12h6M7 16h8" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#e4e4e7',
            margin: '0 0 8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Ton canvas est vide
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#71717a',
            margin: '0 0 28px',
            maxWidth: 320,
            lineHeight: 1.5,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Commence par ajouter un élément avec les boutons ci-dessous ou les raccourcis clavier.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {[
            { tool: 'rect' as const, icon: <Square size={16} />, label: 'Rectangle', shortcut: 'R' },
            { tool: 'text' as const, icon: <Type size={16} />, label: 'Texte', shortcut: 'T' },
            { tool: 'circle' as const, icon: <Circle size={16} />, label: 'Cercle', shortcut: 'O' },
          ].map(({ tool, icon, label, shortcut }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#18181b',
                border: '1px solid #2e2e33',
                borderRadius: 10,
                color: '#a1a1aa',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1'
                e.currentTarget.style.color = '#e4e4e7'
                e.currentTarget.style.background = '#1c1c20'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2e2e33'
                e.currentTarget.style.color = '#a1a1aa'
                e.currentTarget.style.background = '#18181b'
              }}
            >
              {icon}
              {label}
              <span style={{ fontSize: 11, color: '#52525b', background: '#27272a', padding: '1px 6px', borderRadius: 4 }}>{shortcut}</span>
            </button>
          ))}
        </div>

        <p
          style={{
            fontSize: 12,
            color: '#3f3f46',
            marginTop: 20,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <span style={{ color: '#52525b' }}>V</span> select &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>R</span> rect &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>T</span> texte &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>O</span> cercle &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>Ctrl+Z</span> annuler
        </p>
      </div>
    </div>
  )
}

export function EditorCanvas() {
  const elements = useEditorStore((s) => s.elements)
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const addElement = useEditorStore((s) => s.addElement)
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const showGrid = useUIStore((s) => s.showGrid)
  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)
  const panOffset = useUIStore((s) => s.panOffset)
  const setPanOffset = useUIStore((s) => s.setPanOffset)
  const { handlePointerDown } = useDragElement()

  const svgRef = useRef<SVGSVGElement>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panStartOffset = useRef({ x: 0, y: 0 })
  const spaceHeld = useRef(false)

  // Space key for pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const t = e.target as HTMLElement
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
        e.preventDefault()
        spaceHeld.current = true
        if (svgRef.current) svgRef.current.style.cursor = 'grab'
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeld.current = false
        if (svgRef.current) svgRef.current.style.cursor = ''
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // Ctrl+wheel to zoom centered on cursor
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()

      const factor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.1, Math.min(5, zoom * factor))

      const rect = svgRef.current!.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Keep the canvas point under cursor fixed:
      // canvasX = mouseX/zoom + panOffset.x = mouseX/newZoom + newPanX
      const newPanX = mouseX / zoom + panOffset.x - mouseX / newZoom
      const newPanY = mouseY / zoom + panOffset.y - mouseY / newZoom

      setZoom(newZoom)
      setPanOffset({ x: newPanX, y: newPanY })
    },
    [zoom, panOffset, setZoom, setPanOffset]
  )

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: Math.round((clientX - rect.left) / zoom + panOffset.x),
      y: Math.round((clientY - rect.top) / zoom + panOffset.y),
    }
  }

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Space+drag to pan
    if (spaceHeld.current) {
      e.preventDefault()
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY }
      panStartOffset.current = { ...panOffset }
      ;(e.target as Element).setPointerCapture(e.pointerId)
      if (svgRef.current) svgRef.current.style.cursor = 'grabbing'
      return
    }

    // Only handle direct clicks on the SVG background (not on elements)
    if (e.target !== e.currentTarget) return

    const { x, y } = screenToCanvas(e.clientX, e.clientY)

    if (activeTool === 'rect') {
      addElement(createRectElement({ id: generateId(), x: x - 100, y: y - 60 }))
      setActiveTool('select')
    } else if (activeTool === 'text') {
      addElement(createTextElement({ id: generateId(), x: x - 100, y: y - 20 }))
      setActiveTool('select')
    } else if (activeTool === 'circle') {
      addElement(createCircleElement({ id: generateId(), x: x - 60, y: y - 60 }))
      setActiveTool('select')
    } else {
      selectElement(null)
    }
  }

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning.current) return
    const dx = (e.clientX - panStart.current.x) / zoom
    const dy = (e.clientY - panStart.current.y) / zoom
    setPanOffset({
      x: panStartOffset.current.x - dx,
      y: panStartOffset.current.y - dy,
    })
  }

  const handleSvgPointerUp = () => {
    if (isPanning.current) {
      isPanning.current = false
      if (svgRef.current) svgRef.current.style.cursor = spaceHeld.current ? 'grab' : ''
    }
  }

  // The <g> transform maps canvas coordinates to screen coordinates:
  // screen = (canvas - panOffset) * zoom
  const groupTransform = `scale(${zoom}) translate(${-panOffset.x}, ${-panOffset.y})`

  const cursorStyle = activeTool !== 'select' ? 'crosshair' : 'default'

  return (
    <div data-onboarding="canvas" className="flex-1 overflow-hidden relative" style={{ background: '#0f0f11' }}>
      {elements.length === 0 && activeTool === 'select' && <EmptyCanvasHint />}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ cursor: cursorStyle, display: 'block' }}
        onPointerDown={handleSvgPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
      >
        <g transform={groupTransform}>
          {/* Grid — large rect covers all reachable canvas area */}
          {showGrid && (
            <>
              <defs>
                <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e1e22" strokeWidth="0.5" />
                </pattern>
                <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#grid-small)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#252529" strokeWidth="1" />
                </pattern>
              </defs>
              <rect x={-10000} y={-10000} width={20000} height={20000} fill="url(#grid-large)" pointerEvents="none" />
            </>
          )}

          {/* Elements */}
          {elements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={element.id === selectedId}
              onPointerDown={(e) =>
                handlePointerDown(e, element.id, element.x, element.y)
              }
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
