import type { EditorElement } from '../types/elements'
import { RectElementSVG } from './elements/RectElement'
import { TextElementSVG } from './elements/TextElement'
import { CircleElementSVG } from './elements/CircleElement'
import { LineElementSVG } from './elements/LineElement'
import { ImageElementSVG } from './elements/ImageElement'

interface Props {
  element: EditorElement
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function ElementRenderer({ element, isSelected, onPointerDown }: Props) {
  if (element.visible === false) return null

  switch (element.type) {
    case 'rect':
      return <RectElementSVG element={element} isSelected={isSelected} onPointerDown={onPointerDown} />
    case 'text':
      return <TextElementSVG element={element} isSelected={isSelected} onPointerDown={onPointerDown} />
    case 'circle':
      return <CircleElementSVG element={element} isSelected={isSelected} onPointerDown={onPointerDown} />
    case 'line':
      return <LineElementSVG element={element} isSelected={isSelected} onPointerDown={onPointerDown} />
    case 'image':
      return <ImageElementSVG element={element} isSelected={isSelected} onPointerDown={onPointerDown} />
    default:
      return null
  }
}
