import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import type { ImageElement as ImageElementType } from '../../types/elements'

interface Props {
  element: ImageElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function ImageElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const { x, y, width: w, height: h } = element

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
      {element.src ? (
        <image
          href={element.src}
          x={x} y={y} width={w} height={h}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        /* Placeholder when no URL */
        <>
          <rect x={x} y={y} width={w} height={h} fill="#27272a" rx={4} />
          <text
            x={x + w / 2}
            y={y + h / 2 + 5}
            textAnchor="middle"
            fontSize={13}
            fill="#52525b"
            fontFamily="system-ui, sans-serif"
            pointerEvents="none"
          >
            Image URL…
          </text>
        </>
      )}

      {isSelected && (
        <>
          <rect
            x={x - 1} y={y - 1} width={w + 2} height={h + 2}
            fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 3"
            pointerEvents="none"
          />
          {handles.map(({ handle, cx, cy }) => (
            <circle
              key={handle}
              cx={cx} cy={cy} r={4}
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
