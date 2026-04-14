import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import { TEMPLATES } from '../data/templates'
import { X } from 'lucide-react'

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
    const els = tpl.build()
    addElements(els)
    // Reset view to show template
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
    setShowTemplates(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setShowTemplates(false)}
      />

      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[680px] max-h-[80vh] flex flex-col"
        style={{ background: '#1c1c20', border: '1px solid #3f3f46', borderRadius: 20, boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2e2e33]">
          <div>
            <h2 className="text-lg font-bold text-white">Templates</h2>
            <p className="text-xs text-[#71717a] mt-0.5">Clique pour insérer sur le canvas</p>
          </div>
          <button onClick={() => setShowTemplates(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-2 gap-4">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleInsert(tpl.id)}
              className="text-left p-5 rounded-xl border border-[#2e2e33] bg-[#18181b] hover:border-[#6366f1] hover:bg-[#1c1c28] transition-all group"
            >
              {/* Preview area */}
              <div className="w-full h-20 rounded-lg mb-4 flex items-center justify-center text-4xl"
                style={{ background: '#0f0f11', border: '1px solid #2e2e33' }}>
                {tpl.preview}
              </div>
              <div className="font-semibold text-[#e4e4e7] text-sm group-hover:text-white transition-colors">
                {tpl.name}
              </div>
              <div className="text-xs text-[#71717a] mt-1">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
