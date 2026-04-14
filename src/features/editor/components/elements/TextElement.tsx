import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import { useUIStore } from '../../stores/uiStore'
import { wrapText } from '@/utils/wrapText'
import type { TextElement as TextElementType } from '../../types/elements'

interface Props {
  element: TextElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function TextElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const setEditingId = useUIStore((s) => s.setEditingId)
  const { x, y, width: w, height: h } = element

  const textAnchor =
    element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start'
  const textX =
    element.textAlign === 'center' ? x + w / 2 : element.textAlign === 'right' ? x + w : x

  const pad = element.bgPadding ?? 4
  const bgRadius = element.bgRadius ?? 4

  const lines = wrapText(element.content, w, element.fontSize)
  const lineHeight = element.fontSize * 1.3
  const textContentHeight = lines.length * lineHeight

  const cornerHandles: { handle: ResizeHandle; hx: number; hy: number }[] = [
    { handle: 'nw', hx: x, hy: y },
    { handle: 'ne', hx: x + w, hy: y },
    { handle: 'se', hx: x + w, hy: y + h },
    { handle: 'sw', hx: x, hy: y + h },
    { handle: 'e', hx: x + w, hy: y + h / 2 },
    { handle: 'w', hx: x, hy: y + h / 2 },
  ]

  return (
    <g
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditingId(element.id)
      }}
      style={{ cursor: 'move', opacity: element.opacity }}
    >
      {element.background && (
        <rect
          x={x - pad}
          y={y - pad}
          width={w + pad * 2}
          height={Math.max(h, textContentHeight) + pad * 2}
          rx={bgRadius}
          ry={bgRadius}
          fill={element.background}
        />
      )}
      <text
        fontFamily={element.fontFamily}
        fontWeight={element.fontWeight}
        fontSize={element.fontSize}
        fill={element.fill}
        textAnchor={textAnchor}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={textX} y={y + element.fontSize + i * lineHeight}>
            {line || '\u00A0'}
          </tspan>
        ))}
      </text>
      {/* Invisible hit area for easier clicking */}
      <rect x={x} y={y} width={w} height={Math.max(h, textContentHeight)} fill="transparent" />
      {isSelected && (
        <>
          <rect
            x={x - 2} y={y - 2} width={w + 4} height={h + 4}
            fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3"
            pointerEvents="none"
          />
          {cornerHandles.map(({ handle, hx, hy }) => (
            <circle
              key={handle} cx={hx} cy={hy} r={3.5}
              fill="white" stroke="#6366f1" strokeWidth={2}
              style={{ cursor: CURSOR_MAP[handle] }}
              onPointerDown={(e) => {
                e.stopPropagation()
                handleResizeStart(e, element.id, handle, { x, y, width: w, height: h })
              }}
            />
          ))}
        </>
      )}
    </g>
  )
}
