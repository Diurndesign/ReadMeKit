import { useState, useEffect, useRef } from 'react'
import {
  MousePointer2, Square, Type, Circle, Undo2, Redo2, Grid3X3,
  ZoomIn, ZoomOut, Maximize2, Download, LayoutTemplate, Image, FileCode, ChevronDown, Clipboard, Check,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore, type ActiveTool } from '../stores/uiStore'
import { cn } from '@/utils/cn'
import type { EditorElement } from '../types/elements'

// ─── Shared SVG builder ───────────────────────────────────────────────────────

const PAD = 20

function buildSvgString(elements: EditorElement[], canvasBg = 'transparent'): { svg: string; w: number; h: number; ox: number; oy: number } | null {
  const visible = elements.filter((e) => e.visible !== false)
  if (visible.length === 0) return null

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const el of visible) {
    minX = Math.min(minX, el.x); minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + el.height)
  }
  const w = maxX - minX + PAD * 2
  const h = maxY - minY + PAD * 2
  const ox = minX - PAD
  const oy = minY - PAD

  const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${ox} ${oy} ${w} ${h}">`]
  if (canvasBg && canvasBg !== 'transparent') {
    parts.push(`  <rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="${canvasBg}"/>`)
  }
  for (const el of visible) {
    const op = el.opacity !== 1 ? ` opacity="${el.opacity}"` : ''
    if (el.type === 'rect') {
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      const rx = el.cornerRadius > 0 ? ` rx="${el.cornerRadius}" ry="${el.cornerRadius}"` : ''
      parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="${el.fill}"${st}${op}/>`)
    } else if (el.type === 'circle') {
      const cx = el.x + el.width / 2; const cy = el.y + el.height / 2
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      parts.push(`  <ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.fill}"${st}${op}/>`)
    } else if (el.type === 'text') {
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'
      const tx = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x
      const escaped = el.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      parts.push(`  <text x="${tx}" y="${el.y + el.fontSize}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" fill="${el.fill}" text-anchor="${anchor}"${op}>${escaped}</text>`)
    }
  }
  parts.push('</svg>')
  return { svg: parts.join('\n'), w, h, ox, oy }
}

function download(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
}

function useExportSVG() {
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  return () => {
    const result = buildSvgString(elements, canvasBg)
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
  return (scale = 2) => {
    const result = buildSvgString(elements, canvasBg)
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

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const handleCopySVG = async () => {
    const result = buildSvgString(elements, canvasBg)
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
  const elements = useEditorStore((s) => s.elements)

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
