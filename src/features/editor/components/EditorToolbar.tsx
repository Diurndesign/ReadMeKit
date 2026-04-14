import { useState, useEffect } from 'react'
import {
  MousePointer2, Square, Type, Circle, Undo2, Redo2, Grid3X3,
  ZoomIn, ZoomOut, Maximize2, Download, LayoutTemplate, Image, FileCode,
  ChevronDown, Minus, RectangleHorizontal,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore, type ActiveTool } from '../stores/uiStore'
import { cn } from '@/utils/cn'

// ─── Sub-components ───────────────────────────────────────────────────────────

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
            : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]',
      )}
    >
      {icon}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-6 bg-[#2e2e33] mx-1" />
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export function EditorToolbar() {
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const showGrid = useUIStore((s) => s.showGrid)
  const toggleGrid = useUIStore((s) => s.toggleGrid)
  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)
  const resetView = useUIStore((s) => s.resetView)
  const setShowTemplates = useUIStore((s) => s.setShowTemplates)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)
  const setCanvasSize = useUIStore((s) => s.setCanvasSize)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)
  const elements = useEditorStore((s) => s.elements)

  const CANVAS_PRESETS = [
    { label: 'Auto', w: null, h: null },
    { label: 'GitHub Banner — 800×200', w: 800, h: 200 },
    { label: 'Large Banner — 1200×300', w: 1200, h: 300 },
    { label: 'Social Card — 1200×630', w: 1200, h: 630 },
    { label: 'Square — 500×500', w: 500, h: 500 },
  ] as const

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const unsub = useEditorStore.temporal.subscribe((state) => {
      setCanUndo(state.pastStates.length > 0)
      setCanRedo(state.futureStates.length > 0)
    })
    return unsub
  }, [])

  const tools: { tool: ActiveTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { tool: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
    { tool: 'rect', icon: <Square size={18} />, label: 'Rectangle', shortcut: 'R' },
    { tool: 'text', icon: <Type size={18} />, label: 'Texte', shortcut: 'T' },
    { tool: 'circle', icon: <Circle size={18} />, label: 'Cercle', shortcut: 'O' },
    { tool: 'line', icon: <Minus size={18} />, label: 'Ligne / Flèche', shortcut: 'L' },
    { tool: 'image', icon: <Image size={18} />, label: 'Image URL', shortcut: 'I' },
  ]

  const hasVisible = elements.some((e) => e.visible !== false)

  return (
    <div data-onboarding="toolbar" className="flex items-center gap-1 px-3 py-2 border-b border-[#2e2e33] bg-[#18181b]">

      {/* Drawing tools */}
      <div className="flex items-center gap-0.5 mr-2">
        {tools.map(({ tool, icon, label, shortcut }) => (
          <div key={tool} data-onboarding={`tool-${tool}`}>
            <ToolButton
              icon={icon} label={label} shortcut={shortcut}
              isActive={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          </div>
        ))}
      </div>

      <Sep />

      {/* Undo / Redo */}
      <ToolButton icon={<Undo2 size={18} />} label="Undo" shortcut="Ctrl+Z" disabled={!canUndo} onClick={() => useEditorStore.temporal.getState().undo()} />
      <ToolButton icon={<Redo2 size={18} />} label="Redo" shortcut="Ctrl+Shift+Z" disabled={!canRedo} onClick={() => useEditorStore.temporal.getState().redo()} />

      <Sep />

      {/* Grid */}
      <ToolButton icon={<Grid3X3 size={18} />} label="Grille (snap)" isActive={showGrid} onClick={toggleGrid} />

      <Sep />

      {/* Zoom */}
      <ToolButton icon={<ZoomOut size={18} />} label="Zoom out" onClick={() => setZoom(zoom / 1.2)} />
      <button
        onClick={resetView}
        title="Reset vue (Ctrl+0)"
        className="flex items-center justify-center h-7 px-2 rounded text-xs font-mono text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors min-w-[48px]"
      >
        {Math.round(zoom * 100)}%
      </button>
      <ToolButton icon={<ZoomIn size={18} />} label="Zoom in" onClick={() => setZoom(zoom * 1.2)} />
      <ToolButton icon={<Maximize2 size={18} />} label="Reset vue" shortcut="Ctrl+0" onClick={resetView} />

      <Sep />

      {/* Canvas size preset */}
      <div className="relative group">
        <button
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          title="Taille du canvas"
        >
          <RectangleHorizontal size={15} />
          {canvasWidth && canvasHeight ? `${canvasWidth}×${canvasHeight}` : 'Auto'}
          <ChevronDown size={12} />
        </button>
        <div
          className="absolute top-full left-0 mt-1.5 w-52 rounded-xl overflow-hidden z-50 hidden group-hover:block"
          style={{ background: '#1c1c20', border: '1px solid #3f3f46', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}
        >
          {CANVAS_PRESETS.map((p) => (
            <button
              key={p.label}
              className={cn(
                'w-full flex items-center px-4 py-2 text-xs transition-colors text-left',
                canvasWidth === p.w && canvasHeight === p.h
                  ? 'text-[#818cf8] bg-[#27272a]'
                  : 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-white',
              )}
              onClick={() => setCanvasSize(p.w ?? null, p.h ?? null)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      <button
        onClick={() => setShowTemplates(true)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
        title="Templates"
      >
        <LayoutTemplate size={15} />
        Templates
      </button>

      {/* Export — opens full dialog */}
      <button
        onClick={() => hasVisible && setShowExportDialog(true)}
        disabled={!hasVisible}
        title="Exporter (SVG / PNG / PDF + options GitHub)"
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors',
          !hasVisible
            ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
            : 'bg-[#6366f1] text-white hover:bg-[#818cf8]',
        )}
      >
        <Download size={14} />
        Export…
      </button>

      <div className="flex-1" />
      <span className="text-sm font-semibold text-[#52525b] tracking-wide select-none">ReadMeKit</span>
    </div>
  )
}

// Re-export FileCode so any existing consumers don't break
export { FileCode }
