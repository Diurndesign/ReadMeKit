/**
 * Aperçu du README généré :
 *  - La bannière SVG exportée (si disponible) centrée en haut
 *  - Le texte Markdown brut dans une zone de code défilable
 */
interface Props {
  /** SVG déjà traité provenant de useExportProcessor — peut être vide pendant le calcul */
  processedSvg: string
  /** Contenu Markdown complet issu de buildReadmeString */
  markdown: string
}

export function ReadmePreview({ processedSvg, markdown }: Props) {
  const dataUrl = processedSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(processedSvg)}`
    : ''

  return (
    <div className="flex flex-col gap-4">
      {/* Bannière SVG — uniquement si un SVG est disponible */}
      {dataUrl && (
        <div className="rounded-xl border border-[#27272a] bg-[#f6f8fa] flex items-center justify-center overflow-hidden p-4">
          <img
            src={dataUrl}
            alt="Bannière"
            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Markdown brut */}
      <div>
        <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest block mb-2">
          Aperçu README.md
        </span>
        <pre className="w-full bg-[#0f0f11] border border-[#27272a] rounded-lg px-3 py-2.5 text-[11px] text-[#a1a1aa] font-mono overflow-auto whitespace-pre leading-relaxed max-h-[340px]">
          {markdown || '— Aucun contenu —'}
        </pre>
      </div>
    </div>
  )
}
