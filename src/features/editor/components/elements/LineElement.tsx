import { useResizeLineElement } from '../../hooks/useResizeLineElement'
import type { LineElement as LineElementType } from '../../types/elements'

interface Props {
  element: LineElementType
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

function dashArray(dash: LineElementType['strokeDash'], sw: number) {
  if (dash === 'dashed') return `${sw * 4} ${sw * 2}`
  if (dash === 'dotted') return `${sw} ${sw * 2}`
  return undefined
}

export function LineElementSVG({ element, isSelected, onPointerDown }: Props) {
  const { handleResizeStart } = useResizeLineElement()
  const { x, y, width: w, height: h, stroke, strokeWidth: sw } = element
  const x2 = x + w
  const y2 = y + h
  const markerId = `arrow-${element.id}`
  const da = dashArray(element.strokeDash, sw)

  return (
    <g style={{ opacity: element.opacity }}>
      {/* Arrow markers */}
      {(element.arrowEnd || element.arrowStart) && (
        <defs>
          <marker
            id={markerId}
            markerWidth={10} markerHeight={7}
            refX={9} refY={3.5}
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
          </marker>
        </defs>
      )}

      {/* Invisible hit area */}
      <line
        x1={x} y1={y} x2={x2} y2={y2}
        stroke="transparent"
        strokeWidth={Math.max(sw + 8, 12)}
        onPointerDown={onPointerDown}
        style={{ cursor: 'move' }}
      />

      {/* Visible line */}
      <line
        x1={x} y1={y} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth={sw}
        strokeDasharray={da}
        strokeLinecap="round"
        markerEnd={element.arrowEnd ? `url(#${markerId})` : undefined}
        markerStart={element.arrowStart ? `url(#${markerId})` : undefined}
        pointerEvents="none"
      />

      {isSelected && (
        <>
          {/* Start handle */}
          <circle
            cx={x} cy={y} r={5}
            fill="white" stroke="#6366f1" strokeWidth={2}
            style={{ cursor: 'crosshair' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              handleResizeStart(e, element.id, 'start', { x, y, width: w, height: h })
            }}
          />
          {/* End handle */}
          <circle
            cx={x2} cy={y2} r={5}
            fill="white" stroke="#6366f1" strokeWidth={2}
            style={{ cursor: 'crosshair' }}
            onPointerDown={(e) => {
              e.stopPropagation()
              handleResizeStart(e, element.id, 'end', { x, y, width: w, height: h })
            }}
          />
        </>
      )}
    </g>
  )
}
