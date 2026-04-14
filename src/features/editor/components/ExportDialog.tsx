import { useState, useEffect, useRef } from 'react'
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportOpts {
  sanitize: boolean
  embedFonts: boolean
  rasterizeText: boolean
  darkMode: boolean
  darkBg: string
}

type SnippetTab = 'simple' | 'picture'

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ExportDialog() {
  const showExportDialog = useUIStore((s) => s.showExportDialog)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)
  const elements = useEditorStore((s) => s.elements)
  const canvasBg = useUIStore((s) => s.canvasBg)
  const canvasWidth = useUIStore((s) => s.canvasWidth)
  const canvasHeight = useUIStore((s) => s.canvasHeight)

  const [opts, setOpts] = useState<ExportOpts>({
    sanitize: true,
    embedFonts: false,
    rasterizeText: false,
    darkMode: false,
    darkBg: '#0d1117',
  })

  const [processedSvg, setProcessedSvg] = useState('')
  const [svgDims, setSvgDims] = useState<{ w: number; h: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fontStatus, setFontStatus] = useState<{ embedded: string[]; failed: string[] } | null>(null)
  const [snippetTab, setSnippetTab] = useState<SnippetTab>('simple')
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')
  const [copied, setCopied] = useState(false)

  // ── Rebuild processed SVG whenever opts / canvas state changes ──────────────
  useEffect(() => {
    if (!showExportDialog) return
    let cancelled = false

    async function process() {
      setIsProcessing(true)
      setWarnings([])
      setFontStatus(null)

      const result = buildSvgString(elements, canvasBg, canvasWidth, canvasHeight, {
        darkBg: opts.darkMode ? opts.darkBg : undefined,
        rasterizeText: opts.rasterizeText,
      })

      if (!result || cancelled) { setIsProcessing(false); return }

      let { svg } = result
      setSvgDims({ w: result.w, h: result.h })
      const allWarnings: string[] = []

      // Font embedding (async)
      if (opts.embedFonts) {
        try {
          const { svg: embedded, embedded: embeddedFonts, failed } = await embedFontsInSvg(svg)
          if (!cancelled) {
            svg = embedded
            setFontStatus({ embedded: embeddedFonts, failed })
            if (failed.length > 0) {
              allWarnings.push(
                `Polices non intégrées (introuvables sur Google Fonts) : ${failed.join(', ')}`,
              )
            }
            if (embeddedFonts.length === 0 && failed.length === 0) {
              allWarnings.push('Aucune police personnalisée détectée — toutes les polices sont système.')
            }
          }
        } catch {
          if (!cancelled) allWarnings.push('Erreur lors du chargement des polices.')
        }
      }

      if (cancelled) { setIsProcessing(false); return }

      // Sanitize (sync)
      if (opts.sanitize) {
        const { svg: clean, warnings: w } = sanitizeForGitHub(svg)
        svg = clean
        allWarnings.push(...w)
      }

      if (!cancelled) {
        setProcessedSvg(svg)
        setWarnings(allWarnings)
        setIsProcessing(false)
      }
    }

    process()
    return () => { cancelled = true }
  }, [opts, elements, canvasBg, canvasWidth, canvasHeight, showExportDialog])

  // ── Markdown snippets ───────────────────────────────────────────────────────
  const simpleSnippet = `![Banner](./readmekit-export.svg)`
  const pictureSnippet =
    `<picture>\n` +
    `  <source media="(prefers-color-scheme: dark)" srcset="./readmekit-export-dark.svg">\n` +
    `  <img src="./readmekit-export-light.svg" alt="Banner">\n` +
    `</picture>`

  const activeSnippet = snippetTab === 'picture' ? pictureSnippet : simpleSnippet

  // ── Copy snippet ────────────────────────────────────────────────────────────
  const handleCopySnippet = async () => {
    try { await navigator.clipboard.writeText(activeSnippet) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Downloads ───────────────────────────────────────────────────────────────
  const handleDownloadSvg = () => {
    if (!processedSvg) return
    const url = blobUrl(processedSvg, 'image/svg+xml')
    triggerDownload(url, 'readmekit-export.svg')
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const handleDownloadPng = async (scale = 2) => {
    if (!processedSvg || !svgDims) return
    const pngBlob = await svgToPngBlob(processedSvg, svgDims.w, svgDims.h, scale)
    if (!pngBlob) return
    const url = URL.createObjectURL(pngBlob)
    triggerDownload(url, 'readmekit-export.png')
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const handleDownloadPdf = async () => {
    if (!processedSvg || !svgDims) return
    const { w, h } = svgDims
    const pngBlob = await svgToPngBlob(processedSvg, w, h, 2)
    if (!pngBlob) return
    const reader = new FileReader()
    reader.onload = () => {
      const orientation = w >= h ? 'l' : 'p'
      const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h], hotfixes: ['px_scaling'] })
      pdf.addImage(reader.result as string, 'PNG', 0, 0, w, h)
      pdf.save('readmekit-export.pdf')
    }
    reader.readAsDataURL(pngBlob)
  }

  /**
   * Two-file dark-mode export: light SVG + dark SVG (swapped background),
   * then show <picture> markdown snippet.
   */
  const handleDownloadLightDark = async () => {
    async function buildVariant(bg: string): Promise<string> {
      const r = buildSvgString(elements, bg, canvasWidth, canvasHeight, {
        rasterizeText: opts.rasterizeText,
      })
      if (!r) return ''
      let svg = r.svg
      if (opts.embedFonts) {
        const { svg: embedded } = await embedFontsInSvg(svg)
        svg = embedded
      }
      if (opts.sanitize) {
        const { svg: clean } = sanitizeForGitHub(svg)
        svg = clean
      }
      return svg
    }

    const lightBg = canvasBg && canvasBg !== 'transparent' ? canvasBg : '#ffffff'
    const [lightSvg, darkSvg] = await Promise.all([
      buildVariant(lightBg),
      buildVariant(opts.darkBg),
    ])

    if (lightSvg) {
      const url = blobUrl(lightSvg, 'image/svg+xml')
      triggerDownload(url, 'readmekit-export-light.svg')
      setTimeout(() => URL.revokeObjectURL(url), 500)
    }
    if (darkSvg) {
      // Small delay so browsers don't block the second download
      setTimeout(() => {
        const url = blobUrl(darkSvg, 'image/svg+xml')
        triggerDownload(url, 'readmekit-export-dark.svg')
        setTimeout(() => URL.revokeObjectURL(url), 500)
      }, 250)
    }
  }

  // ── SVG preview as data URI (safe — no inline JS execution) ─────────────────
  const previewDataUrl = processedSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(processedSvg)}`
    : ''

  if (!showExportDialog) return null

  const opt = (key: keyof ExportOpts, val: boolean | string) =>
    setOpts((prev) => ({ ...prev, [key]: val }))

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowExportDialog(false)}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-[820px] max-h-[92vh] bg-[#18181b] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
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

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: preview + snippet + warnings ── */}
          <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto border-r border-[#2e2e33]">

            {/* SVG preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">Aperçu</span>
                <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5">
                  <button
                    onClick={() => setPreviewBg('light')}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors',
                      previewBg === 'light' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                    )}
                  >
                    <Sun size={11} /> Clair
                  </button>
                  <button
                    onClick={() => setPreviewBg('dark')}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors',
                      previewBg === 'dark' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                    )}
                  >
                    <Moon size={11} /> Sombre
                  </button>
                </div>
              </div>
              <div
                className="rounded-xl border border-[#27272a] flex items-center justify-center overflow-hidden"
                style={{
                  minHeight: 140,
                  background: previewBg === 'dark' ? '#0d1117' : '#f6f8fa',
                }}
              >
                {isProcessing ? (
                  <Loader2 size={22} className="text-[#52525b] animate-spin" />
                ) : previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Aperçu"
                    style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain' }}
                  />
                ) : (
                  <p className="text-[12px] text-[#52525b]">Aucun élément visible</p>
                )}
              </div>
            </div>

            {/* Markdown snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">
                  Snippet Markdown
                </span>
                {opts.darkMode && (
                  <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5">
                    <button
                      onClick={() => setSnippetTab('simple')}
                      className={cn(
                        'px-2 py-1 rounded-md text-[11px] transition-colors',
                        snippetTab === 'simple' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                      )}
                    >
                      Fichier unique
                    </button>
                    <button
                      onClick={() => setSnippetTab('picture')}
                      className={cn(
                        'px-2 py-1 rounded-md text-[11px] transition-colors',
                        snippetTab === 'picture' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                      )}
                    >
                      {'<picture>'}
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <pre className="w-full bg-[#0f0f11] border border-[#27272a] rounded-lg px-3 py-2.5 text-[11px] text-[#a1a1aa] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {activeSnippet}
                </pre>
                <button
                  onClick={handleCopySnippet}
                  className={cn(
                    'absolute top-2 right-2 flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium transition-colors',
                    copied
                      ? 'bg-[#22c55e]/20 text-[#4ade80]'
                      : 'bg-[#27272a] text-[#a1a1aa] hover:text-white',
                  )}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              {snippetTab === 'picture' && (
                <p className="text-[10px] text-[#52525b] mt-1.5 leading-relaxed">
                  Deux fichiers séparés — utilisez le bouton <strong className="text-[#71717a]">Light + Dark</strong> ci-dessous.
                </p>
              )}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#fbbf24] text-[11px] font-semibold mb-0.5">
                  <AlertTriangle size={12} />
                  Avertissements
                </div>
                {warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-[#fcd34d] leading-snug">{w}</p>
                ))}
              </div>
            )}

            {/* Font status */}
            {fontStatus && fontStatus.embedded.length > 0 && (
              <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-lg px-3 py-2">
                <p className="text-[11px] text-[#4ade80]">
                  Polices intégrées : {fontStatus.embedded.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: options + downloads ── */}
          <div className="w-52 shrink-0 flex flex-col gap-5 p-5 overflow-y-auto">

            {/* Options */}
            <section>
              <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">Options</p>
              <div className="flex flex-col gap-2.5">

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={opts.sanitize}
                    onChange={(e) => opt('sanitize', e.target.checked)}
                    className="mt-0.5 accent-[#6366f1]"
                  />
                  <div>
                    <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">
                      Nettoyer pour GitHub
                    </span>
                    <p className="text-[10px] text-[#52525b] leading-snug mt-0.5">
                      Supprime les attributs et éléments non supportés
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={opts.embedFonts}
                    onChange={(e) => opt('embedFonts', e.target.checked)}
                    className="mt-0.5 accent-[#6366f1]"
                  />
                  <div>
                    <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">
                      Intégrer les polices
                    </span>
                    <p className="text-[10px] text-[#52525b] leading-snug mt-0.5">
                      Base64 via Google Fonts
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={opts.rasterizeText}
                    onChange={(e) => opt('rasterizeText', e.target.checked)}
                    className="mt-0.5 accent-[#6366f1]"
                  />
                  <div>
                    <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">
                      Textes → images
                    </span>
                    <p className="text-[10px] text-[#52525b] leading-snug mt-0.5">
                      Indépendant de la police, légèrement moins net
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={opts.darkMode}
                    onChange={(e) => opt('darkMode', e.target.checked)}
                    className="mt-0.5 accent-[#6366f1]"
                  />
                  <div>
                    <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">
                      Mode sombre
                    </span>
                    <p className="text-[10px] text-[#52525b] leading-snug mt-0.5">
                      prefers-color-scheme ou export deux fichiers
                    </p>
                  </div>
                </label>

                {opts.darkMode && (
                  <div className="ml-6 flex items-center gap-2">
                    <label className="text-[11px] text-[#71717a]">Fond sombre</label>
                    <input
                      type="color"
                      value={opts.darkBg}
                      onChange={(e) => opt('darkBg', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer border border-[#3f3f46] bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-[#52525b]">{opts.darkBg}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-[#2e2e33]" />

            {/* Download buttons */}
            <section>
              <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">Télécharger</p>
              <div className="flex flex-col gap-2">

                <button
                  onClick={handleDownloadSvg}
                  disabled={!processedSvg || isProcessing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#6366f1] text-white hover:bg-[#818cf8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FileCode size={14} />
                  SVG
                </button>

                {opts.darkMode && (
                  <button
                    onClick={handleDownloadLightDark}
                    disabled={!processedSvg || isProcessing}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sun size={13} className="text-[#fbbf24]" />
                    <Moon size={12} className="text-[#818cf8]" />
                    <span>Light + Dark</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadPng(2)}
                  disabled={!processedSvg || isProcessing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ImageIcon size={14} className="text-[#34d399]" />
                  PNG ×2 (Retina)
                </button>

                <button
                  onClick={() => handleDownloadPng(1)}
                  disabled={!processedSvg || isProcessing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ImageIcon size={14} className="text-[#71717a]" />
                  PNG ×1
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={!processedSvg || isProcessing}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText size={14} className="text-[#f87171]" />
                  PDF
                </button>

              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
