import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { useDragElement } from '../hooks/useDragElement'
import { ElementRenderer } from './ElementRenderer'
import { createRectElement, createTextElement, createCircleElement, createLineElement, createImageElement } from '../types/elements'
import type { TextElement } from '../types/elements'
import { generateId } from '@/utils/generateId'
import { Square, Type, Circle, Minus, Image } from 'lucide-react'

// ─── Inline text editing overlay ────────────────────────────────────────────

interface TextOverlayProps {
  element: TextElement
  svgRef: React.RefObject<SVGSVGElement | null>
  zoom: number
  panOffset: { x: number; y: number }
}

function TextEditingOverlay({ element, svgRef, zoom, panOffset }: TextOverlayProps) {
  const setEditingId = useUIStore((s) => s.setEditingId)
  const updateElement = useEditorStore((s) => s.updateElement)
  const [value, setValue] = useState(element.content)
  const ref = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
    autoResize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const svgRect = svgRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
  const sx = svgRect.left + (element.x - panOffset.x) * zoom
  const sy = svgRect.top + (element.y - panOffset.y) * zoom
  const sw = element.width * zoom
  const sh = Math.max(element.height, element.fontSize * 1.4) * zoom

  const commit = () => {
    updateElement(element.id, { content: value })
    setEditingId(null)
  }

  return (
    <textarea
      ref={ref}
      autoFocus
      value={value}
      onChange={(e) => { setValue(e.target.value); autoResize() }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { setEditingId(null); return }
        // Ctrl+Enter / Cmd+Enter = commit; plain Enter = insert newline
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); commit(); return }
        e.stopPropagation()
      }}
      style={{
        position: 'fixed',
        left: sx,
        top: sy,
        width: sw,
        minHeight: sh,
        height: 'auto',
        fontSize: element.fontSize * zoom,
        fontWeight: element.fontWeight,
        fontFamily: element.fontFamily,
        color: element.fill,
        textAlign: element.textAlign,
        background: 'rgba(15,15,17,0.85)',
        border: '2px solid #6366f1',
        borderRadius: 4,
        padding: '2px 4px',
        margin: 0,
        outline: 'none',
        resize: 'none',
        lineHeight: 1.3,
        zIndex: 100,
        caretColor: element.fill,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    />
  )
}

// ─── Empty canvas hint ───────────────────────────────────────────────────────

