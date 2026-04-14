/**
 * Dialog d'export — shell avec deux onglets :
 *  - "Bannière SVG"   : ExportSvgTab  (aperçu, options, téléchargement)
 *  - "README complet" : ExportReadmeTab (nom, sections, liens, copie/download)
 *
 * Chaque onglet est auto-contenu ; ce composant se limite au chrome (header,
 * backdrop, switcher d'onglets) et au partage du SVG traité entre onglets.
 */
import { useState } from 'react'
import { X, Download, FileCode, FileText } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { cn } from '@/utils/cn'
import { ExportSvgTab } from './export/ExportSvgTab'
import { ExportReadmeTab } from './export/ExportReadmeTab'

type Tab = 'svg' | 'readme'

export function ExportDialog() {
  const showExportDialog = useUIStore((s) => s.showExportDialog)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)

  const [activeTab, setActiveTab] = useState<Tab>('svg')

  // Le SVG traité est produit par ExportSvgTab ; on le remonte ici pour le
  // partager avec ExportReadmeTab (aperçu bannière dans le README).
  const [processedSvg, setProcessedSvg] = useState('')

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Download size={15} className="text-[#818cf8]" />
              Exporter
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-[#27272a] rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('svg')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors',
                  activeTab === 'svg' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                )}
              >
                <FileCode size={12} /> Bannière SVG
              </button>
              <button
                onClick={() => setActiveTab('readme')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-colors',
                  activeTab === 'readme' ? 'bg-[#3f3f46] text-white' : 'text-[#71717a] hover:text-white',
                )}
              >
                <FileText size={12} /> README complet
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowExportDialog(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — les deux onglets sont toujours montés ; seul l'onglet actif est visible */}
        <div className="flex flex-1 overflow-hidden">
          {/* SVG tab — toujours monté pour que useExportProcessor tourne en arrière-plan */}
          <div className={cn('contents', activeTab !== 'svg' && 'hidden')}>
            <ExportSvgTab
              enabled={showExportDialog}
              onProcessedSvg={setProcessedSvg}
            />
          </div>

          {/* README tab */}
          <div className={cn('contents', activeTab !== 'readme' && 'hidden')}>
            <ExportReadmeTab processedSvg={processedSvg} />
          </div>
        </div>
      </div>
    </div>
  )
}
