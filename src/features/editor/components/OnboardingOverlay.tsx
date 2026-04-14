import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUIStore } from '../stores/uiStore'

interface Step {
  id: string
  title: string
  description: string
  target: string
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center'
  waitFor?: 'click-rect-tool' | 'click-canvas' | 'select-element' | 'drag-element' | 'change-property' | 'delete-element' | 'undo'
}

// Defined outside the component — never recreated, no stale closure risk
const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans ReadMeKit !',
    description: 'Cet éditeur te permet de créer visuellement des composants pour tes READMEs GitHub. Suis ce guide rapide pour découvrir les bases.',
    target: 'center',
    placement: 'center',
  },
  {
    id: 'toolbar',
    title: 'La barre d\'outils',
    description: 'Ici tu trouves les outils de dessin : Select (V), Rectangle (R), Texte (T) et Cercle (O). Ainsi que Undo/Redo, grille et Export SVG.',
    target: '[data-onboarding="toolbar"]',
    placement: 'bottom',
  },
  {
    id: 'try-rect',
    title: 'Crée ton premier rectangle',
    description: 'Clique sur l\'outil Rectangle dans la barre (ou appuie sur R). Le curseur va se transformer en croix.',
    target: '[data-onboarding="tool-rect"]',
    placement: 'bottom',
    waitFor: 'click-rect-tool',
  },
  {
    id: 'place-rect',
    title: 'Place-le sur le canvas',
    description: 'Maintenant, clique n\'importe où sur la zone sombre pour placer le rectangle.',
    target: '[data-onboarding="canvas"]',
    placement: 'top',
    waitFor: 'click-canvas',
  },
  {
    id: 'select',
    title: 'Sélectionne un élément',
    description: 'Clique sur le rectangle que tu viens de créer. Un contour indigo en pointillés apparaît, et le panneau de propriétés s\'ouvre à droite.',
    target: '[data-onboarding="canvas"]',
    placement: 'top',
    waitFor: 'select-element',
  },
  {
    id: 'properties',
    title: 'Le panneau de propriétés',
    description: 'Ici tu peux modifier la position (X, Y), la taille (W, H), la couleur, l\'opacité, le rayon des coins… Essaie de changer la couleur !',
    target: '[data-onboarding="panel"]',
    placement: 'left',
    waitFor: 'change-property',
  },
  {
    id: 'drag',
    title: 'Déplace par glisser-déposer',
    description: 'Clique sur un élément et maintiens le clic, puis déplace la souris pour le repositionner.',
    target: '[data-onboarding="canvas"]',
    placement: 'top',
    waitFor: 'drag-element',
  },
  {
    id: 'delete',
    title: 'Supprime un élément',
    description: 'Sélectionne un élément et appuie sur la touche Suppr (Delete) ou Backspace.',
    target: '[data-onboarding="canvas"]',
    placement: 'top',
    waitFor: 'delete-element',
  },
  {
    id: 'undo',
    title: 'Annule avec Ctrl+Z',
    description: 'Appuie sur Ctrl+Z (ou ⌘+Z sur Mac) pour annuler la suppression. L\'élément réapparaît !',
    target: '[data-onboarding="toolbar"]',
    placement: 'bottom',
    waitFor: 'undo',
  },
  {
    id: 'done',
    title: 'Tu es prêt !',
    description: 'Tu connais les bases de ReadMeKit. Crée des rectangles, textes et cercles, modifie leurs propriétés, et compose ton premier composant README. Raccourcis : R, T, O, Suppr, Ctrl+Z, Ctrl+D.',
    target: 'center',
    placement: 'center',
  },
]

const ONBOARDING_KEY = 'readmekit-onboarding-done'

