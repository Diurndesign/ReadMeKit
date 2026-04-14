import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import type { TextElement as TextElementType } from '../../types/elements'

interface Props {
  element: TextElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function TextElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const { x, y, width: w, height: h } = element

  const textAnchor =
    element.textAlign === 'center'
      ? 'middle'
      : element.textAlign === 'right'
        ? 'end'
        : 'start'

  const textX =
    element.textAlign === 'center'
      ? x + w / 2
      : element.textAlign === 'right'
        ? x + w
        : x

  const cornerHandles: { handle: ResizeHandle; hx: number; hy: number }[] = [
    { handle: 'nw', hx: x, hy: y },
    { handle: 'ne', hx: x + w, hy: y },
    { handle: 'se', hx: x + w, hy: y + h },
    { handle: 'sw', hx: x, hy: y + h },
    { handle: 'e', hx: x + w, hy: y + h / 2 },
    { handle: 'w', hx: x, hy: y + h / 2 },
  ]

  return (
    <g onPointerDown={onPointerDown} style={{ cursor: 'move', opacity: element.opacity }}>
      <text
        x={textX}
        y={y + element.fontSize}
        width={w}
        fontSize={element.fontSize}
        fontWeight={element.fontWeight}
        fontFamily={element.fontFamily}
        fill={element.fill}
        textAnchor={textAnchor}
        dominantBaseline="auto"
      >
        {element.content}
      </text>
      {isSelected && (
        <>
          <rect
            x={x - 2}
            y={y - 2}
            width={w + 4}
            height={h + 4}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
          {cornerHandles.map(({ handle, hx, hy }) => (
            <circle
              key={handle}
              cx={hx}
              cy={hy}
              r={3.5}
              fill="white"
              stroke="#6366f1"
              strokeWidth={2}
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
