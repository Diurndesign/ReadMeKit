import { useState, useEffect } from 'react'
import { MousePointer2, Square, Type, Undo2, Redo2, Grid3X3 } from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore, type ActiveTool } from '../stores/uiStore'
import { cn } from '@/utils/cn'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  isActive?: boolean
  onClick: () => void
}

function ToolButton({ icon, label, shortcut, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        isActive
          ? 'bg-[#6366f1] text-white'
          : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
      )}
    >
      {icon}
    </button>
  )
}

export function EditorToolbar() {
  const activeTool = useUIStore((s) => s.activeTool)
  const setActiveTool = useUIStore((s) => s.setActiveTool)
  const showGrid = useUIStore((s) => s.showGrid)
  const toggleGrid = useUIStore((s) => s.toggleGrid)

  // Subscribe to temporal store changes for reactive undo/redo buttons
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const unsubscribe = useEditorStore.temporal.getState !== undefined
      ? useEditorStore.temporal.subscribe((state) => {
          setCanUndo(state.pastStates.length > 0)
          setCanRedo(state.futureStates.length > 0)
        })
      : () => {}
    return unsubscribe
  }, [])

  const tools: { tool: ActiveTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { tool: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
    { tool: 'rect', icon: <Square size={18} />, label: 'Rectangle', shortcut: 'R' },
    { tool: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
  ]

  return (
    <div data-onboarding="toolbar" className="flex items-center gap-1 px-3 py-2 border-b border-[#2e2e33] bg-[#18181b]">
      {/* Drawing tools */}
      <div className="flex items-center gap-0.5 mr-3">
        {tools.map(({ tool, icon, label, shortcut }) => (
          <div key={tool} data-onboarding={`tool-${tool}`}>
            <ToolButton
              icon={icon}
              label={label}
              shortcut={shortcut}
              isActive={activeTool === tool}
              onClick={() => setActiveTool(tool)}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 mx-1">
        <button
          onClick={() => useEditorStore.temporal.getState().undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            canUndo
              ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
              : 'text-[#3f3f46] cursor-not-allowed'
          )}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => useEditorStore.temporal.getState().redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
            canRedo
              ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
              : 'text-[#3f3f46] cursor-not-allowed'
          )}
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#2e2e33] mx-1" />

      {/* Grid toggle */}
      <ToolButton
        icon={<Grid3X3 size={18} />}
        label="Toggle Grid"
        isActive={showGrid}
        onClick={toggleGrid}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* App name */}
      <span className="text-sm font-semibold text-[#a1a1aa] tracking-wide select-none">
        ReadMeKit
      </span>
    </div>
  )
}
