import { useResizeElement, CURSOR_MAP, type ResizeHandle } from '../../hooks/useResizeElement'
import { useRotateElement } from '../../hooks/useRotateElement'
import type { ImageElement as ImageElementType } from '../../types/elements'

interface Props {
  element: ImageElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function ImageElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeElement()
  const { handleRotateStart } = useRotateElement()
  const { x, y, width: w, height: h } = element
  const cx = x + w / 2
  const cy = y + h / 2
  const rotation = element.rotation ?? 0

  const handles: { handle: ResizeHandle; hx: number; hy: number }[] = [
    { handle: 'nw', hx: x, hy: y },
    { handle: 'n', hx: cx, hy: y },
    { handle: 'ne', hx: x + w, hy: y },
    { handle: 'e', hx: x + w, hy: cy },
    { handle: 'se', hx: x + w, hy: y + h },
    { handle: 's', hx: cx, hy: y + h },
    { handle: 'sw', hx: x, hy: y + h },
    { handle: 'w', hx: x, hy: cy },
  ]

  return (
    <g
      transform={rotation !== 0 ? `rotate(${rotation}, ${cx}, ${cy})` : undefined}
      onPointerDown={onPointerDown}
      style={{ cursor: 'move', opacity: element.opacity }}
    >
      {element.src ? (
        <image
          href={element.src}
          x={x} y={y} width={w} height={h}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} fill="#27272a" rx={4} />
          <text
            x={cx} y={cy + 5}
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
          {handles.map(({ handle, hx, hy }) => (
            <circle
              key={handle} cx={hx} cy={hy} r={4}
              fill="white" stroke="#6366f1" strokeWidth={2}
              style={{ cursor: CURSOR_MAP[handle] }}
              onPointerDown={(e) => {
                e.stopPropagation()
                handleResizeStart(e, element.id, handle, { x, y, width: w, height: h })
              }}
            />
          ))}
          {/* Rotation handle */}
          <line x1={cx} y1={y - 22} x2={cx} y2={y}
            stroke="#6366f1" strokeWidth={1.5} pointerEvents="none" />
          <circle
            cx={cx} cy={y - 22} r={5}
            fill="#6366f1" stroke="white" strokeWidth={1.5}
            style={{ cursor: 'alias' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              handleRotateStart(e, element.id, cx, cy, rotation)
            }}
          />
        </>
      )}
    </g>
  )
}
