import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const resetView = useUIStore((s) => s.resetView)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // Don't capture shortcuts when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Delete / Backspace -> delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteElement(selectedId)
      }

      // Ctrl+D -> duplicate selected element
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedId) {
        e.preventDefault()
        duplicateElement(selectedId)
      }

      // Ctrl+Z -> undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
      }

      // Ctrl+Shift+Z -> redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
      }

      // Ctrl+Y -> redo (alternative)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
      }

      // Ctrl+0 -> reset view
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        resetView()
      }

      // V -> select tool
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select')
      }

      // R -> rectangle tool
      if (e.key === 'r' || e.key === 'R') {
        setActiveTool('rect')
      }

      // T -> text tool
      if (e.key === 't' || e.key === 'T') {
        setActiveTool('text')
      }

      // O -> circle tool
      if (e.key === 'o' || e.key === 'O') {
        setActiveTool('circle')
      }

      // Escape -> deselect
      if (e.key === 'Escape') {
        useEditorStore.getState().selectElement(null)
        setActiveTool('select')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, deleteElement, duplicateElement, setActiveTool, resetView])
}
