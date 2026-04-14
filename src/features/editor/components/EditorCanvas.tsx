import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { useDragElement } from '../hooks/useDragElement'
import { ElementRenderer } from './ElementRenderer'
import { createRectElement, createTextElement } from '../types/elements'
import { generateId } from '@/utils/generateId'
import { Square, Type } from 'lucide-react'

function EmptyCanvasHint() {
  const setActiveTool = useUIStore((s) => s.setActiveTool)

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <div className="text-center pointer-events-auto">
        {/* Logo / title */}
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
          Commence par ajouter un element avec les boutons ci-dessous ou les raccourcis clavier.
        </p>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTool('rect')}
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
            <Square size={16} />
            Rectangle
            <span style={{ fontSize: 11, color: '#52525b', background: '#27272a', padding: '1px 6px', borderRadius: 4 }}>R</span>
          </button>

          <button
            onClick={() => setActiveTool('text')}
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
            <Type size={16} />
            Texte
            <span style={{ fontSize: 11, color: '#52525b', background: '#27272a', padding: '1px 6px', borderRadius: 4 }}>T</span>
          </button>
        </div>

        {/* Keyboard hint */}
        <p
          style={{
            fontSize: 12,
            color: '#3f3f46',
            marginTop: 20,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <span style={{ color: '#52525b' }}>V</span> select &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>R</span> rectangle &nbsp;&middot;&nbsp;
          <span style={{ color: '#52525b' }}>T</span> texte &nbsp;&middot;&nbsp;
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
  const { handlePointerDown } = useDragElement()

  const handleCanvasClick = (e: React.PointerEvent<SVGSVGElement>) => {
    // Only handle direct clicks on the SVG canvas, not on elements
    if (e.target !== e.currentTarget) return

    if (activeTool === 'rect') {
      const svg = e.currentTarget
      const point = svg.createSVGPoint()
      point.x = e.clientX
      point.y = e.clientY
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse())

      addElement(
        createRectElement({
          id: generateId(),
          x: Math.round(svgPoint.x - 100),
          y: Math.round(svgPoint.y - 60),
        })
      )
      setActiveTool('select')
    } else if (activeTool === 'text') {
      const svg = e.currentTarget
      const point = svg.createSVGPoint()
      point.x = e.clientX
      point.y = e.clientY
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse())

      addElement(
        createTextElement({
          id: generateId(),
          x: Math.round(svgPoint.x - 100),
          y: Math.round(svgPoint.y - 20),
        })
      )
      setActiveTool('select')
    } else {
      selectElement(null)
    }
  }

  return (
    <div data-onboarding="canvas" className="flex-1 overflow-hidden relative" style={{ background: '#0f0f11' }}>
      {/* Empty state hint */}
      {elements.length === 0 && activeTool === 'select' && <EmptyCanvasHint />}

      <svg
        width="100%"
        height="100%"
        onPointerDown={handleCanvasClick}
        style={{
          cursor: activeTool !== 'select' ? 'crosshair' : 'default',
        }}
      >
        {/* Grid pattern */}
        {showGrid && (
          <>
            <defs>
              <pattern
                id="grid-small"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#1e1e22"
                  strokeWidth="0.5"
                />
              </pattern>
              <pattern
                id="grid-large"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect width="100" height="100" fill="url(#grid-small)" />
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#252529"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-large)" pointerEvents="none" />
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
      </svg>
    </div>
  )
}