export function OnboardingOverlay() {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)

  const elements = useEditorStore((s) => s.elements)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectedId = selectedIds[selectedIds.length - 1] ?? null
  const activeTool = useUIStore((s) => s.activeTool)

  // Guard: prevents multiple simultaneous advance() calls
  const isAdvancing = useRef(false)

  const prevElementCount = useRef(elements.length)
  const prevSelectedId = useRef(selectedId)
  const prevActiveTool = useRef(activeTool)
  const prevElements = useRef(elements)

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  // Position tooltip relative to the step's target element
  const positionTooltip = useCallback((stepIndex: number) => {
    const step = STEPS[stepIndex]
    if (!step) return

    const tooltipWidth = 380
    const tooltipHeight = 180
    const gap = 16

    if (step.target === 'center' || step.placement === 'center') {
      setSpotlightRect(null)
      setTooltipPos({
        top: window.innerHeight / 2 - tooltipHeight,
        left: window.innerWidth / 2 - tooltipWidth / 2,
      })
      return
    }

    const el = document.querySelector(step.target)
    if (!el) {
      setSpotlightRect(null)
      setTooltipPos({ top: window.innerHeight / 2 - tooltipHeight, left: window.innerWidth / 2 - tooltipWidth / 2 })
      return
    }

    const rect = el.getBoundingClientRect()
    setSpotlightRect(rect)

    let top = 0
    let left = 0
    switch (step.placement) {
      case 'bottom':
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'top':
        top = rect.top - tooltipHeight - gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - gap
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + gap
        break
    }

    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16))
    setTooltipPos({ top, left })
  }, [])

  // Reposition when step changes or window resizes
  useEffect(() => {
    if (!visible) return
    positionTooltip(currentStep)
    const onResize = () => positionTooltip(currentStep)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [visible, currentStep, positionTooltip])

  // Advance to next step — guarded against multiple simultaneous calls
  const scheduleAdvance = useCallback((delay = 300) => {
    if (isAdvancing.current) return
    isAdvancing.current = true
    setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
      isAdvancing.current = false
    }, delay)
  }, [])

  // Watch for user actions to auto-advance
  useEffect(() => {
    if (!visible) return
    const step = STEPS[currentStep]
    if (!step?.waitFor) return

    switch (step.waitFor) {
      case 'click-rect-tool':
        if (activeTool === 'rect' && prevActiveTool.current !== 'rect') scheduleAdvance()
        break
      case 'click-canvas':
        if (elements.length > prevElementCount.current) scheduleAdvance()
        break
      case 'select-element':
        if (selectedId && !prevSelectedId.current) scheduleAdvance()
        break
      case 'change-property': {
        if (selectedId && prevElements.current !== elements) {
          const prev = prevElements.current.find(e => e.id === selectedId)
          const curr = elements.find(e => e.id === selectedId)
          if (prev && curr && JSON.stringify(prev) !== JSON.stringify(curr)) {
            scheduleAdvance(400)
          }
        }
        break
      }
      case 'drag-element':
        if (selectedId) {
          const prev = prevElements.current.find(e => e.id === selectedId)
          const curr = elements.find(e => e.id === selectedId)
          if (prev && curr && (prev.x !== curr.x || prev.y !== curr.y)) scheduleAdvance()
        }
        break
      case 'delete-element':
        if (elements.length < prevElementCount.current) scheduleAdvance()
        break
      case 'undo':
        if (elements.length > prevElementCount.current) scheduleAdvance()
        break
    }

    prevElementCount.current = elements.length
    prevSelectedId.current = selectedId
    prevActiveTool.current = activeTool
    prevElements.current = elements
  }, [elements, selectedId, activeTool, currentStep, visible, scheduleAdvance])

  const finish = useCallback(() => {
    setVisible(false)
    try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch { /* noop */ }
  }, [])

  if (!visible) return null

  const step = STEPS[currentStep]
  if (!step) return null  // safety guard: never render with out-of-bounds step

  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0
  const hasWaitFor = !!step.waitFor

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left - 8}
                  y={spotlightRect.top - 8}
                  width={spotlightRect.width + 16}
                  height={spotlightRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#spotlight-mask)" />
          {spotlightRect && (
            <rect
              x={spotlightRect.left - 8}
              y={spotlightRect.top - 8}
              width={spotlightRect.width + 16}
              height={spotlightRect.height + 16}
              rx="12"
              fill="none"
              stroke="rgba(99,102,241,0.5)"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 9999,
          width: 380,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            background: '#1c1c20',
            border: '1px solid #3f3f46',
            borderRadius: 16,
            padding: '24px 28px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
          }}
        >
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 4,
                  borderRadius: 2,
                  background: i <= currentStep ? '#6366f1' : '#3f3f46',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
            {step.title}
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.6, color: '#a1a1aa', fontFamily: 'system-ui, sans-serif' }}>
            {step.description}
          </p>

          {/* Waiting indicator */}
          {hasWaitFor && !isLast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 12,
                color: '#818cf8',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              <span style={{ animation: 'pulse 2s infinite', display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
              En attente de ton action…
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isLast && (
              <button
                onClick={finish}
                style={{ padding: '8px 16px', border: '1px solid #3f3f46', borderRadius: 8, background: 'transparent', color: '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
              >
                Passer le guide
              </button>
            )}
            <div style={{ flex: 1 }} />
            {!hasWaitFor && !isLast && (
              <button
                onClick={() => scheduleAdvance(0)}
                style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#6366f1', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
              >
                {isFirst ? 'Commencer' : 'Suivant'}
              </button>
            )}
            {isLast && (
              <button
                onClick={finish}
                style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: '#6366f1', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
              >
                C'est parti !
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </>
  )
}
