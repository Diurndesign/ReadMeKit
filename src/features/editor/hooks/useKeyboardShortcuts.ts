import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const resetView = useUIStore((s) => s.resetView)
  const setEditingId = useUIStore((s) => s.setEditingId)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const primaryId = selectedIds[selectedIds.length - 1] ?? null

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        deleteSelected()
      }

      // Ctrl+D — duplicate primary element
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && primaryId) {
        e.preventDefault()
        duplicateElement(primaryId)
      }

      // Ctrl+Z — undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
      }

      // Ctrl+Shift+Z / Ctrl+Y — redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
      }

      // Ctrl+0 — reset view
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        resetView()
      }

      // Ctrl+A — select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        const ids = useEditorStore.getState().elements.map((el) => el.id)
        useEditorStore.getState().selectElements(ids)
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') setActiveTool('select')
      if (e.key === 'r' || e.key === 'R') setActiveTool('rect')
      if (e.key === 't' || e.key === 'T') setActiveTool('text')
      if (e.key === 'o' || e.key === 'O') setActiveTool('circle')

      // Escape — deselect / exit editing
      if (e.key === 'Escape') {
        setEditingId(null)
        useEditorStore.getState().clearSelection()
        setActiveTool('select')
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedIds, deleteSelected, duplicateElement, setActiveTool, resetView, setEditingId])
}
