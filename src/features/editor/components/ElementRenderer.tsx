import type { EditorElement } from '../types/elements'
import { RectElementSVG } from './elements/RectElement'
import { TextElementSVG } from './elements/TextElement'

interface Props {
  element: EditorElement
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function ElementRenderer({ element, isSelected, onPointerDown }: Props) {
  switch (element.type) {
    case 'rect':
      return (
        <RectElementSVG
          element={element}
          isSelected={isSelected}
          onPointerDown={onPointerDown}
        />
      )
    case 'text':
      return (
        <TextElementSVG
          element={element}
          isSelected={isSelected}
          onPointerDown={onPointerDown}
        />
      )
    default:
      return null
  }
}
