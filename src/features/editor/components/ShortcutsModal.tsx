import { X } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

const SHORTCUTS = [
  {
    category: 'Outils',
    items: [
      { key: 'V', action: 'Sélection' },
      { key: 'R', action: 'Rectangle' },
      { key: 'T', action: 'Texte' },
      { key: 'O', action: 'Cercle / Ellipse' },
      { key: 'L', action: 'Ligne / Flèche' },
      { key: 'I', action: 'Image URL' },
    ],
  },
  {
    category: 'Édition',
    items: [
      { key: 'Ctrl+Z', action: 'Annuler' },
      { key: 'Ctrl+Shift+Z', action: 'Rétablir' },
      { key: 'Ctrl+D', action: 'Dupliquer' },
      { key: 'Ctrl+C', action: 'Copier' },
      { key: 'Ctrl+V', action: 'Coller' },
      { key: 'Ctrl+A', action: 'Tout sélectionner' },
      { key: 'Suppr / ←', action: 'Supprimer' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { key: 'Ctrl+0', action: 'Réinitialiser la vue' },
      { key: '↑ ↓ ← →', action: 'Déplacer de 1px' },
      { key: 'Shift+flèches', action: 'Déplacer de 8px' },
      { key: 'Échap', action: 'Désélectionner' },
      { key: '?', action: 'Afficher ce panneau' },
    ],
  },
  {
    category: 'Redimensionner',
    items: [
      { key: 'Shift (poignée)', action: 'Proportions fixes' },
    ],
  },
]

export function ShortcutsModal() {
  const showShortcuts = useUIStore((s) => s.showShortcuts)
  const setShowShortcuts = useUIStore((s) => s.setShowShortcuts)

  if (!showShortcuts) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={() => setShowShortcuts(false)}
    >
      <div
        className="w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl"
        style={{
          background: '#1c1c20',
          border: '1px solid #3f3f46',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e33]">
          <div>
            <h2 className="text-base font-semibold text-[#e4e4e7]">Raccourcis clavier</h2>
            <p className="text-xs text-[#52525b] mt-0.5">Accès rapide aux fonctions principales</p>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-6">
          {SHORTCUTS.map(({ category, items }) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
                {category}
              </p>
              <div className="space-y-2">
                {items.map(({ key, action }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#a1a1aa] leading-none">{action}</span>
                    <kbd className="shrink-0 text-[10px] font-mono bg-[#27272a] border border-[#3f3f46] text-[#e4e4e7] px-2 py-0.5 rounded-md whitespace-nowrap leading-none">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between border-t border-[#2e2e33] pt-4">
          <p className="text-[11px] text-[#3f3f46]">
            Appuie sur <kbd className="font-mono bg-[#27272a] border border-[#3f3f46] text-[#71717a] px-1.5 py-0.5 rounded text-[10px]">Échap</kbd> pour fermer
          </p>
          <button
            onClick={() => setShowShortcuts(false)}
            className="h-7 px-3 text-xs rounded-lg bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