function EmptyCanvasHint() {
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
      <div className="text-center pointer-events-auto">
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(99,102,241,0.2)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M7 8h10M7 12h6M7 16h8" />
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e4e4e7', margin: '0 0 8px', fontFamily: 'system-ui,sans-serif' }}>Ton canvas est vide</h2>
        <p style={{ fontSize: 14, color: '#71717a', margin: '0 0 28px', maxWidth: 320, lineHeight: 1.5, fontFamily: 'system-ui,sans-serif' }}>
          Commence par ajouter un élément avec les boutons ci-dessous ou les raccourcis clavier.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {[
            { tool: 'rect' as const, icon: <Square size={16} />, label: 'Rectangle', shortcut: 'R' },
            { tool: 'text' as const, icon: <Type size={16} />, label: 'Texte', shortcut: 'T' },
            { tool: 'circle' as const, icon: <Circle size={16} />, label: 'Cercle', shortcut: 'O' },
            { tool: 'line' as const, icon: <Minus size={16} />, label: 'Ligne', shortcut: 'L' },
            { tool: 'image' as const, icon: <Image size={16} />, label: 'Image', shortcut: 'I' },
          ].map(({ tool, icon, label, shortcut }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#18181b', border: '1px solid #2e2e33', borderRadius: 10, color: '#a1a1aa', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'system-ui,sans-serif' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#e4e4e7' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2e2e33'; e.currentTarget.style.color = '#a1a1aa' }}
            >
              {icon}{label}
              <span style={{ fontSize: 11, color: '#52525b', background: '#27272a', padding: '1px 6px', borderRadius: 4 }}>{shortcut}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#3f3f46', marginTop: 20, fontFamily: 'system-ui,sans-serif' }}>
          <span style={{ color: '#52525b' }}>V</span> select &nbsp;·&nbsp;
          <span style={{ color: '#52525b' }}>R</span> rect &nbsp;·&nbsp;
          <span style={{ color: '#52525b' }}>T</span> texte &nbsp;·&nbsp;
          <span style={{ color: '#52525b' }}>O</span> cercle &nbsp;·&nbsp;
          <span style={{ color: '#52525b' }}>Ctrl+Z</span> annuler
        </p>
      </div>
    </div>
  )
}

// ─── EditorCanvas ────────────────────────────────────────────────────────────

export function EditorCanvas() {
  const elements = useEditorStore((s) => s.elements)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectElements = useEditorStore((s) => s.selectElements)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const addElement = useEditorStore((s) => s.addElement)
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const showGrid = useUIStore((s) => s.showGrid)
  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)
  const panOffset = useUIStore((s) => s.panOffset)
  const setPanOffset = useUIStore((s) => s.setPanOffset)
  const editingId = useUIStore((s) => s.editingId)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)
  const snapGuides = useUIStore((s) => s.snapGuides)
  const { handlePointerDown } = useDragElement()

  // Line drawing state
  const [drawingLine, setDrawingLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const isDrawingLine = useRef(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const spaceHeld = useRef(false)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panStartOffset = useRef({ x: 0, y: 0 })

  // Marquee selection state
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const marqueeStart = useRef<{ x: number; y: number } | null>(null)
  const isDraggingMarquee = useRef(false)

  // The text element being edited inline
  const editingElement = editingId
    ? (elements.find((e) => e.id === editingId) as TextElement | undefined)
    : undefined

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
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  // Wheel: Ctrl = zoom centered on cursor; otherwise = pan
  // Lire depuis getState() pour éviter la closure périmée lors du scroll rapide
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const { zoom: z, panOffset: pan } = useUIStore.getState()
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.1, Math.min(5, z * factor))
      const rect = svgRef.current!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      setZoom(newZoom)
      setPanOffset({ x: mx / z + pan.x - mx / newZoom, y: my / z + pan.y - my / newZoom })
    } else {
      setPanOffset({ x: pan.x + e.deltaX / z, y: pan.y + e.deltaY / z })
    }
  }, [setZoom, setPanOffset])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const screenToCanvas = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / zoom + panOffset.x,
      y: (clientY - rect.top) / zoom + panOffset.y,
    }
  }

  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Middle-click or Space+drag → pan (can start from any element)
    if (e.button === 1 || spaceHeld.current) {
      e.preventDefault()
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY }
      panStartOffset.current = { ...panOffset }
      ;(e.target as Element).setPointerCapture(e.pointerId)
      if (svgRef.current) svgRef.current.style.cursor = 'grabbing'
      return
    }

    // Only handle direct SVG background clicks (left button)
    if (e.target !== e.currentTarget) return

    const { x, y } = screenToCanvas(e.clientX, e.clientY)

    if (activeTool === 'rect') {
      addElement(createRectElement({ id: generateId(), x: Math.round(x - 100), y: Math.round(y - 60) }))
      setActiveTool('select')
    } else if (activeTool === 'text') {
      addElement(createTextElement({ id: generateId(), x: Math.round(x - 100), y: Math.round(y - 20) }))
      setActiveTool('select')
    } else if (activeTool === 'circle') {
      addElement(createCircleElement({ id: generateId(), x: Math.round(x - 60), y: Math.round(y - 60) }))
      setActiveTool('select')
    } else if (activeTool === 'image') {
      addElement(createImageElement({ id: generateId(), x: Math.round(x - 120), y: Math.round(y - 80) }))
      setActiveTool('select')
    } else if (activeTool === 'line') {
      // Start drawing a line — track drag
      isDrawingLine.current = true
      setDrawingLine({ x1: x, y1: y, x2: x, y2: y })
      ;(e.target as Element).setPointerCapture(e.pointerId)
    } else {
      // Begin marquee selection
      marqueeStart.current = { x, y }
      isDraggingMarquee.current = false
      ;(e.target as Element).setPointerCapture(e.pointerId)
    }
  }

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      const dx = (e.clientX - panStart.current.x) / zoom
      const dy = (e.clientY - panStart.current.y) / zoom
      setPanOffset({ x: panStartOffset.current.x - dx, y: panStartOffset.current.y - dy })
      return
    }

    if (isDrawingLine.current && drawingLine) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setDrawingLine((prev) => prev ? { ...prev, x2: x, y2: y } : null)
      return
    }

    if (marqueeStart.current) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      const dx = x - marqueeStart.current.x
      const dy = y - marqueeStart.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        isDraggingMarquee.current = true
        setMarquee({
          x: Math.min(x, marqueeStart.current.x),
          y: Math.min(y, marqueeStart.current.y),
          w: Math.abs(dx),
          h: Math.abs(dy),
        })
      }
    }
  }

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      isPanning.current = false
      if (svgRef.current) svgRef.current.style.cursor = spaceHeld.current ? 'grab' : ''
      return
    }

    if (isDrawingLine.current && drawingLine) {
      isDrawingLine.current = false
      const dx = drawingLine.x2 - drawingLine.x1
      const dy = drawingLine.y2 - drawingLine.y1
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        addElement(createLineElement({
          id: generateId(),
          x: Math.round(drawingLine.x1),
          y: Math.round(drawingLine.y1),
          width: Math.round(dx),
          height: Math.round(dy),
        }))
      } else {
        // Plain click → create a default 200px horizontal line centered on click
        addElement(createLineElement({
          id: generateId(),
          x: Math.round(drawingLine.x1 - 100),
          y: Math.round(drawingLine.y1),
          width: 200,
          height: 0,
        }))
      }
      setDrawingLine(null)
      setActiveTool('select')
      return
    }

    if (marqueeStart.current) {
      if (isDraggingMarquee.current && marquee) {
        const { x, y, w, h } = marquee
        const hit = elements.filter((el) => {
          const bb = getElementBBox(el)
          return bb.x < x + w && bb.x + bb.w > x && bb.y < y + h && bb.y + bb.h > y
        })
        if (e.shiftKey) {
          const current = useEditorStore.getState().selectedIds
          const merged = Array.from(new Set([...current, ...hit.map((el) => el.id)]))
          selectElements(merged)
        } else {
          selectElements(hit.map((el) => el.id))
        }
      } else {
        // Plain click on empty canvas
        clearSelection()
      }
      marqueeStart.current = null
      isDraggingMarquee.current = false
      setMarquee(null)
    }
  }

  // Multi-selection bounding box
  const selectedElements = elements.filter((e) => selectedIds.includes(e.id))
  const showMultiBoundingBox = selectedIds.length > 1 && selectedElements.length > 1
  let multiBBox = { x: 0, y: 0, w: 0, h: 0 }
  if (showMultiBoundingBox) {
    const minX = Math.min(...selectedElements.map((e) => e.x))
    const minY = Math.min(...selectedElements.map((e) => e.y))
    const maxX = Math.max(...selectedElements.map((e) => e.x + e.width))
    const maxY = Math.max(...selectedElements.map((e) => e.y + e.height))
    multiBBox = { x: minX - 6, y: minY - 6, w: maxX - minX + 12, h: maxY - minY + 12 }
  }

  const cursorStyle = activeTool !== 'select' ? 'crosshair' : 'default'
  // Marquee hit test — handles lines with negative w/h
  const getElementBBox = (el: { x: number; y: number; width: number; height: number; type: string }) => {
    if (el.type === 'line') {
      return {
        x: Math.min(el.x, el.x + el.width),
        y: Math.min(el.y, el.y + el.height),
        w: Math.abs(el.width) || 1,
        h: Math.abs(el.height) || 1,
      }
    }
    return { x: el.x, y: el.y, w: el.width, h: el.height }
  }
  const groupTransform = `scale(${zoom}) translate(${-panOffset.x}, ${-panOffset.y})`

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
          {/* Grid */}
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
              <rect x={-300} y={-300} width={3000} height={3000} fill="url(#grid-large)" pointerEvents="none" />
            </>
          )}

          {/* Canvas background */}
          {canvasBg && canvasBg !== 'transparent' && (
            <rect x={-10000} y={-10000} width={20000} height={20000} fill={canvasBg} pointerEvents="none" />
          )}

          {/* Canvas frame (when size is set) */}
          {canvasWidth && canvasHeight && (
            <>
              <rect
                x={0} y={0} width={canvasWidth} height={canvasHeight}
                fill="none"
                stroke="#3f3f46"
                strokeWidth={1 / zoom}
                strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                pointerEvents="none"
              />
              <text
                x={0} y={-6 / zoom}
                fontSize={10 / zoom}
                fill="#52525b"
                fontFamily="system-ui, sans-serif"
                pointerEvents="none"
              >
                {canvasWidth} × {canvasHeight}
              </text>
            </>
          )}

          {/* Elements */}
          {elements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedIds.includes(element.id)}
              onPointerDown={(e) => handlePointerDown(e, element.id, element.x, element.y)}
            />
          ))}

          {/* Multi-selection bounding box */}
          {showMultiBoundingBox && (
            <rect
              x={multiBBox.x} y={multiBBox.y} width={multiBBox.w} height={multiBBox.h}
              fill="none" stroke="#6366f1" strokeWidth={1} strokeDasharray="6 3"
              pointerEvents="none"
            />
          )}

          {/* Line drawing preview */}
          {drawingLine && (
            <line
              x1={drawingLine.x1} y1={drawingLine.y1}
              x2={drawingLine.x2} y2={drawingLine.y2}
              stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}

          {/* Marquee selection rect */}
          {marquee && (
            <rect
              x={marquee.x} y={marquee.y} width={marquee.w} height={marquee.h}
              fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth={1} strokeDasharray="4 2"
              pointerEvents="none"
            />
          )}

          {/* Smart alignment guides */}
          {snapGuides.x !== undefined && (
            <line
              x1={snapGuides.x} y1={-10000} x2={snapGuides.x} y2={10000}
              stroke="#f59e0b" strokeWidth={1 / zoom}
              pointerEvents="none"
            />
          )}
          {snapGuides.y !== undefined && (
            <line
              x1={-10000} y1={snapGuides.y} x2={10000} y2={snapGuides.y}
              stroke="#f59e0b" strokeWidth={1 / zoom}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      {/* Inline text editing overlay */}
      {editingElement && editingElement.type === 'text' && (
        <TextEditingOverlay
          element={editingElement}
          svgRef={svgRef}
          zoom={zoom}
          panOffset={panOffset}
        />
      )}
    </div>
  )
}
