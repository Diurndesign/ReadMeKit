/**
 * Onglet "README complet" du dialog d'export.
 *
 * Permet de :
 *  - Nommer le projet (→ kebab-case pour npm install / import)
 *  - Activer / désactiver chaque section Markdown (ReadmeSectionPicker)
 *  - Ajouter des liens HTML cliquables (label + url)
 *  - Prévisualiser le README généré avec la bannière SVG (ReadmePreview)
 *  - Copier ou télécharger le README.md
 *
 * L'état (sections, nom, liens) est persisté dans uiStore pour survivre
 * aux ouvertures/fermetures du dialog.
 */
import { useState } from 'react'
import { Plus, Trash2, Copy, Check, Download } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { buildReadmeString } from '../../utils/buildReadmeString'
import { ReadmeSectionPicker } from './ReadmeSectionPicker'
import { ReadmePreview } from './ReadmePreview'

interface Props {
  /** SVG déjà traité (provient de ExportSvgTab via le parent) pour la prévisualisation */
  processedSvg: string
}

export function ExportReadmeTab({ processedSvg }: Props) {
  const readmeSections = useUIStore((s) => s.readmeSections)
  const readmeProjectName = useUIStore((s) => s.readmeProjectName)
  const readmeLinks = useUIStore((s) => s.readmeLinks)
  const setReadmeSections = useUIStore((s) => s.setReadmeSections)
  const setReadmeProjectName = useUIStore((s) => s.setReadmeProjectName)
  const setReadmeLinks = useUIStore((s) => s.setReadmeLinks)

  const [copied, setCopied] = useState(false)

  // Nom du fichier bannière déduit de la présence d'un SVG exporté
  const bannerFile = './readmekit-banner.svg'

  const markdown = buildReadmeString({
    projectName: readmeProjectName,
    bannerFile,
    sections: readmeSections,
    links: readmeLinks,
  })

  // ── Liens ──────────────────────────────────────────────────────────────────

  const addLink = () =>
    setReadmeLinks([...readmeLinks, { label: '', url: '' }])

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const next = readmeLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    setReadmeLinks(next)
  }

  const removeLink = (index: number) =>
    setReadmeLinks(readmeLinks.filter((_, i) => i !== index))

  // ── Copie / téléchargement ─────────────────────────────────────────────────

  const copy = async () => {
    try { await navigator.clipboard.writeText(markdown) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'README.md'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Left: preview */}
      <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto border-r border-[#2e2e33]">
        <ReadmePreview processedSvg={processedSvg} markdown={markdown} />
      </div>

      {/* Right: controls */}
      <div className="w-64 shrink-0 flex flex-col gap-5 p-5 overflow-y-auto">

        {/* Nom du projet */}
        <section>
          <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-2">
            Nom du projet
          </p>
          <input
            type="text"
            placeholder="My Awesome Project"
            value={readmeProjectName}
            onChange={(e) => setReadmeProjectName(e.target.value)}
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-[12px] text-[#d4d4d8] placeholder-[#52525b] focus:outline-none focus:border-[#6366f1] transition-colors"
          />
          {readmeProjectName && (
            <p className="text-[10px] text-[#52525b] mt-1 font-mono">
              → {readmeProjectName
                .toLowerCase().trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '') || 'mon-projet'}
            </p>
          )}
        </section>

        {/* Section picker */}
        <ReadmeSectionPicker sections={readmeSections} onChange={setReadmeSections} />

        {/* Liens */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">
              Liens
            </p>
            <button
              onClick={addLink}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <Plus size={11} /> Ajouter
            </button>
          </div>

          {readmeLinks.length === 0 && (
            <p className="text-[11px] text-[#52525b] italic">Aucun lien — cliquez sur Ajouter.</p>
          )}

          <div className="flex flex-col gap-2">
            {readmeLinks.map((link, i) => (
              <div key={i} className="flex flex-col gap-1 bg-[#1c1c1f] rounded-lg p-2 border border-[#27272a]">
                <input
                  type="text"
                  placeholder="Label (ex: Site)"
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded px-2 py-1 text-[11px] text-[#d4d4d8] placeholder-[#52525b] focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    className="flex-1 bg-[#27272a] border border-[#3f3f46] rounded px-2 py-1 text-[11px] text-[#d4d4d8] placeholder-[#52525b] focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                  <button
                    onClick={() => removeLink(i)}
                    className="flex items-center justify-center w-6 h-6 rounded text-[#71717a] hover:text-[#f87171] hover:bg-[#27272a] transition-colors shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Séparateur */}
        <div className="h-px bg-[#2e2e33]" />

        {/* Actions */}
        <section>
          <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
            Exporter
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={download}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#6366f1] text-white hover:bg-[#818cf8] transition-colors"
            >
              <Download size={14} /> README.md
            </button>
            <button
              onClick={copy}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                copied
                  ? 'bg-[#22c55e]/20 text-[#4ade80]'
                  : 'bg-[#27272a] text-[#d4d4d8] hover:bg-[#3f3f46]'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
