/**
 * Hook qui orchestre la construction du SVG exportable.
 *
 * Lancé chaque fois que les options ou le contenu du canvas changent.
 * Gère l'ordre asynchrone : buildSvgString (sync) → embedFontsInSvg (async) → sanitize (sync).
 * Retourne le SVG final, les dimensions, les warnings et le statut des polices.
 */
import { useState, useEffect } from 'react'
import type { EditorElement } from '../types/elements'
import { buildSvgString } from '../utils/buildSvgString'
import { sanitizeForGitHub } from '@/utils/githubSanitizer'
import { embedFontsInSvg } from '@/utils/fontEmbedder'

export interface ExportOpts {
  sanitize: boolean
  embedFonts: boolean
  rasterizeText: boolean
  darkMode: boolean
  darkBg: string
}

export interface ExportResult {
  processedSvg: string
  svgDims: { w: number; h: number } | null
  isProcessing: boolean
  warnings: string[]
  fontStatus: { embedded: string[]; failed: string[] } | null
}

export function useExportProcessor(
  opts: ExportOpts,
  elements: EditorElement[],
  canvasBg: string,
  canvasWidth: number | null,
  canvasHeight: number | null,
  enabled: boolean,   // false quand le dialog est fermé → pas de traitement inutile
): ExportResult {
  const [processedSvg, setProcessedSvg] = useState('')
  const [svgDims, setSvgDims] = useState<{ w: number; h: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fontStatus, setFontStatus] = useState<{ embedded: string[]; failed: string[] } | null>(null)

  useEffect(() => {
    if (!enabled) return
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

      // Intégration des polices (asynchrone — appel Google Fonts)
      if (opts.embedFonts) {
        try {
          const { svg: embedded, embedded: embeddedFonts, failed } = await embedFontsInSvg(svg)
          if (!cancelled) {
            svg = embedded
            setFontStatus({ embedded: embeddedFonts, failed })
            if (failed.length > 0) {
              allWarnings.push(`Polices non intégrées (introuvables sur Google Fonts) : ${failed.join(', ')}`)
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

      // Nettoyage GitHub (synchrone)
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
  }, [opts, elements, canvasBg, canvasWidth, canvasHeight, enabled])

  return { processedSvg, svgDims, isProcessing, warnings, fontStatus }
}
