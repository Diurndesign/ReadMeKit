import { useState, useRef, useEffect } from 'react'
import {
  Copy, X, AlignLeft, AlignCenter, AlignRight,
  Trash2, Square, Circle, Type, Move, Minus, Image, Moon,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  Group, Ungroup,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'
import type { EditorElement, RectElement, TextElement, CircleElement, LineElement, ImageElement } from '../types/elements'
import { cn } from '@/utils/cn'

// ─── Base input components ────────────────────────────────────────────────────

function PropertyInput({
  label, value, type = 'text', onChange,
}: { label: string; value: string | number; type?: string; onChange: (v: string) => void }) {
  const isFocused = useRef(false)
  const [local, setLocal] = useState(
    type === 'number' ? String(Math.round(Number(value))) : String(value)
  )

  // Sync external changes while not focused (e.g. arrow key nudge)
  useEffect(() => {
    if (!isFocused.current) {
      setLocal(type === 'number' ? String(Math.round(Number(value))) : String(value))
    }
  }, [value, type])

  if (type === 'number') {
    return (
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">{label}</label>
        <input
          type="number"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onFocus={(e) => { isFocused.current = true; e.target.select() }}
          onBlur={() => { isFocused.current = false; onChange(local) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            e.stopPropagation()
          }}
          className="flex-1 h-7 px-2 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1] transition-colors tabular-nums"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        className="flex-1 h-7 px-2 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1] transition-colors tabular-nums"
      />
    </div>
  )
}

const COLOR_SWATCHES = [
  '#6366f1', '#818cf8', '#ec4899', '#f43f5e',
  '#22c55e', '#3b82f6', '#f59e0b', '#a78bfa',
  '#e4e4e7', '#71717a', '#18181b', '#ffffff',
]

function ColorInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">{label}</label>
        <div className="flex items-center gap-1.5 flex-1 h-7 px-1.5 bg-[#0f0f11] border border-[#2e2e33] rounded focus-within:border-[#6366f1] transition-colors">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 rounded-sm cursor-pointer border-0 bg-transparent shrink-0 p-0"
            style={{ padding: 0 }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="flex-1 text-xs bg-transparent text-[#e4e4e7] focus:outline-none font-mono min-w-0"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5 pl-10">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => onChange(c)}
            style={{ background: c }}
            className={cn(
              'w-4 h-4 rounded-sm border transition-all',
              value === c ? 'border-white scale-110' : 'border-[#3f3f46] hover:border-white hover:scale-110',
            )}
          />
        ))}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mt-3 mb-1.5 first:mt-0">
      {children}
    </p>
  )
}

