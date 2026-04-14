import { useEditorStore } from '../stores/editorStore'
import type { EditorElement, RectElement, TextElement } from '../types/elements'

function PropertyInput({
  label,
  value,
  type = 'text',
  onChange,
}: {
  label: string
  value: string | number
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-[#a1a1aa] w-12 shrink-0">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 px-2 text-sm bg-[#0f0f11] border border-[#2e2e33] rounded-md text-white focus:outline-none focus:border-[#6366f1] transition-colors"
      />
    </div>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-[#a1a1aa] w-12 shrink-0">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-[#2e2e33] bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 px-2 text-sm bg-[#0f0f11] border border-[#2e2e33] rounded-md text-white focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
        />
      </div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  )
}

function CommonProperties({
  element,
  onUpdate,
}: {
  element: EditorElement
  onUpdate: (updates: Partial<EditorElement>) => void
}) {
  return (
    <>
      <SectionHeader>Position</SectionHeader>
      <div className="grid grid-cols-2 gap-2">
        <PropertyInput
          label="X"
          value={Math.round(element.x)}
          type="number"
          onChange={(v) => onUpdate({ x: Number(v) })}
        />
        <PropertyInput
          label="Y"
          value={Math.round(element.y)}
          type="number"
          onChange={(v) => onUpdate({ y: Number(v) })}
        />
      </div>

      <SectionHeader>Size</SectionHeader>
      <div className="grid grid-cols-2 gap-2">
        <PropertyInput
          label="W"
          value={Math.round(element.width)}
          type="number"
          onChange={(v) => onUpdate({ width: Math.max(10, Number(v)) })}
        />
        <PropertyInput
          label="H"
          value={Math.round(element.height)}
          type="number"
          onChange={(v) => onUpdate({ height: Math.max(10, Number(v)) })}
        />
      </div>

      <SectionHeader>Opacity</SectionHeader>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={element.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="flex-1 accent-[#6366f1]"
        />
        <span className="text-xs text-[#a1a1aa] w-10 text-right">
          {Math.round(element.opacity * 100)}%
        </span>
      </div>
    </>
  )
}

function RectProperties({
  element,
  onUpdate,
}: {
  element: RectElement
  onUpdate: (updates: Partial<RectElement>) => void
}) {
  return (
    <>
      <SectionHeader>Fill</SectionHeader>
      <ColorInput
        label="Color"
        value={element.fill}
        onChange={(v) => onUpdate({ fill: v })}
      />

      <SectionHeader>Border</SectionHeader>
      <ColorInput
        label="Color"
        value={element.stroke === 'transparent' ? '#000000' : element.stroke}
        onChange={(v) => onUpdate({ stroke: v })}
      />
      <PropertyInput
        label="Width"
        value={element.strokeWidth}
        type="number"
        onChange={(v) => onUpdate({ strokeWidth: Math.max(0, Number(v)) })}
      />
      <PropertyInput
        label="Radius"
        value={element.cornerRadius}
        type="number"
        onChange={(v) => onUpdate({ cornerRadius: Math.max(0, Number(v)) })}
      />
    </>
  )
}

function TextProperties({
  element,
  onUpdate,
}: {
  element: TextElement
  onUpdate: (updates: Partial<TextElement>) => void
}) {
  return (
    <>
      <SectionHeader>Content</SectionHeader>
      <textarea
        value={element.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={3}
        className="w-full px-2 py-1.5 text-sm bg-[#0f0f11] border border-[#2e2e33] rounded-md text-white focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
      />

      <SectionHeader>Text</SectionHeader>
      <PropertyInput
        label="Size"
        value={element.fontSize}
        type="number"
        onChange={(v) => onUpdate({ fontSize: Math.max(8, Number(v)) })}
      />
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#a1a1aa] w-12 shrink-0">Weight</label>
        <select
          value={element.fontWeight}
          onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
          className="flex-1 h-8 px-2 text-sm bg-[#0f0f11] border border-[#2e2e33] rounded-md text-white focus:outline-none focus:border-[#6366f1]"
        >
          <option value={300}>Light</option>
          <option value={400}>Regular</option>
          <option value={500}>Medium</option>
          <option value={600}>Semibold</option>
          <option value={700}>Bold</option>
          <option value={800}>Extra Bold</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#a1a1aa] w-12 shrink-0">Align</label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ textAlign: align })}
              className={`px-3 h-8 text-xs rounded-md transition-colors ${
                element.textAlign === align
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#0f0f11] text-[#a1a1aa] border border-[#2e2e33] hover:border-[#6366f1]'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <SectionHeader>Color</SectionHeader>
      <ColorInput
        label="Fill"
        value={element.fill}
        onChange={(v) => onUpdate({ fill: v })}
      />
    </>
  )
}

export function PropertyPanel() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const elements = useEditorStore((s) => s.elements)
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const bringForward = useEditorStore((s) => s.bringForward)
  const sendBackward = useEditorStore((s) => s.sendBackward)

  const selectedElement = elements.find((e) => e.id === selectedId)

  if (!selectedElement) {
    return (
      <div data-onboarding="panel" className="w-64 border-l border-[#2e2e33] bg-[#18181b] p-4 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-[#a1a1aa]">
          Select an element to edit its properties
        </p>
        <p className="text-xs text-[#52525b] mt-2">
          Click on the canvas to add elements, or use the toolbar
        </p>
      </div>
    )
  }

  const handleUpdate = (updates: Partial<EditorElement>) => {
    updateElement(selectedElement.id, updates)
  }

  return (
    <div data-onboarding="panel" className="w-64 border-l border-[#2e2e33] bg-[#18181b] overflow-y-auto">
      <div className="p-4 space-y-2">
        {/* Element type badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded bg-[#27272a] text-[#a1a1aa] uppercase tracking-wider">
            {selectedElement.type}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => sendBackward(selectedElement.id)}
              title="Send backward"
              className="w-7 h-7 flex items-center justify-center rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] text-xs"
            >
              ↓
            </button>
            <button
              onClick={() => bringForward(selectedElement.id)}
              title="Bring forward"
              className="w-7 h-7 flex items-center justify-center rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] text-xs"
            >
              ↑
            </button>
          </div>
        </div>

        {/* Common properties */}
        <CommonProperties element={selectedElement} onUpdate={handleUpdate} />

        {/* Type-specific properties */}
        {selectedElement.type === 'rect' && (
          <RectProperties element={selectedElement} onUpdate={handleUpdate} />
        )}
        {selectedElement.type === 'text' && (
          <TextProperties element={selectedElement} onUpdate={handleUpdate} />
        )}

        {/* Delete button */}
        <div className="pt-4 mt-4 border-t border-[#2e2e33]">
          <button
            onClick={() => deleteElement(selectedElement.id)}
            className="w-full h-9 text-sm rounded-lg bg-[#27272a] text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
          >
            Delete Element
          </button>
        </div>
      </div>
    </div>
  )
}
