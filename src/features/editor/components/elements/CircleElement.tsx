import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import type { CircleElement as CircleElementType } from '../../types/elements'

interface Props {
  element: CircleElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function CircleElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const { x, y, width: w, height: h } = element
  const cx = x + w / 2
  const cy = y + h / 2
  const rx = w / 2
  const ry = h / 2

  const cornerHandles: { handle: ResizeHandle; hx: number; hy: number }[] = [
    { handle: 'nw', hx: x, hy: y },
    { handle: 'ne', hx: x + w, hy: y },
    { handle: 'se', hx: x + w, hy: y + h },
    { handle: 'sw', hx: x, hy: y + h },
    { handle: 'n', hx: x + w / 2, hy: y },
    { handle: 's', hx: x + w / 2, hy: y + h },
    { handle: 'e', hx: x + w, hy: y + h / 2 },
    { handle: 'w', hx: x, hy: y + h / 2 },
  ]

  return (
    <g onPointerDown={onPointerDown} style={{ cursor: 'move', opacity: element.opacity }}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={element.fill}
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
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            pointerEvents="none"
          />
          {cornerHandles.map(({ handle, hx, hy }) => (
            <circle
              key={handle}
              cx={hx}
              cy={hy}
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
