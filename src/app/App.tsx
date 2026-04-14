import { EditorCanvas } from '@/features/editor/components/EditorCanvas'
import { EditorToolbar } from '@/features/editor/components/EditorToolbar'
import { PropertyPanel } from '@/features/editor/components/PropertyPanel'
import { LayerPanel } from '@/features/editor/components/LayerPanel'
import { OnboardingOverlay } from '@/features/editor/components/OnboardingOverlay'
import { TemplatesPanel } from '@/features/editor/components/TemplatesPanel'
import { ShortcutsModal } from '@/features/editor/components/ShortcutsModal'
import { ExportDialog } from '@/features/editor/components/ExportDialog'
import { useKeyboardShortcuts } from '@/features/editor/hooks/useKeyboardShortcuts'
import { useAutoSave } from '@/features/editor/hooks/useAutoSave'

export default function App() {
  useKeyboardShortcuts()
  useAutoSave()

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11]">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        <LayerPanel />
        <EditorCanvas />
        <PropertyPanel />
      </div>
      <OnboardingOverlay />
      <TemplatesPanel />
      <ShortcutsModal />
      <ExportDialog />
    </div>
  )
}
