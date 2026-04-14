import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import type { RectElement as RectElementType } from '../../types/elements'

interface Props {
  element: RectElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

function gradientCoords(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return {
    x1: `${50 - 50 * Math.sin(a)}%`,
    y1: `${50 - 50 * Math.cos(a)}%`,
    x2: `${50 + 50 * Math.sin(a)}%`,
    y2: `${50 + 50 * Math.cos(a)}%`,
  }
}

export function RectElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const { x, y, width: w, height: h } = element

  const hasGradient = !!(element.gradientFrom && element.gradientTo)
  const gradId = `grad-${element.id}`
  const coords = hasGradient ? gradientCoords(element.gradientAngle ?? 90) : null

  const handles: { handle: ResizeHandle; cx: number; cy: number }[] = [
    { handle: 'nw', cx: x, cy: y },
    { handle: 'n', cx: x + w / 2, cy: y },
    { handle: 'ne', cx: x + w, cy: y },
    { handle: 'e', cx: x + w, cy: y + h / 2 },
    { handle: 'se', cx: x + w, cy: y + h },
    { handle: 's', cx: x + w / 2, cy: y + h },
    { handle: 'sw', cx: x, cy: y + h },
    { handle: 'w', cx: x, cy: y + h / 2 },
  ]

  return (
    <g onPointerDown={onPointerDown} style={{ cursor: 'move', opacity: element.opacity }}>
      {hasGradient && coords && (
        <defs>
          <linearGradient id={gradId} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
            <stop offset="0%" stopColor={element.gradientFrom} />
            <stop offset="100%" stopColor={element.gradientTo} />
          </linearGradient>
        </defs>
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={element.cornerRadius}
        ry={element.cornerRadius}
        fill={hasGradient ? `url(#${gradId})` : element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
      />
      {isSelected && (
        <>
          <rect
            x={x - 1}
            y={y - 1}
            width={w + 2}
            height={h + 2}
            rx={element.cornerRadius}
            ry={element.cornerRadius}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 3"
            pointerEvents="none"
          />
          {handles.map(({ handle, cx, cy }) => (
            <circle
              key={handle}
              cx={cx}
              cy={cy}
              r={4}
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
