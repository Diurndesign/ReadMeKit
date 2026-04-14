import { useState, useEffect, useRef } from 'react'
import {
  MousePointer2, Square, Type, Circle, Undo2, Redo2, Grid3X3,
  ZoomIn, ZoomOut, Maximize2, Download, LayoutTemplate, Image, FileCode,
  ChevronDown, Clipboard, Check, Minus, RectangleHorizontal, FileText,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore, type ActiveTool } from '../stores/uiStore'
import { cn } from '@/utils/cn'
import { wrapText } from '@/utils/wrapText'
import type { EditorElement } from '../types/elements'

// ─── Shared SVG builder ───────────────────────────────────────────────────────

const PAD = 20

function svgGradientCoords(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return {
    x1: `${50 - 50 * Math.sin(a)}%`,
    y1: `${50 - 50 * Math.cos(a)}%`,
    x2: `${50 + 50 * Math.sin(a)}%`,
    y2: `${50 + 50 * Math.cos(a)}%`,
  }
}

function buildSvgString(
  elements: EditorElement[],
  canvasBg = 'transparent',
  canvasWidth: number | null = null,
  canvasHeight: number | null = null,
): { svg: string; w: number; h: number; ox: number; oy: number } | null {
  const visible = elements.filter((e) => e.visible !== false)
  if (visible.length === 0) return null

  let w: number, h: number, ox: number, oy: number

  if (canvasWidth && canvasHeight) {
    w = canvasWidth; h = canvasHeight; ox = 0; oy = 0
  } else {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const el of visible) {
      if (el.type === 'line') {
        const x2 = el.x + el.width, y2 = el.y + el.height
        minX = Math.min(minX, el.x, x2); minY = Math.min(minY, el.y, y2)
        maxX = Math.max(maxX, el.x, x2); maxY = Math.max(maxY, el.y, y2)
      } else if (el.type === 'text') {
        const textH = wrapText(el.content, el.width, el.fontSize).length * el.fontSize * 1.3
        minX = Math.min(minX, el.x); minY = Math.min(minY, el.y)
        maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + Math.max(el.height, textH))
      } else {
        minX = Math.min(minX, el.x); minY = Math.min(minY, el.y)
        maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + el.height)
      }
    }
    w = maxX - minX + PAD * 2; h = maxY - minY + PAD * 2
    ox = minX - PAD; oy = minY - PAD
  }

  const defs: string[] = []
  const body: string[] = []

  if (canvasBg && canvasBg !== 'transparent') {
    body.push(`  <rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="${canvasBg}"/>`)
  }

  for (const el of visible) {
    const op = el.opacity !== 1 ? ` opacity="${el.opacity}"` : ''
    if (el.type === 'rect') {
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      const rx = el.cornerRadius > 0 ? ` rx="${el.cornerRadius}" ry="${el.cornerRadius}"` : ''
      let fill = el.fill
      if (el.gradientFrom && el.gradientTo) {
        const gradId = `grad-${el.id}`
        const gc = svgGradientCoords(el.gradientAngle ?? 90)
        defs.push(`  <linearGradient id="${gradId}" x1="${gc.x1}" y1="${gc.y1}" x2="${gc.x2}" y2="${gc.y2}"><stop offset="0%" stop-color="${el.gradientFrom}"/><stop offset="100%" stop-color="${el.gradientTo}"/></linearGradient>`)
        fill = `url(#${gradId})`
      }
      body.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="${fill}"${st}${op}/>`)
    } else if (el.type === 'circle') {
      const cx = el.x + el.width / 2; const cy = el.y + el.height / 2
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      let fill = el.fill
      if (el.gradientFrom && el.gradientTo) {
        const gradId = `grad-${el.id}`
        const gc = svgGradientCoords(el.gradientAngle ?? 90)
        defs.push(`  <linearGradient id="${gradId}" x1="${gc.x1}" y1="${gc.y1}" x2="${gc.x2}" y2="${gc.y2}"><stop offset="0%" stop-color="${el.gradientFrom}"/><stop offset="100%" stop-color="${el.gradientTo}"/></linearGradient>`)
        fill = `url(#${gradId})`
      }
      body.push(`  <ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}"${st}${op}/>`)
    } else if (el.type === 'text') {
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'
      const tx = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x
      const lines = wrapText(el.content, el.width, el.fontSize)
      const lineHeight = el.fontSize * 1.3
      if (el.background) {
        const pad = el.bgPadding ?? 4
        const bgRx = el.bgRadius ?? 4
        const bgH = Math.max(el.height, lines.length * lineHeight)
        body.push(`  <rect x="${el.x - pad}" y="${el.y - pad}" width="${el.width + pad * 2}" height="${bgH + pad * 2}" rx="${bgRx}" ry="${bgRx}" fill="${el.background}"${op}/>`)
      }
      const tspans = lines.map((line, i) => {
        const escaped = (line || ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `    <tspan x="${tx}" y="${el.y + el.fontSize + i * lineHeight}">${escaped}</tspan>`
      }).join('\n')
      body.push(`  <text font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" fill="${el.fill}" text-anchor="${anchor}"${op}>\n${tspans}\n  </text>`)
    } else if (el.type === 'line') {
      const x2 = el.x + el.width, y2 = el.y + el.height
      const da = el.strokeDash === 'dashed' ? ` stroke-dasharray="${el.strokeWidth * 4} ${el.strokeWidth * 2}"`
        : el.strokeDash === 'dotted' ? ` stroke-dasharray="${el.strokeWidth} ${el.strokeWidth * 2}"` : ''
      const mid = `arrow-${el.id}`
      if (el.arrowEnd || el.arrowStart) {
        defs.push(`  <marker id="${mid}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${el.stroke}"/></marker>`)
      }
      const me = el.arrowEnd ? ` marker-end="url(#${mid})"` : ''
      const ms = el.arrowStart ? ` marker-start="url(#${mid})"` : ''
      body.push(`  <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-linecap="round"${da}${me}${ms}${op}/>`)
    } else if (el.type === 'image' && el.src) {
      body.push(`  <image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid meet"${op}/>`)
    }
  }

  const defsBlock = defs.length ? `  <defs>\n${defs.join('\n')}\n  </defs>` : ''
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${ox} ${oy} ${w} ${h}">`,
    ...(defsBlock ? [defsBlock] : []),
    ...body,
    '</svg>',
  ]
  return { svg: parts.join('\n'), w, h, ox, oy }
}

