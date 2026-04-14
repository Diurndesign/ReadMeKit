import { createRectElement, createTextElement, createCircleElement } from '../types/elements'
import type { EditorElement } from '../types/elements'
import { generateId } from '@/utils/generateId'

export interface Template {
  id: string
  name: string
  description: string
  preview: string // emoji or short label
  build: () => EditorElement[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'hero',
    name: 'Hero Banner',
    description: 'Bannière titre avec sous-titre',
    preview: '🚀',
    build: () => [
      createRectElement({ id: generateId(), x: 20, y: 20, width: 760, height: 200, fill: '#6366f1', cornerRadius: 16, stroke: 'transparent', strokeWidth: 0 }),
      createRectElement({ id: generateId(), x: 20, y: 20, width: 760, height: 200, fill: '#4338ca', cornerRadius: 16, opacity: 0.4, stroke: 'transparent', strokeWidth: 0 }),
      createTextElement({ id: generateId(), x: 20, y: 60, width: 760, height: 70, content: 'My Awesome Project', fontSize: 48, fontWeight: 700, fill: '#ffffff', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 20, y: 148, width: 760, height: 40, content: 'A short, powerful description of what this project does', fontSize: 18, fontWeight: 400, fill: '#c7d2fe', textAlign: 'center' }),
    ],
  },
  {
    id: 'features',
    name: 'Feature Grid',
    description: 'Grille de 3 fonctionnalités',
    preview: '⚡',
    build: () => [
      createRectElement({ id: generateId(), x: 20, y: 20, width: 220, height: 130, fill: '#1e1b4b', cornerRadius: 12, stroke: 'transparent', strokeWidth: 0 }),
      createRectElement({ id: generateId(), x: 260, y: 20, width: 220, height: 130, fill: '#14532d', cornerRadius: 12, stroke: 'transparent', strokeWidth: 0 }),
      createRectElement({ id: generateId(), x: 500, y: 20, width: 220, height: 130, fill: '#431407', cornerRadius: 12, stroke: 'transparent', strokeWidth: 0 }),
      createTextElement({ id: generateId(), x: 36, y: 36, width: 188, height: 32, content: '⚡ Fast', fontSize: 18, fontWeight: 700, fill: '#a5b4fc', textAlign: 'left' }),
      createTextElement({ id: generateId(), x: 276, y: 36, width: 188, height: 32, content: '🛡 Reliable', fontSize: 18, fontWeight: 700, fill: '#86efac', textAlign: 'left' }),
      createTextElement({ id: generateId(), x: 516, y: 36, width: 188, height: 32, content: '📈 Scalable', fontSize: 18, fontWeight: 700, fill: '#fdba74', textAlign: 'left' }),
      createTextElement({ id: generateId(), x: 36, y: 78, width: 188, height: 56, content: 'Blazing fast performance out of the box', fontSize: 13, fontWeight: 400, fill: '#c7d2fe', textAlign: 'left' }),
      createTextElement({ id: generateId(), x: 276, y: 78, width: 188, height: 56, content: '99.9% uptime with zero-downtime deploys', fontSize: 13, fontWeight: 400, fill: '#bbf7d0', textAlign: 'left' }),
      createTextElement({ id: generateId(), x: 516, y: 78, width: 188, height: 56, content: 'Grows with your project and team size', fontSize: 13, fontWeight: 400, fill: '#fed7aa', textAlign: 'left' }),
    ],
  },
  {
    id: 'badges',
    name: 'Tech Stack',
    description: 'Badges de technologies',
    preview: '🏷',
    build: () => {
      const stack = [
        { label: 'React', color: '#1d4ed8' },
        { label: 'TypeScript', color: '#0369a1' },
        { label: 'Node.js', color: '#15803d' },
        { label: 'GraphQL', color: '#7e22ce' },
        { label: 'Docker', color: '#0e7490' },
      ]
      return stack.flatMap(({ label, color }, i) => [
        createRectElement({ id: generateId(), x: 20 + i * 110, y: 20, width: 100, height: 34, fill: color, cornerRadius: 17, stroke: 'transparent', strokeWidth: 0 }),
        createTextElement({ id: generateId(), x: 20 + i * 110, y: 24, width: 100, height: 34, content: label, fontSize: 14, fontWeight: 600, fill: '#ffffff', textAlign: 'center' }),
      ])
    },
  },
  {
    id: 'stats',
    name: 'Stats Card',
    description: 'Carte de statistiques',
    preview: '📊',
    build: () => [
      createRectElement({ id: generateId(), x: 20, y: 20, width: 520, height: 130, fill: '#18181b', cornerRadius: 14, stroke: '#2e2e33', strokeWidth: 1 }),
      createTextElement({ id: generateId(), x: 36, y: 38, width: 146, height: 50, content: '10k+', fontSize: 38, fontWeight: 700, fill: '#6366f1', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 36, y: 95, width: 146, height: 28, content: 'GitHub Stars', fontSize: 13, fontWeight: 400, fill: '#71717a', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 202, y: 38, width: 146, height: 50, content: '500+', fontSize: 38, fontWeight: 700, fill: '#22c55e', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 202, y: 95, width: 146, height: 28, content: 'Contributors', fontSize: 13, fontWeight: 400, fill: '#71717a', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 368, y: 38, width: 146, height: 50, content: '99%', fontSize: 38, fontWeight: 700, fill: '#f59e0b', textAlign: 'center' }),
      createTextElement({ id: generateId(), x: 368, y: 95, width: 146, height: 28, content: 'Uptime', fontSize: 13, fontWeight: 400, fill: '#71717a', textAlign: 'center' }),
    ],
  },
  {
    id: 'contributors',
    name: 'Contributors',
    description: 'Section équipe / contributeurs',
    preview: '👥',
    build: () => {
      const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444']
      const names = ['Alice', 'Bob', 'Carol', 'Dave']
      const roles = ['Founder', 'Backend', 'Design', 'DevOps']
      return [
        createTextElement({ id: generateId(), x: 20, y: 20, width: 560, height: 44, content: 'Meet the Team', fontSize: 28, fontWeight: 700, fill: '#e4e4e7', textAlign: 'center' }),
        ...names.flatMap((name, i) => [
          createCircleElement({ id: generateId(), x: 20 + i * 140, y: 78, width: 80, height: 80, fill: colors[i] }),
          createTextElement({ id: generateId(), x: 12 + i * 140, y: 170, width: 96, height: 26, content: name, fontSize: 15, fontWeight: 600, fill: '#e4e4e7', textAlign: 'center' }),
          createTextElement({ id: generateId(), x: 12 + i * 140, y: 196, width: 96, height: 22, content: roles[i], fontSize: 12, fontWeight: 400, fill: '#71717a', textAlign: 'center' }),
        ]),
      ]
    },
  },
]
