/**
 * Génère le contenu Markdown d'un README.md complet.
 *
 * Logique purement fonctionnelle (pas d'import React, pas de side-effects)
 * → facilement testable avec Vitest.
 *
 * Structure générée :
 *   1. Commentaire d'attribution ReadMeKit
 *   2. Bannière SVG centrée (<p align="center"><img>)
 *   3. Liens cliquables (HTML dans Markdown — rendu par GitHub)
 *   4. Sections Markdown sélectionnées (Description, Installation, etc.)
 */

export interface ReadmeLink {
  label: string
  url: string
}

export interface ReadmeOpts {
  projectName: string
  /** Chemin vers le SVG de la bannière, relatif au README.md */
  bannerFile: string
  /** Map section-key → activée/désactivée */
  sections: Record<string, boolean>
  links: ReadmeLink[]
}

/** Définition ordonnée des sections avec leur activation par défaut */
export const README_SECTIONS = [
  { key: 'description',  label: 'Description',  defaultEnabled: true  },
  { key: 'installation', label: 'Installation', defaultEnabled: true  },
  { key: 'usage',        label: 'Usage',        defaultEnabled: true  },
  { key: 'features',     label: 'Features',     defaultEnabled: true  },
  { key: 'contributing', label: 'Contributing', defaultEnabled: false },
  { key: 'license',      label: 'License',      defaultEnabled: true  },
] as const

export type SectionKey = (typeof README_SECTIONS)[number]['key']

/** État initial des sections (utilisé dans uiStore et les tests) */
export const DEFAULT_SECTIONS: Record<string, boolean> = Object.fromEntries(
  README_SECTIONS.map(({ key, defaultEnabled }) => [key, defaultEnabled]),
)

/**
 * Transforme un nom lisible en nom de package npm valide.
 * "My Cool Project" → "my-cool-project"
 */
function toPackageName(name: string): string {
  return (name || 'mon-projet')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    || 'mon-projet'
}

export function buildReadmeString(opts: ReadmeOpts): string {
  const { projectName, bannerFile, sections, links } = opts
  const name = projectName.trim() || 'Mon Projet'
  const pkg = toPackageName(projectName)
  const validLinks = links.filter((l) => l.label.trim() && l.url.trim())
  const out: string[] = []

  // ── Attribution ──────────────────────────────────────────────────────────────
  out.push('<!-- Généré avec ReadMeKit — https://github.com/Diurndesign/ReadMeKit -->')
  out.push('')

  // ── Bannière centrée ─────────────────────────────────────────────────────────
  out.push('<p align="center">')
  out.push(`  <img src="${bannerFile}" alt="${name}" />`)
  out.push('</p>')
  out.push('')

  // ── Liens cliquables (HTML dans Markdown — fonctionnent sur GitHub) ──────────
  if (validLinks.length > 0) {
    out.push('<p align="center">')
    out.push('  ' + validLinks.map((l) => `<a href="${l.url}">${l.label}</a>`).join(' •\n  '))
    out.push('</p>')
    out.push('')
  }

  // ── Sections ─────────────────────────────────────────────────────────────────

  if (sections.description) {
    out.push('## Description')
    out.push('')
    out.push(`Description courte de ${name}.`)
    out.push('')
  }

  if (sections.installation) {
    out.push('## Installation')
    out.push('')
    out.push('```bash')
    out.push(`npm install ${pkg}`)
    out.push('```')
    out.push('')
  }

  if (sections.usage) {
    out.push('## Usage')
    out.push('')
    out.push('```typescript')
    out.push(`import { ... } from '${pkg}'`)
    out.push('```')
    out.push('')
  }

  if (sections.features) {
    out.push('## Features')
    out.push('')
    out.push('- Feature 1')
    out.push('- Feature 2')
    out.push('- Feature 3')
    out.push('')
  }

  if (sections.contributing) {
    out.push('## Contributing')
    out.push('')
    out.push('Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md).')
    out.push('')
  }

  if (sections.license) {
    out.push('## License')
    out.push('')
    out.push(`MIT © [${name}](https://github.com/)`)
    out.push('')
  }

  return out.join('\n').trimEnd() + '\n'
}