function download(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
}

function useExportSVG() {
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)
  return () => {
    const result = buildSvgString(elements, canvasBg, canvasWidth, canvasHeight)
    if (!result) return
    const blob = new Blob([result.svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    download(url, 'readmekit-export.svg')
    URL.revokeObjectURL(url)
  }
}

function useExportPNG() {
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)
  return (scale = 2) => {
    const result = buildSvgString(elements, canvasBg, canvasWidth, canvasHeight)
    if (!result) return
    const { svg, w, h } = result
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return
        const pngUrl = URL.createObjectURL(pngBlob)
        download(pngUrl, 'readmekit-export.png')
        URL.revokeObjectURL(pngUrl)
      }, 'image/png')
    }
    img.src = url
  }
}

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

// Export dropdown
function ExportMenu({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const exportSVG = useExportSVG()
  const exportPNG = useExportPNG()
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const handleCopySVG = async () => {
    const result = buildSvgString(elements, canvasBg, canvasWidth, canvasHeight)
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.svg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: download instead
      const blob = new Blob([result.svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      download(url, 'readmekit-export.svg')
      URL.revokeObjectURL(url)
    }
    setOpen(false)
  }

  const handleCopyMarkdown = async () => {
    const result = buildSvgString(elements, canvasBg, canvasWidth, canvasHeight)
    if (!result) return
    const md = `![Banner](./readmekit-export.svg)`
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors',
          disabled
            ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
            : open
              ? 'bg-[#818cf8] text-white'
              : 'bg-[#6366f1] text-white hover:bg-[#818cf8]',
        )}
      >
        {copied ? <Check size={14} /> : <Download size={14} />}
        Export
        <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-48 rounded-xl overflow-hidden z-50"
          style={{
            background: '#1c1c20',
            border: '1px solid #3f3f46',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
            onClick={() => { exportSVG(); setOpen(false) }}
          >
            <FileCode size={15} className="text-[#818cf8]" />
            <span>Télécharger SVG</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
            onClick={handleCopySVG}
          >
            <Clipboard size={15} className="text-[#a78bfa]" />
            <span>Copier SVG</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
            onClick={handleCopyMarkdown}
          >
            <FileText size={15} className="text-[#fb923c]" />
            <span>Copier Markdown</span>
          </button>
          <div className="h-px bg-[#2e2e33] mx-3 my-1" />
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
            onClick={() => { exportPNG(2); setOpen(false) }}
          >
            <Image size={15} className="text-[#34d399]" />
            <span>PNG ×2 (Retina)</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
            onClick={() => { exportPNG(1); setOpen(false) }}
          >
            <Image size={15} className="text-[#71717a]" />
            <span>PNG ×1</span>
          </button>
        </div>
      )}
    </div>
  )
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

      {/* Export dropdown */}
      <ExportMenu disabled={!hasVisible} />

      <div className="flex-1" />
      <span className="text-sm font-semibold text-[#52525b] tracking-wide select-none">ReadMeKit</span>
    </div>
  )
}
