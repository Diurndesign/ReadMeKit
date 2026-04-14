import { X, Layout, Zap, Tag, BarChart2, Users, Plus } from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { TEMPLATES } from '../data/templates'

// Icon + accent color per template
const TEMPLATE_META: Record<string, { Icon: React.FC<{ size?: number; className?: string }>; accent: string; bg: string }> = {
  hero:         { Icon: Layout,    accent: '#818cf8', bg: '#1e1b4b' },
  features:     { Icon: Zap,       accent: '#34d399', bg: '#022c22' },
  badges:       { Icon: Tag,       accent: '#38bdf8', bg: '#0c1a29' },
  stats:        { Icon: BarChart2, accent: '#fbbf24', bg: '#1c1408' },
  contributors: { Icon: Users,     accent: '#f472b6', bg: '#1f0b15' },
}

export function TemplatesPanel() {
  const showTemplates = useUIStore((s) => s.showTemplates)
  const setShowTemplates = useUIStore((s) => s.setShowTemplates)
  const addElements = useEditorStore((s) => s.addElements)
  const setPanOffset = useUIStore((s) => s.setPanOffset)
  const setZoom = useUIStore((s) => s.setZoom)

  if (!showTemplates) return null

  const handleInsert = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    addElements(tpl.build())
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
    setShowTemplates(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={() => setShowTemplates(false)}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[640px] max-h-[80vh] flex flex-col"
        style={{
          background: '#1c1c20',
          border: '1px solid #3f3f46',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2e33] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">Templates</h2>
            <p className="text-xs text-[#52525b] mt-0.5">
              Insère un template sur le canvas pour démarrer rapidement
            </p>
          </div>
          <button
            onClick={() => setShowTemplates(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-5 grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => {
            const meta = TEMPLATE_META[tpl.id] ?? { Icon: Layout, accent: '#6366f1', bg: '#1e1b4b' }
            const { Icon, accent, bg } = meta
            return (
              <button
                key={tpl.id}
                onClick={() => handleInsert(tpl.id)}
                className="text-left rounded-xl border border-[#2e2e33] bg-[#18181b] hover:border-[#6366f1]/60 hover:bg-[#1c1c28] transition-all group overflow-hidden"
              >
                {/* Preview */}
                <div
                  className="w-full h-24 flex items-center justify-center relative overflow-hidden"
                  style={{ background: bg }}
                >
                  {/* Decorative blobs */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${accent}33, transparent)`,
                    }}
                  />
                  <Icon size={32} className="relative z-10 opacity-80" style={{ color: accent }} />
                  {/* Insert hint on hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#6366f1] px-3 py-1.5 rounded-full">
                      <Plus size={12} />
                      Insérer
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-[#e4e4e7] group-hover:text-white transition-colors">
                    {tpl.name}
                  </div>
                  <div className="text-xs text-[#52525b] mt-0.5">{tpl.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
