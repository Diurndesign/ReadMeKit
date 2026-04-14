import { EditorCanvas } from '@/features/editor/components/EditorCanvas'
import { EditorToolbar } from '@/features/editor/components/EditorToolbar'
import { PropertyPanel } from '@/features/editor/components/PropertyPanel'
import { OnboardingOverlay } from '@/features/editor/components/OnboardingOverlay'
import { TemplatesPanel } from '@/features/editor/components/TemplatesPanel'
import { useKeyboardShortcuts } from '@/features/editor/hooks/useKeyboardShortcuts'

export default function App() {
  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f11]">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        <EditorCanvas />
        <PropertyPanel />
      </div>
      <OnboardingOverlay />
      <TemplatesPanel />
    </div>
  )
}
