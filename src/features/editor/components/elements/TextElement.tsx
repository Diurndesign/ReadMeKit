import type { TextElement as TextElementType } from '../../types/elements'

interface Props {
  element: TextElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function TextElementSVG({ element, isSelected, onPointerDown }: Props) {
  const textAnchor =
    element.textAlign === 'center'
      ? 'middle'
      : element.textAlign === 'right'
        ? 'end'
        : 'start'

  const textX =
    element.textAlign === 'center'
      ? element.x + element.width / 2
      : element.textAlign === 'right'
        ? element.x + element.width
        : element.x

  return (
    <g
      onPointerDown={onPointerDown}
      style={{ cursor: 'move', opacity: element.opacity }}
    >
      <text
        x={textX}
        y={element.y + element.fontSize}
        width={element.width}
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
            x={element.x - 2}
            y={element.y - 2}
            width={element.width + 4}
            height={element.height + 4}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            pointerEvents="none"
          />
          {[
            { cx: element.x, cy: element.y },
            { cx: element.x + element.width, cy: element.y },
            { cx: element.x, cy: element.y + element.height },
            { cx: element.x + element.width, cy: element.y + element.height },
          ].map((pos, i) => (
            <circle
              key={i}
              cx={pos.cx}
              cy={pos.cy}
              r={3.5}
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