/** Dark-mode fill override — shown below any fill ColorInput */
function DarkFillRow({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string | undefined) => void
}) {
  return (
    <div className="mt-1.5">
      {value === undefined ? (
        <button
          onClick={() => onChange('#ffffff')}
          className="flex items-center gap-1.5 text-[11px] text-[#52525b] hover:text-[#818cf8] transition-colors"
        >
          <Moon size={11} />
          <span>+ Couleur sombre</span>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-1">
            <Moon size={11} className="text-[#818cf8] shrink-0" />
            <span className="text-[10px] text-[#818cf8] font-medium">Mode sombre</span>
            <button
              onClick={() => onChange(undefined)}
              className="ml-auto text-[#52525b] hover:text-[#f87171] transition-colors"
              title="Supprimer la couleur sombre"
            >
              <X size={11} />
            </button>
          </div>
          <ColorInput label="🌙" value={value} onChange={onChange} />
        </>
      )}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-[#2e2e33] my-3" />
}

// ─── Shared properties ────────────────────────────────────────────────────────

function CommonProperties({ element, onUpdate }: { element: EditorElement; onUpdate: (u: Partial<EditorElement>) => void }) {
  return (
    <>
      <SectionLabel>Position</SectionLabel>
      <div className="grid grid-cols-2 gap-1.5">
        <PropertyInput label="X" value={Math.round(element.x)} type="number" onChange={(v) => onUpdate({ x: Number(v) })} />
        <PropertyInput label="Y" value={Math.round(element.y)} type="number" onChange={(v) => onUpdate({ y: Number(v) })} />
      </div>
      <SectionLabel>Taille</SectionLabel>
      <div className="grid grid-cols-2 gap-1.5">
        <PropertyInput label="W" value={Math.round(element.width)} type="number" onChange={(v) => onUpdate({ width: Math.max(10, Number(v)) })} />
        <PropertyInput label="H" value={Math.round(element.height)} type="number" onChange={(v) => onUpdate({ height: Math.max(10, Number(v)) })} />
      </div>
      <SectionLabel>Rotation</SectionLabel>
      <div className="flex items-center gap-2">
        <input
          type="range" min="0" max="359" step="1"
          value={element.rotation ?? 0}
          onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
          className="flex-1 accent-[#6366f1] h-1"
        />
        <PropertyInput
          label="°"
          value={element.rotation ?? 0}
          type="number"
          onChange={(v) => {
            const deg = ((Number(v) % 360) + 360) % 360
            onUpdate({ rotation: Math.round(deg) })
          }}
        />
      </div>
      <SectionLabel>Opacité</SectionLabel>
      <div className="flex items-center gap-2">
        <input
          type="range" min="0" max="1" step="0.05" value={element.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="flex-1 accent-[#6366f1] h-1"
        />
        <span className="text-xs text-[#71717a] w-9 text-right tabular-nums">
          {Math.round(element.opacity * 100)}%
        </span>
      </div>
    </>
  )
}

// ─── Type-specific properties ─────────────────────────────────────────────────

function GradientToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative w-9 h-5 rounded-full transition-colors shrink-0',
        active ? 'bg-[#6366f1]' : 'bg-[#27272a]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
          active ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

type FillShapeEl = RectElement | CircleElement

function FillShapeProperties({ element, onUpdate }: { element: FillShapeEl; onUpdate: (u: Partial<FillShapeEl>) => void }) {
  const hasGradient = !!(element.gradientFrom && element.gradientTo)
  const defaultGradientTo = element.type === 'rect' ? '#ec4899' : '#a78bfa'
  return (
    <>
      <SectionLabel>Remplissage</SectionLabel>
      {!hasGradient && (
        <ColorInput label="Fill" value={element.fill} onChange={(v) => onUpdate({ fill: v })} />
      )}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-[#71717a]">Dégradé</span>
        <GradientToggle
          active={hasGradient}
          onToggle={() => hasGradient
            ? onUpdate({ gradientFrom: undefined, gradientTo: undefined, gradientAngle: undefined })
            : onUpdate({ gradientFrom: element.fill, gradientTo: defaultGradientTo, gradientAngle: 90 })
          }
        />
      </div>
      {hasGradient && (
        <>
          <div className="mt-1.5 space-y-1.5">
            <ColorInput label="De" value={element.gradientFrom!} onChange={(v) => onUpdate({ gradientFrom: v })} />
            <ColorInput label="À" value={element.gradientTo!} onChange={(v) => onUpdate({ gradientTo: v })} />
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">°</label>
            <input
              type="range" min="0" max="360" step="15"
              value={element.gradientAngle ?? 90}
              onChange={(e) => onUpdate({ gradientAngle: Number(e.target.value) })}
              className="flex-1 accent-[#6366f1] h-1"
            />
            <span className="text-xs text-[#71717a] w-9 text-right tabular-nums">{element.gradientAngle ?? 90}°</span>
          </div>
        </>
      )}
      <DarkFillRow value={element.darkFill} onChange={(v) => onUpdate({ darkFill: v })} />
      <SectionLabel>Bordure</SectionLabel>
      <ColorInput label="Coul." value={element.stroke === 'transparent' ? '#000000' : element.stroke} onChange={(v) => onUpdate({ stroke: v })} />
      <div className={cn('mt-1.5', element.type === 'rect' && 'grid grid-cols-2 gap-1.5')}>
        <PropertyInput label="Ép." value={element.strokeWidth} type="number" onChange={(v) => onUpdate({ strokeWidth: Math.max(0, Number(v)) })} />
        {element.type === 'rect' && (
          <PropertyInput label="Rx" value={element.cornerRadius} type="number" onChange={(v) => onUpdate({ cornerRadius: Math.max(0, Number(v)) })} />
        )}
      </div>
    </>
  )
}

function TextProperties({ element, onUpdate }: { element: TextElement; onUpdate: (u: Partial<TextElement>) => void }) {
  return (
    <>
      <SectionLabel>Contenu</SectionLabel>
      <textarea
        value={element.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={3}
        className="w-full px-2 py-1.5 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1] transition-colors resize-none leading-relaxed"
      />
      <SectionLabel>Typographie</SectionLabel>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {[12, 16, 20, 24, 32, 48].map((s) => (
          <button
            key={s}
            onClick={() => onUpdate({ fontSize: s })}
            className={cn(
              'h-5 px-1.5 text-[10px] rounded border transition-colors tabular-nums',
              element.fontSize === s
                ? 'bg-[#6366f1] border-[#6366f1] text-white'
                : 'bg-[#0f0f11] border-[#2e2e33] text-[#52525b] hover:border-[#6366f1] hover:text-[#e4e4e7]',
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <PropertyInput label="Sz" value={element.fontSize} type="number" onChange={(v) => onUpdate({ fontSize: Math.max(8, Number(v)) })} />
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">Wt</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
            className="flex-1 h-7 px-1.5 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1]"
          >
            <option value={300}>Light</option>
            <option value={400}>Regular</option>
            <option value={500}>Medium</option>
            <option value={600}>Semibold</option>
            <option value={700}>Bold</option>
            <option value={800}>Extra Bold</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">Font</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="flex-1 h-7 px-1.5 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1]"
        >
          <option value='-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'>System UI</option>
          <option value='"Consolas", "Cascadia Code", "Courier New", monospace'>Monospace</option>
          <option value='"Georgia", "Times New Roman", serif'>Serif</option>
          <option value='Impact, "Arial Black", sans-serif'>Impact</option>
          <option value='"Arial", "Helvetica Neue", sans-serif'>Arial</option>
        </select>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">Align</label>
        <div className="flex gap-1">
          {([
            { value: 'left', Icon: AlignLeft },
            { value: 'center', Icon: AlignCenter },
            { value: 'right', Icon: AlignRight },
          ] as const).map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => onUpdate({ textAlign: value })}
              title={value}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded transition-colors',
                element.textAlign === value
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-[#0f0f11] text-[#71717a] border border-[#2e2e33] hover:border-[#6366f1] hover:text-white',
              )}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>
      <SectionLabel>Couleur</SectionLabel>
      <ColorInput label="Fill" value={element.fill} onChange={(v) => onUpdate({ fill: v })} />
      <DarkFillRow value={element.darkFill} onChange={(v) => onUpdate({ darkFill: v })} />
      <SectionLabel>Fond du texte</SectionLabel>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#71717a]">Activer</span>
        <button
          onClick={() => onUpdate({ background: element.background ? undefined : '#18181b' })}
          className={cn(
            'relative w-9 h-5 rounded-full transition-colors shrink-0',
            element.background ? 'bg-[#6366f1]' : 'bg-[#27272a]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
              element.background ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
      </div>
      {element.background && (
        <>
          <ColorInput label="Coul." value={element.background} onChange={(v) => onUpdate({ background: v })} />
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <PropertyInput label="Pad" value={element.bgPadding ?? 4} type="number" onChange={(v) => onUpdate({ bgPadding: Math.max(0, Number(v)) })} />
            <PropertyInput label="Rx" value={element.bgRadius ?? 4} type="number" onChange={(v) => onUpdate({ bgRadius: Math.max(0, Number(v)) })} />
          </div>
        </>
      )}
    </>
  )
}

// ─── Type icon ────────────────────────────────────────────────────────────────

function LineProperties({ element, onUpdate }: { element: LineElement; onUpdate: (u: Partial<LineElement>) => void }) {
  return (
    <>
      <SectionLabel>Trait</SectionLabel>
      <ColorInput label="Coul." value={element.stroke} onChange={(v) => onUpdate({ stroke: v })} />
      <div className="mt-1.5">
        <PropertyInput label="Ép." value={element.strokeWidth} type="number" onChange={(v) => onUpdate({ strokeWidth: Math.max(1, Number(v)) })} />
      </div>
      <SectionLabel>Style</SectionLabel>
      <div className="flex gap-1">
        {(['solid', 'dashed', 'dotted'] as const).map((d) => (
          <button
            key={d}
            onClick={() => onUpdate({ strokeDash: d })}
            className={cn(
              'flex-1 h-7 text-[10px] rounded border transition-colors',
              element.strokeDash === d
                ? 'bg-[#6366f1] border-[#6366f1] text-white'
                : 'bg-[#0f0f11] border-[#2e2e33] text-[#71717a] hover:border-[#6366f1] hover:text-white',
            )}
          >
            {d === 'solid' ? '—' : d === 'dashed' ? '- -' : '···'}
          </button>
        ))}
      </div>
      <SectionLabel>Flèches</SectionLabel>
      <div className="flex gap-1">
        <button
          onClick={() => onUpdate({ arrowStart: !element.arrowStart })}
          className={cn(
            'flex-1 h-7 text-[10px] rounded border transition-colors',
            element.arrowStart ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'bg-[#0f0f11] border-[#2e2e33] text-[#71717a] hover:border-[#6366f1]',
          )}
        >← Début</button>
        <button
          onClick={() => onUpdate({ arrowEnd: !element.arrowEnd })}
          className={cn(
            'flex-1 h-7 text-[10px] rounded border transition-colors',
            element.arrowEnd ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'bg-[#0f0f11] border-[#2e2e33] text-[#71717a] hover:border-[#6366f1]',
          )}
        >Fin →</button>
      </div>
    </>
  )
}

function ImageProperties({ element, onUpdate }: { element: ImageElement; onUpdate: (u: Partial<ImageElement>) => void }) {
  return (
    <>
      <SectionLabel>URL de l'image</SectionLabel>
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={element.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://..."
          className="flex-1 h-7 px-2 text-xs bg-[#0f0f11] border border-[#2e2e33] rounded text-[#e4e4e7] focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
        />
      </div>
      <p className="text-[10px] text-[#3f3f46] mt-1 leading-relaxed">
        URL directe vers une image (.png, .jpg, .svg…)
      </p>
    </>
  )
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'rect') return <Square size={12} />
  if (type === 'circle') return <Circle size={12} />
  if (type === 'text') return <Type size={12} />
  if (type === 'line') return <Minus size={12} />
  if (type === 'image') return <Image size={12} />
  return <Move size={12} />
}

// ─── Canvas settings ─────────────────────────────────────────────────────────

function CanvasSettings() {
  const canvasBg = useUIStore((s) => s.canvasBg)
  const setCanvasBg = useUIStore((s) => s.setCanvasBg)
  const isTransparent = canvasBg === 'transparent' || canvasBg === ''
  return (
    <>
      <SectionLabel>Fond du canvas</SectionLabel>
      <div className="flex items-center gap-2">
        <label className="text-xs text-[#71717a] w-8 shrink-0 text-right">Coul.</label>
        <div className="flex items-center gap-1.5 flex-1 h-7 px-1.5 bg-[#0f0f11] border border-[#2e2e33] rounded focus-within:border-[#6366f1] transition-colors">
          <input
            type="color"
            value={isTransparent ? '#0f0f11' : canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            className="w-5 h-5 rounded-sm cursor-pointer border-0 bg-transparent shrink-0 p-0"
          />
          <input
            type="text"
            value={isTransparent ? 'transparent' : canvasBg}
            onChange={(e) => setCanvasBg(e.target.value)}
            className="flex-1 text-xs bg-transparent text-[#e4e4e7] focus:outline-none font-mono min-w-0"
          />
        </div>
        {!isTransparent && (
          <button
            onClick={() => setCanvasBg('transparent')}
            title="Fond transparent"
            className="w-6 h-6 flex items-center justify-center rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function PropertyPanel() {
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const elements = useEditorStore((s) => s.elements)
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const clearSelection = useEditorStore((s) => s.clearSelection)
  const alignElements = useEditorStore((s) => s.alignElements)
  const distributeElements = useEditorStore((s) => s.distributeElements)
  const groupSelected = useEditorStore((s) => s.groupSelected)
  const ungroupSelected = useEditorStore((s) => s.ungroupSelected)

  const primaryId = selectedIds[selectedIds.length - 1] ?? null
  const selectedElement = elements.find((e) => e.id === primaryId)

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (selectedIds.length === 0) {
    return (
      <div
        data-onboarding="panel"
        className="w-60 border-l border-[#2e2e33] bg-[#18181b] flex flex-col overflow-y-auto"
      >
        <div className="flex flex-col items-center justify-center text-center px-5 py-8">
          <div className="w-10 h-10 rounded-xl bg-[#27272a] flex items-center justify-center mb-3">
            <Move size={18} className="text-[#52525b]" />
          </div>
          <p className="text-xs text-[#71717a] leading-relaxed">
            Sélectionne un élément pour modifier ses propriétés
          </p>
          <p className="text-[11px] text-[#3f3f46] mt-2 leading-relaxed">
            Glisser sur le canvas pour sélectionner plusieurs éléments
          </p>
        </div>
        <Divider />
        <div className="px-4 pb-4">
          <CanvasSettings />
        </div>
      </div>
    )
  }

  // ── Multi-selection ────────────────────────────────────────────────────────
  if (selectedIds.length > 1) {
    const canDistribute = selectedIds.length >= 3
    return (
      <div data-onboarding="panel" className="w-60 border-l border-[#2e2e33] bg-[#18181b] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#27272a] flex items-center justify-center">
                <Move size={13} className="text-[#a1a1aa]" />
              </div>
              <span className="text-sm font-medium text-[#e4e4e7]">
                {selectedIds.length} éléments
              </span>
            </div>
            <button
              onClick={clearSelection}
              title="Désélectionner"
              className="w-7 h-7 flex items-center justify-center rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Alignment tools */}
          <SectionLabel>Aligner</SectionLabel>
          <div className="grid grid-cols-3 gap-1 mb-1">
            {([
              { dir: 'left', Icon: AlignStartVertical, title: 'Aligner à gauche' },
              { dir: 'center-h', Icon: AlignCenterVertical, title: 'Centrer horizontalement' },
              { dir: 'right', Icon: AlignEndVertical, title: 'Aligner à droite' },
              { dir: 'top', Icon: AlignStartHorizontal, title: 'Aligner en haut' },
              { dir: 'middle-v', Icon: AlignCenterHorizontal, title: 'Centrer verticalement' },
              { dir: 'bottom', Icon: AlignEndHorizontal, title: 'Aligner en bas' },
            ] as const).map(({ dir, Icon, title }) => (
              <button
                key={dir}
                title={title}
                onClick={() => alignElements(selectedIds, dir)}
                className="h-7 flex items-center justify-center rounded bg-[#0f0f11] border border-[#2e2e33] text-[#71717a] hover:border-[#6366f1] hover:text-white transition-colors"
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {canDistribute && (
            <>
              <SectionLabel>Distribuer</SectionLabel>
              <div className="grid grid-cols-2 gap-1">
                <button
                  title="Distribuer horizontalement"
                  onClick={() => distributeElements(selectedIds, 'h')}
                  className="h-7 flex items-center justify-center gap-1.5 rounded bg-[#0f0f11] border border-[#2e2e33] text-[#71717a] hover:border-[#6366f1] hover:text-white transition-colors text-[10px]"
                >
                  <AlignHorizontalSpaceAround size={12} />
                  Horiz.
                </button>
                <button
                  title="Distribuer verticalement"
                  onClick={() => distributeElements(selectedIds, 'v')}
                  className="h-7 flex items-center justify-center gap-1.5 rounded bg-[#0f0f11] border border-[#2e2e33] text-[#71717a] hover:border-[#6366f1] hover:text-white transition-colors text-[10px]"
                >
                  <AlignVerticalSpaceAround size={12} />
                  Vert.
                </button>
              </div>
            </>
          )}

          <Divider />

          {/* Group / Ungroup */}
          {(() => {
            const allGrouped = selectedIds.length >= 2 &&
              (() => {
                const gid = elements.find((e) => e.id === selectedIds[0])?.groupId
                return !!gid && selectedIds.every((id) => {
                  const el = elements.find((e) => e.id === id)
                  return el?.groupId === gid
                })
              })()
            return (
              <button
                onClick={allGrouped ? ungroupSelected : groupSelected}
                className="w-full h-8 text-xs rounded-lg bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-white transition-colors flex items-center justify-center gap-2 mb-2"
              >
                {allGrouped ? <Ungroup size={13} /> : <Group size={13} />}
                {allGrouped ? 'Dégrouper' : 'Grouper'} ({selectedIds.length})
              </button>
            )
          })()}

          <button
            onClick={deleteSelected}
            className="w-full h-8 text-xs rounded-lg bg-[#27272a] text-[#f87171] hover:bg-[#ef4444]/20 hover:text-[#ef4444] transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={13} />
            Supprimer les {selectedIds.length} éléments
          </button>
        </div>
      </div>
    )
  }

  // ── Single element ─────────────────────────────────────────────────────────
  if (!selectedElement) return null

  const handleUpdate = (updates: Partial<EditorElement>) => updateElement(selectedElement.id, updates)
  const TYPE_LABELS: Record<string, string> = { rect: 'Rectangle', text: 'Texte', circle: 'Cercle', line: 'Ligne', image: 'Image' }

  return (
    <div data-onboarding="panel" className="w-60 border-l border-[#2e2e33] bg-[#18181b] overflow-y-auto">
      <div className="p-4">

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#27272a] flex items-center justify-center text-[#a1a1aa]">
              <TypeIcon type={selectedElement.type} />
            </div>
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              {TYPE_LABELS[selectedElement.type] ?? selectedElement.type}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => duplicateElement(selectedElement.id)}
              title="Dupliquer (Ctrl+D)"
              className="w-7 h-7 flex items-center justify-center rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        {/* Properties */}
        <CommonProperties element={selectedElement} onUpdate={handleUpdate} />

        {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
          <FillShapeProperties element={selectedElement} onUpdate={handleUpdate} />
        )}
        {selectedElement.type === 'text' && (
          <TextProperties element={selectedElement} onUpdate={handleUpdate} />
        )}
        {selectedElement.type === 'line' && (
          <LineProperties element={selectedElement} onUpdate={handleUpdate} />
        )}
        {selectedElement.type === 'image' && (
          <ImageProperties element={selectedElement} onUpdate={handleUpdate} />
        )}

        <Divider />

        <button
          onClick={deleteSelected}
          className="w-full h-8 text-xs rounded-lg bg-[#27272a] text-[#f87171] hover:bg-[#ef4444]/20 hover:text-[#ef4444] transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={13} />
          Supprimer
        </button>
      </div>
    </div>
  )
}
