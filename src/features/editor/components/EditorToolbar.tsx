import { useState, useEffect } from 'react'
import { MousePointer2, Square, Type, Circle, Undo2, Redo2, Grid3X3, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore, type ActiveTool } from '../stores/uiStore'
import { cn } from '@/utils/cn'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  isActive?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, shortcut, isActive, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        isActive
          ? 'bg-[#6366f1] text-white'
          : disabled
            ? 'text-[#3f3f46] cursor-not-allowed'
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
      )}
    >
      {icon}
    </button>
  )
}

function useExportSVG() {
  const elements = useEditorStore((s) => s.elements)

  return () => {
    if (elements.length === 0) return

    // Compute bounding box with padding
    const PAD = 20
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const el of elements) {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    }
    const w = maxX - minX + PAD * 2
    const h = maxY - minY + PAD * 2
    const ox = minX - PAD
    const oy = minY - PAD

    const svgParts: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${ox} ${oy} ${w} ${h}">`,
    ]

    for (const el of elements) {
      const opacity = el.opacity !== 1 ? ` opacity="${el.opacity}"` : ''
      if (el.type === 'rect') {
        const stroke = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
        const radius = el.cornerRadius > 0 ? ` rx="${el.cornerRadius}" ry="${el.cornerRadius}"` : ''
        svgParts.push(
          `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${radius} fill="${el.fill}"${stroke}${opacity}/>`
        )
      } else if (el.type === 'circle') {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        const rx = el.width / 2
        const ry = el.height / 2
        const stroke = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
        svgParts.push(
          `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${el.fill}"${stroke}${opacity}/>`
        )
      } else if (el.type === 'text') {
        const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'
        const textX = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x
        const escaped = el.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        svgParts.push(
          `  <text x="${textX}" y="${el.y + el.fontSize}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" fill="${el.fill}" text-anchor="${anchor}"${opacity}>${escaped}</text>`
        )
      }
    }

    svgParts.push('</svg>')
    const svgString = svgParts.join('\n')

    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'readmekit-export.svg'
    a.click()
    URL.revokeObjectURL(url)
  }
}

export function EditorToolbar() {
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const showGrid = useUIStore((s) => s.showGrid)
  const toggleGrid = useUIStore((s) => s.toggleGrid)
  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)
  const resetView = useUIStore((s) => s.resetView)
  const elements = useEditorStore((s) => s.elements)
  const exportSVG = useExportSVG()

  // Subscribe to temporal store changes for reactive undo/redo buttons
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const unsubscribe = useEditorStore.temporal.getState !== undefined
      ? useEditorStore.temporal.subscribe((state) => {
          setCanUndo(state.pastStates.length > 0)
          setCanRedo(state.futureStates.length > 0)
        })
      : () => {}
    return unsubscribe
  }, [])

  const tools: { tool: ActiveTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { tool: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
    { tool: 'rect', icon: <Square size={18} />, label: 'Rectangle', shortcut: 'R' },
    { tool: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
    { tool: 'circle', icon: <Circle size={18} />, label: 'Circle', shortcut: 'O' },
  ]

  return (
    <div data-onboarding="toolbar" className="flex items-center gap-1 px-3 py-2 border-b border-[#2e2e33] bg-[#18181b]">
      {/* Drawing tools */}
      <div className="flex items-center gap-0.5 mr-3">
        {tools.map(({ tool, icon, label, shortcut }) => (
          <div key={tool} data-onboarding={`tool-${tool}`}>
            <ToolButton
              icon={icon}
              label={label}
              shortcut={shortcut}
              isActive={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 mx-1">
        <ToolButton
          icon={<Undo2 size={18} />}
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={!canUndo}
          onClick={() => useEditorStore.temporal.getState().undo()}
        />
        <ToolButton
          icon={<Redo2 size={18} />}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={!canRedo}
          onClick={() => useEditorStore.temporal.getState().redo()}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Grid toggle */}
      <ToolButton
        icon={<Grid3X3 size={18} />}
        label="Toggle Grid"
        isActive={showGrid}
        onClick={toggleGrid}
      />

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <ToolButton
          icon={<ZoomOut size={18} />}
          label="Zoom out"
          shortcut="Ctrl+scroll"
          onClick={() => setZoom(zoom / 1.2)}
        />
        <button
          onClick={resetView}
          title="Reset view (Ctrl+0)"
          className="flex items-center justify-center h-7 px-2 rounded text-xs font-mono text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors min-w-[52px]"
        >
          {Math.round(zoom * 100)}%
        </button>
        <ToolButton
          icon={<ZoomIn size={18} />}
          label="Zoom in"
          shortcut="Ctrl+scroll"
          onClick={() => setZoom(zoom * 1.2)}
        />
        <ToolButton
          icon={<Maximize2 size={18} />}
          label="Reset view"
          shortcut="Ctrl+0"
          onClick={resetView}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Export SVG */}
      <button
        onClick={exportSVG}
        disabled={elements.length === 0}
        title="Export SVG"
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors',
          elements.length > 0
            ? 'bg-[#6366f1] text-white hover:bg-[#818cf8]'
            : 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
        )}
      >
        <Download size={15} />
        Export SVG
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* App name */}
      <span className="text-sm font-semibold text-[#a1a1aa] tracking-wide select-none">
        ReadMeKit
      </span>
    </div>
  )
}
