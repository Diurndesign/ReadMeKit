import { useState, useRef } from 'react'
import {
  Square, Circle, Type, Eye, EyeOff, Lock, LockOpen, Trash2,
  Minus, Image, Link2, ChevronUp, ChevronDown,
} from 'lucide-react'
import { useEditorStore } from '../stores/editorStore'
import { cn } from '@/utils/cn'
import type { EditorElement } from '../types/elements'

function typeIcon(type: string) {
  if (type === 'rect') return <Square size={12} />
  if (type === 'circle') return <Circle size={12} />
  if (type === 'line') return <Minus size={12} />
  if (type === 'image') return <Image size={12} />
  return <Type size={12} />
}

function defaultName(el: EditorElement, index: number): string {
  if (el.name) return el.name
  const labels: Record<string, string> = { rect: 'Rect', circle: 'Circle', text: 'Text', line: 'Line', image: 'Image' }
  return `${labels[el.type] ?? el.type} ${index + 1}`
}

export function LayerPanel() {
  const elements = useEditorStore((s) => s.elements)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectElement = useEditorStore((s) => s.selectElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const toggleElementVisibility = useEditorStore((s) => s.toggleElementVisibility)
  const toggleElementLock = useEditorStore((s) => s.toggleElementLock)
  const renameElement = useEditorStore((s) => s.renameElement)
  const bringForward = useEditorStore((s) => s.bringForward)
  const sendBackward = useEditorStore((s) => s.sendBackward)
  const reorderElement = useEditorStore((s) => s.reorderElement)

  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [nameInputValue, setNameInputValue] = useState('')

  // Drag-and-drop state
  const dragId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null)

  // Show in reverse order (top layer first in the panel)
  const reversed = [...elements].reverse()

  const startRename = (el: EditorElement, originalIndex: number) => {
    setEditingNameId(el.id)
    setNameInputValue(el.name ?? defaultName(el, originalIndex))
  }

  const commitRename = (id: string) => {
    if (nameInputValue.trim()) renameElement(id, nameInputValue.trim())
    setEditingNameId(null)
  }

  // ── Drag-and-drop handlers ────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
    // Transparent ghost image
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:fixed;top:-999px;width:1px;height:1px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    setDragOverId(id)
    setDropPosition(e.clientY < midY ? 'above' : 'below')
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = dragId.current
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null); setDropPosition(null)
      return
    }

    // reversed[] is top-to-bottom in the panel (highest z first)
    // elements[] is bottom-to-top (lowest z first, highest z last)
    const targetOriginalIdx = elements.findIndex((el) => el.id === targetId)
    const adjustedIdx = dropPosition === 'above'
      ? targetOriginalIdx + 1   // above in panel = higher z = larger index in elements[]
      : targetOriginalIdx        // below in panel = lower z

    reorderElement(sourceId, adjustedIdx)
    setDragOverId(null)
    setDropPosition(null)
    dragId.current = null
  }

  const handleDragEnd = () => {
    dragId.current = null
    setDragOverId(null)
    setDropPosition(null)
  }

  return (
    <div className="w-48 border-r border-[#2e2e33] bg-[#18181b] flex flex-col shrink-0">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#2e2e33] flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest">
          Calques
        </span>
        <span className="text-[10px] text-[#3f3f46]">{elements.length}</span>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto">
        {reversed.length === 0 ? (
          <p className="text-[11px] text-[#3f3f46] px-3 py-4 text-center leading-relaxed">
            Aucun élément sur le canvas
          </p>
        ) : (
          reversed.map((el, reversedIndex) => {
            const originalIndex = elements.length - 1 - reversedIndex
            const isSelected = selectedIds.includes(el.id)
            const isHidden = el.visible === false
            const isLocked = el.locked
            const isDragTarget = dragOverId === el.id

            return (
              <div
                key={el.id}
                draggable
                onDragStart={(e) => handleDragStart(e, el.id)}
                onDragOver={(e) => handleDragOver(e, el.id)}
                onDrop={(e) => handleDrop(e, el.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'group relative flex items-center gap-1.5 px-2 py-1.5 cursor-grab active:cursor-grabbing border-b border-[#1c1c1f] transition-colors select-none',
                  isSelected
                    ? 'bg-[#6366f1]/15 border-l-2 border-l-[#6366f1]'
                    : 'hover:bg-[#27272a] border-l-2 border-l-transparent',
                  isHidden && 'opacity-40',
                )}
                onClick={() => selectElement(el.id)}
              >
                {/* Drop indicator — above */}
                {isDragTarget && dropPosition === 'above' && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#6366f1] z-10 pointer-events-none" />
                )}
                {/* Drop indicator — below */}
                {isDragTarget && dropPosition === 'below' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1] z-10 pointer-events-none" />
                )}

                {/* Group indicator */}
                {el.groupId && (
                  <span title="Groupé" className="shrink-0 text-[#6366f1]/60">
                    <Link2 size={9} />
                  </span>
                )}

                {/* Type icon */}
                <span className={cn(
                  'shrink-0',
                  isSelected ? 'text-[#818cf8]' : 'text-[#52525b]',
                )}>
                  {typeIcon(el.type)}
                </span>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  {editingNameId === el.id ? (
                    <input
                      autoFocus
                      value={nameInputValue}
                      onChange={(e) => setNameInputValue(e.target.value)}
                      onBlur={() => commitRename(el.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(el.id)
                        if (e.key === 'Escape') setEditingNameId(null)
                        e.stopPropagation()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[11px] bg-[#0f0f11] border border-[#6366f1] rounded px-1 py-0 text-white focus:outline-none"
                    />
                  ) : (
                    <span
                      className={cn(
                        'text-[11px] truncate block',
                        isSelected ? 'text-[#e4e4e7]' : 'text-[#a1a1aa]',
                      )}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        startRename(el, originalIndex)
                      }}
                      title="Double-clic pour renommer"
                    >
                      {defaultName(el, originalIndex)}
                    </span>
                  )}
                </div>

                {/* Action buttons (visible on hover / when selected) */}
                <div className={cn(
                  'flex items-center gap-0.5 shrink-0',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  isSelected && 'opacity-100',
                )}>
                  {/* Move up / down in z-order */}
                  <button
                    title="Monter"
                    onClick={(e) => { e.stopPropagation(); bringForward(el.id) }}
                    disabled={originalIndex === elements.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-[#a1a1aa] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={11} />
                  </button>
                  <button
                    title="Descendre"
                    onClick={(e) => { e.stopPropagation(); sendBackward(el.id) }}
                    disabled={originalIndex === 0}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-[#a1a1aa] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={11} />
                  </button>

                  {/* Visibility */}
                  <button
                    title={isHidden ? 'Afficher' : 'Masquer'}
                    onClick={(e) => { e.stopPropagation(); toggleElementVisibility(el.id) }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                  >
                    {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>

                  {/* Lock */}
                  <button
                    title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
                    onClick={(e) => { e.stopPropagation(); toggleElementLock(el.id) }}
                    className={cn(
                      'w-5 h-5 flex items-center justify-center rounded transition-colors',
                      isLocked ? 'text-[#f59e0b]' : 'text-[#52525b] hover:text-[#a1a1aa]',
                    )}
                  >
                    {isLocked ? <Lock size={11} /> : <LockOpen size={11} />}
                  </button>

                  {/* Delete */}
                  <button
                    title="Supprimer"
                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id) }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] hover:text-[#f87171] transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
