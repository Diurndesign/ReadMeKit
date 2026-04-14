/**
 * Dialog d'export SVG / PNG / PDF.
 *
 * Architecture :
 *  - useExportProcessor  → toute la logique async (build + embed + sanitize)
 *  - ExportPreview       → aperçu SVG + toggle clair/sombre
 *  - MarkdownSnippet     → snippet Markdown copiable
 *  - ExportOptions       → cases à cocher (sanitize, fonts, rasterize, dark)
 *  - DownloadButtons     → boutons de téléchargement
 */
import { useState } from 'react'
import jsPDF from 'jspdf'
import {
  X, Copy, Check, Download, AlertTriangle, Loader2,
  FileCode, Image as ImageIcon, FileText, Sun, Moon,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '@/utils/cn'
import { buildSvgString } from '../utils/buildSvgString'
import { sanitizeForGitHub } from '@/utils/githubSanitizer'
import { embedFontsInSvg } from '@/utils/fontEmbedder'
import { useExportProcessor, type ExportOpts } from '../hooks/useExportProcessor'

// ─── Download helpers ─────────────────────────────────────────────────────────

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
}

function blobUrl(content: string, type: string) {
  return URL.createObjectURL(new Blob([content], { type }))
}

async function svgToPngBlob(svgString: string, w: number, h: number, scale = 2): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = blobUrl(svgString, 'image/svg+xml;charset=utf-8')
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w * scale; canvas.height = h * scale
      const ctx = canvas.getContext('2d')!
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(resolve, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExportPreview({
  processedSvg,
  isProcessing,
  previewBg,
  setPreviewBg,
}: {
  processedSvg: string
  isProcessing: boolean
  previewBg: 'light' | 'dark'
  setPreviewBg: (bg: 'light' | 'dark') => void
}) {
  const dataUrl = processedSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(processedSvg)}`
    : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">Aperçu</span>
        <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5">
          {(['light', 'dark'] as const).map((bg) => (
            <button
              key={bg}
              onClick={() => setPreviewBg(bg)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors',
                previewBg === bg ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
              )}
            >
              {bg === 'light' ? <Sun size={11} /> : <Moon size={11} />}
              {bg === 'light' ? 'Clair' : 'Sombre'}
            </button>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl border border-[#27272a] flex items-center justify-center overflow-hidden"
        style={{ minHeight: 140, background: previewBg === 'dark' ? '#0d1117' : '#f6f8fa' }}
      >
        {isProcessing ? (
          <Loader2 size={22} className="text-[#52525b] animate-spin" />
        ) : dataUrl ? (
          <img src={dataUrl} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }} />
        ) : (
          <p className="text-[12px] text-[#52525b]">Aucun élément visible</p>
        )}
      </div>
    </div>
  )
}

type SnippetTab = 'simple' | 'picture'

function MarkdownSnippet({ darkMode }: { darkMode: boolean }) {
  const [tab, setTab] = useState<SnippetTab>('simple')
  const [copied, setCopied] = useState(false)

  const simple = `![Banner](./readmekit-export.svg)`
  const picture =
    `<picture>\n` +
    `  <source media="(prefers-color-scheme: dark)" srcset="./readmekit-export-dark.svg">\n` +
    `  <img src="./readmekit-export-light.svg" alt="Banner">\n` +
    `</picture>`

  const active = tab === 'picture' ? picture : simple

  const copy = async () => {
    try { await navigator.clipboard.writeText(active) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">Snippet Markdown</span>
        {darkMode && (
          <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5">
            {(['simple', 'picture'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-2 py-1 rounded-md text-[11px] transition-colors',
                  tab === t ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                )}
              >
                {t === 'simple' ? 'Fichier unique' : '<picture>'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <pre className="w-full bg-[#0f0f11] border border-[#27272a] rounded-lg px-3 py-2.5 text-[11px] text-[#a1a1aa] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          {active}
        </pre>
        <button
          onClick={copy}
          className={cn(
            'absolute top-2 right-2 flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium transition-colors',
            copied ? 'bg-[#22c55e]/20 text-[#4ade80]' : 'bg-[#27272a] text-[#a1a1aa] hover:text-white',
          )}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
      {tab === 'picture' && (
        <p className="text-[10px] text-[#52525b] mt-1.5 leading-relaxed">
          Deux fichiers séparés — utilisez le bouton <strong className="text-[#71717a]">Light + Dark</strong> ci-dessous.
        </p>
      )}
    </div>
  )
}

function Toggle({
  checked, onChange, label, description,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox" checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-[#6366f1]"
      />
      <div>
        <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">{label}</span>
        <p className="text-[10px] text-[#52525b] leading-snug mt-0.5">{description}</p>
      </div>
    </label>
  )
}

function ExportOptions({
  opts,
  onChange,
}: {
  opts: ExportOpts
  onChange: <K extends keyof ExportOpts>(key: K, val: ExportOpts[K]) => void
}) {
  return (
    <section>
      <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">Options</p>
      <div className="flex flex-col gap-2.5">
        <Toggle checked={opts.sanitize} onChange={(v) => onChange('sanitize', v)}
          label="Nettoyer pour GitHub"
          description="Supprime les attributs et éléments non supportés"
        />
        <Toggle checked={opts.embedFonts} onChange={(v) => onChange('embedFonts', v)}
          label="Intégrer les polices"
          description="Base64 via Google Fonts"
        />
        <Toggle checked={opts.rasterizeText} onChange={(v) => onChange('rasterizeText', v)}
          label="Textes → images"
          description="Indépendant de la police, légèrement moins net"
        />
        <Toggle checked={opts.darkMode} onChange={(v) => onChange('darkMode', v)}
          label="Mode sombre"
          description="prefers-color-scheme ou export deux fichiers"
        />
        {opts.darkMode && (
          <div className="ml-6 flex items-center gap-2">
            <label className="text-[11px] text-[#71717a]">Fond sombre</label>
            <input
              type="color" value={opts.darkBg}
              onChange={(e) => onChange('darkBg', e.target.value)}
              className="w-8 h-6 rounded cursor-pointer border border-[#3f3f46] bg-transparent"
            />
            <span className="text-[10px] font-mono text-[#52525b]">{opts.darkBg}</span>
          </div>
        )}
      </div>
    </section>
  )
}

function DownloadButtons({
  processedSvg,
  svgDims,
  isProcessing,
  opts,
  elements,
  canvasBg,
  canvasWidth,
  canvasHeight,
}: {
  processedSvg: string
  svgDims: { w: number; h: number } | null
  isProcessing: boolean
  opts: ExportOpts
  elements: ReturnType<typeof useEditorStore.getState>['elements']
  canvasBg: string
  canvasWidth: number | null
  canvasHeight: number | null
}) {
  const disabled = !processedSvg || isProcessing

  const dlSvg = () => {
    if (!processedSvg) return
    const url = blobUrl(processedSvg, 'image/svg+xml')
    triggerDownload(url, 'readmekit-export.svg')
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const dlPng = async (scale = 2) => {
    if (!processedSvg || !svgDims) return
    const blob = await svgToPngBlob(processedSvg, svgDims.w, svgDims.h, scale)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    triggerDownload(url, 'readmekit-export.png')
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const dlPdf = async () => {
    if (!processedSvg || !svgDims) return
    const { w, h } = svgDims
    const blob = await svgToPngBlob(processedSvg, w, h, 2)
    if (!blob) return
    const reader = new FileReader()
    reader.onload = () => {
      const pdf = new jsPDF({ orientation: w >= h ? 'l' : 'p', unit: 'px', format: [w, h], hotfixes: ['px_scaling'] })
      pdf.addImage(reader.result as string, 'PNG', 0, 0, w, h)
      pdf.save('readmekit-export.pdf')
    }
    reader.readAsDataURL(blob)
  }

  /**
   * Export double fichier light/dark — utilisé avec le snippet <picture>.
   * Construit deux SVG distincts (fond clair vs fond sombre) sans @media.
   */
  const dlLightDark = async () => {
    async function buildVariant(bg: string): Promise<string> {
      const r = buildSvgString(elements, bg, canvasWidth, canvasHeight, { rasterizeText: opts.rasterizeText })
      if (!r) return ''
      let svg = r.svg
      if (opts.embedFonts) svg = (await embedFontsInSvg(svg)).svg
      if (opts.sanitize) svg = sanitizeForGitHub(svg).svg
      return svg
    }
    const lightBg = canvasBg && canvasBg !== 'transparent' ? canvasBg : '#ffffff'
    const [light, dark] = await Promise.all([buildVariant(lightBg), buildVariant(opts.darkBg)])
    if (light) { const u = blobUrl(light, 'image/svg+xml'); triggerDownload(u, 'readmekit-export-light.svg'); setTimeout(() => URL.revokeObjectURL(u), 500) }
    if (dark) { setTimeout(() => { const u = blobUrl(dark, 'image/svg+xml'); triggerDownload(u, 'readmekit-export-dark.svg'); setTimeout(() => URL.revokeObjectURL(u), 500) }, 250) }
  }

  return (
    <section>
      <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">Télécharger</p>
      <div className="flex flex-col gap-2">
        <button onClick={dlSvg} disabled={disabled}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#6366f1] text-white hover:bg-[#818cf8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FileCode size={14} /> SVG
        </button>
        {opts.darkMode && (
          <button onClick={dlLightDark} disabled={disabled}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sun size={13} className="text-[#fbbf24]" />
            <Moon size={12} className="text-[#818cf8]" />
            <span>Light + Dark</span>
          </button>
        )}
        <button onClick={() => dlPng(2)} disabled={disabled}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ImageIcon size={14} className="text-[#34d399]" /> PNG ×2 (Retina)
        </button>
        <button onClick={() => dlPng(1)} disabled={disabled}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ImageIcon size={14} className="text-[#71717a]" /> PNG ×1
        </button>
        <button onClick={dlPdf} disabled={disabled}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FileText size={14} className="text-[#f87171]" /> PDF
        </button>
      </div>
    </section>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function ExportDialog() {
  const showExportDialog = useUIStore((s) => s.showExportDialog)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)

  const [opts, setOpts] = useState<ExportOpts>({
    sanitize: true, embedFonts: false, rasterizeText: false,
    darkMode: false, darkBg: '#0d1117',
  })
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')

  const { processedSvg, svgDims, isProcessing, warnings, fontStatus } = useExportProcessor(
    opts, elements, canvasBg, canvasWidth, canvasHeight, showExportDialog,
  )

  const set = <K extends keyof ExportOpts>(key: K, val: ExportOpts[K]) =>
    setOpts((prev) => ({ ...prev, [key]: val }))

  if (!showExportDialog) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExportDialog(false)} />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-[820px] max-h-[92vh] bg-[#18181b] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2e2e33] shrink-0">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Download size={15} className="text-[#818cf8]" />
            Exporter
          </div>
          <button
            onClick={() => setShowExportDialog(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: preview + snippet + warnings */}
          <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto border-r border-[#2e2e33]">
            <ExportPreview
              processedSvg={processedSvg}
              isProcessing={isProcessing}
              previewBg={previewBg}
              setPreviewBg={setPreviewBg}
            />
            <MarkdownSnippet darkMode={opts.darkMode} />

            {warnings.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#fbbf24] text-[11px] font-semibold mb-0.5">
                  <AlertTriangle size={12} /> Avertissements
                </div>
                {warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-[#fcd34d] leading-snug">{w}</p>
                ))}
              </div>
            )}

            {fontStatus && fontStatus.embedded.length > 0 && (
              <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-lg px-3 py-2">
                <p className="text-[11px] text-[#4ade80]">Polices intégrées : {fontStatus.embedded.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Right: options + downloads */}
          <div className="w-52 shrink-0 flex flex-col gap-5 p-5 overflow-y-auto">
            <ExportOptions opts={opts} onChange={set} />
            <div className="h-px bg-[#2e2e33]" />
            <DownloadButtons
              processedSvg={processedSvg}
              svgDims={svgDims}
              isProcessing={isProcessing}
              opts={opts}
              elements={elements}
              canvasBg={canvasBg}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
