import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'

const STORAGE_KEY = 'readmekit-canvas-v1'

/** Normalise a raw element from storage, filling in fields added in later versions */
function normalise(el: Record<string, unknown>) {
  return {
    visible: true,
    locked: false,
    rotation: 0,
    opacity: 1,
    ...el,
  }
}

export function useAutoSave() {
  useEffect(() => {
    // ── Load saved elements on mount ──────────────────────────────────────────
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        const elements = Array.isArray(data?.elements)
          ? data.elements.map(normalise)
          : []
        if (elements.length > 0) {
          // Pause Zundo so loading doesn't create an undo entry
          useEditorStore.temporal.getState().pause()
          useEditorStore.setState({ elements })
          useEditorStore.temporal.getState().resume()
          // Clear history so Ctrl+Z can't undo the load
          setTimeout(() => useEditorStore.temporal.getState().clear(), 0)
        }
      }
    } catch {
      // Ignore corrupt storage
    }

    // ── Auto-save debounced on every change ───────────────────────────────────
    let timer: ReturnType<typeof setTimeout>
    const unsub = useEditorStore.subscribe((state) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements: state.elements }))
        } catch {
          // Storage full or unavailable — silently ignore
        }
      }, 800)
    })

    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [])
}
