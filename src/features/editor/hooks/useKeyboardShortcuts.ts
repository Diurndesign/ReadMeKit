import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

export function useKeyboardShortcuts() {
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const copySelected = useEditorStore((s) => s.copySelected)
  const paste = useEditorStore((s) => s.paste)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const resetView = useUIStore((s) => s.resetView)
  const setEditingId = useUIStore((s) => s.setEditingId)
  const setShowShortcuts = useUIStore((s) => s.setShowShortcuts)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const primaryId = selectedIds[selectedIds.length - 1] ?? null

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        deleteSelected()
      }

      // Arrow keys — nudge (1px, or 8px with Shift)
      if (e.key.startsWith('Arrow') && selectedIds.length > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 8 : 1
        const { elements } = useEditorStore.getState()
        const moves = selectedIds.map((id) => {
          const el = elements.find((elem) => elem.id === id)
          if (!el || el.locked) return null
          return {
            id,
            x: el.x + (e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0),
            y: el.y + (e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0),
          }
        }).filter(Boolean) as { id: string; x: number; y: number }[]
        if (moves.length > 0) useEditorStore.getState().batchMoveElements(moves)
      }

      // Ctrl+D — duplicate primary element
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && primaryId) {
        e.preventDefault()
        duplicateElement(primaryId)
      }

      // Ctrl+C — copy selected
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault()
        copySelected()
      }

      // Ctrl+V — paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault()
        paste()
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
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (e.key === 'v' || e.key === 'V') setActiveTool('select')
        if (e.key === 'r' || e.key === 'R') setActiveTool('rect')
        if (e.key === 't' || e.key === 'T') setActiveTool('text')
        if (e.key === 'o' || e.key === 'O') setActiveTool('circle')
        if (e.key === 'l' || e.key === 'L') setActiveTool('line')
        if (e.key === 'i' || e.key === 'I') setActiveTool('image')
        if (e.key === '?') setShowShortcuts(true)
      }

      // Escape — deselect / exit editing / close modals
      if (e.key === 'Escape') {
        setEditingId(null)
        useEditorStore.getState().clearSelection()
        setActiveTool('select')
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedIds, deleteSelected, duplicateElement, copySelected, paste, setActiveTool, resetView, setEditingId, setShowShortcuts])
}
