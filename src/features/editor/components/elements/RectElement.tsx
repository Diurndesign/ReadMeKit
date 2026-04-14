import type { RectElement as RectElementType } from '../../types/elements'

interface Props {
  element: RectElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function RectElementSVG({ element, isSelected, onPointerDown }: Props) {
  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: 'move', opacity: element.opacity }}
    >
      <rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rx={element.cornerRadius}
        ry={element.cornerRadius}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
      />
      {isSelected && (
        <>
          <rect
            x={element.x - 1}
            y={element.y - 1}
            width={element.width + 2}
            height={element.height + 2}
            rx={element.cornerRadius}
            ry={element.cornerRadius}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="6 3"
            pointerEvents="none"
          />
          {/* Resize handles */}
          {[
            { cx: element.x, cy: element.y },
            { cx: element.x + element.width, cy: element.y },
            { cx: element.x, cy: element.y + element.height },
            { cx: element.x + element.width, cy: element.y + element.height },
            { cx: element.x + element.width / 2, cy: element.y },
            { cx: element.x + element.width / 2, cy: element.y + element.height },
            { cx: element.x, cy: element.y + element.height / 2 },
            { cx: element.x + element.width, cy: element.y + element.height / 2 },
          ].map((pos, i) => (
            <circle
              key={i}
              cx={pos.cx}
              cy={pos.cy}
              r={4}
              fill="white"
              stroke="#6366f1"
              strokeWidth={2}
              pointerEvents="none"
            />
          ))}
        </>
      )}
    </g>
  )
}
