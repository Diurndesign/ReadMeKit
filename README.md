<p align="center">
  <img src="https://img.shields.io/badge/status-Phase%207%20UX-6366f1?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/stack-React%2019%20%2B%20TypeScript%20%2B%20Vite-3b82f6?style=flat-square" alt="Stack" />
  <img src="https://img.shields.io/badge/cost-%240%2Fmonth-22c55e?style=flat-square" alt="Cost" />
  <img src="https://img.shields.io/badge/license-MIT-a1a1aa?style=flat-square" alt="License" />
</p>

<h1 align="center">ReadMeKit</h1>

<p align="center">
  <strong>Editeur visuel dans le navigateur pour creer de beaux composants README.</strong><br />
  Bannieres heros, grilles de fonctionnalites, diagrammes, sections contributeurs — exportables en SVG et PNG.
</p>

---

## Le probleme

Creer un README soigne sur GitHub est penible. Les developpeurs assemblent 4 a 5 outils separes (capsule-render, shields.io, github-readme-stats, readme.so) aux styles incompatibles. Le resultat : des READMEs qui ressemblent a un collage.

**ReadMeKit est l'editeur visuel unifie qui manquait.**

---

## Demarrage rapide

```bash
git clone https://github.com/Diurndesign/ReadMeKit.git
cd ReadMeKit
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173). L'onboarding interactif guide le premier lancement.

---

## Fonctionnalites implementees

### Elements

| Type | Raccourci | Proprietes |
|---|---|---|
| Rectangle | `R` | Position, taille, **rotation**, remplissage solide ou degrade, bordure, rayon des coins, opacite |
| Texte | `T` | Contenu, typographie, **famille de police**, alignement, couleur, fond de texte, **rotation**, opacite |
| Cercle / Ellipse | `O` | Remplissage solide ou degrade, bordure, **rotation**, opacite |
| Ligne / Fleche | `L` | Trait (couleur, epaisseur, style), fleches debut/fin, style (solid/dashed/dotted) |
| Image URL | `I` | Image distante par URL, redimensionnable, **rotation** |

Tous les elements ont : `locked`, `visible`, `name`, `rotation`.

### Canvas

- **Zoom** — molette souris ou boutons +/- ; indicateur de pourcentage cliquable (reset)
- **Pan** — Espace + glisser, ou glisser sur zone vide en mode Select
- **Grille** — grille de points 20px, toggle bouton ; quand active, sert de reference visuelle
- **Snap-to-grid 8px** — drag et resize alignes sur grille de 8px quand la grille est activee
- **Fond** — couleur de fond du canvas configurable (section Canvas dans le panneau de proprietes)
- **Taille fixee** — presets Auto / GitHub Banner 800x200 / Large Banner 1200x300 / Social Card 1200x630 / Square 500x500
- **Reset vue** — `Ctrl+0` ou bouton Maximize
- **Sauvegarde auto** — elements sauvegardes dans localStorage toutes les 800ms (debouncee)

### Selection et manipulation

| Action | Comment faire |
|---|---|
| Selectionner | Clic sur l'element |
| Multi-selectionner | Shift+clic pour ajouter/retirer |
| Selection marquee | Glisser sur zone vide |
| Tout selectionner | `Ctrl+A` |
| Deplacer | Glisser (snap-to-grid si grille active) |
| Deplacer au pixel | Touches fleches (1px) ou Shift+fleches (8px) |
| Redimensionner | 8 poignees autour de l'element |
| Proportions fixes | Shift pendant redimensionnement (poignees) |
| Faire pivoter | Poignee bleue au-dessus de l'element (Shift = snap 15°) |
| Dupliquer | `Ctrl+D` |
| Copier | `Ctrl+C` |
| Coller | `Ctrl+V` (avec decalage +20px) |
| Supprimer | `Delete` / `Backspace` |
| Annuler | `Ctrl+Z` (50 etapes) |
| Retablir | `Ctrl+Shift+Z` |
| Edition texte inline | Double-clic sur un element texte |

### Panel calques (sidebar gauche)

- Liste tous les calques (couche superieure en premier)
- **Clic** — selectionner le calque
- **Double-clic** sur le nom — renommer inline
- **Icone oeil** — masquer/afficher
- **Icone cadenas** — verrouiller/deverrouiller
- **Icone poubelle** — supprimer

### Panneau de proprietes (sidebar droite)

- **Vide** — aide + reglages du canvas (fond)
- **Multi-selection** — outils d'alignement (6 directions), distribution egale (H/V si 3+ elements), suppression groupe
- **Element unique** — toutes les proprietes communes (position, taille, rotation, opacite) + proprietes specifiques :
  - Rectangle / Cercle : remplissage solide ou degrade (couleur debut, couleur fin, angle 0-360)
  - Texte : typographie, famille de police (5 options), alignement, fond de texte (couleur, padding, radius)
  - Ligne : couleur, epaisseur, style trait, fleches debut/fin
  - Image : URL de l'image distante
- **Palettes de couleurs** — 12 couleurs de base accessibles en un clic sous chaque selecteur de couleur

### Templates

8 templates prets a l'emploi accessibles via le bouton **Templates** :

| Template | Description |
|---|---|
| Hero Banner | Banniere titre + sous-titre sur fond indigo |
| Gradient Hero | Banniere avec degrade indigo → rose |
| Feature Grid | Grille de 3 cartes de fonctionnalites |
| Architecture | Diagramme de flux Client → API → Database avec fleches |
| Tech Stack | Badges de technologies colores |
| Stats Card | Carte de statistiques (stars, contributeurs, uptime) |
| Changelog | Tableau des dernieres versions avec labels colores |
| Contributors | Section equipe avec avatars cercles et roles |

### Export

Bouton **Export** avec dropdown :

| Format | Details |
|---|---|
| Telecharger SVG | Fichier `.svg` compatible GitHub |
| Copier SVG | Copier le code SVG dans le presse-papier |
| Copier Markdown | Copier `![Banner](./readmekit-export.svg)` pret a coller |
| PNG x2 (Retina) | Rendu a 2x la resolution |
| PNG x1 | Rendu a resolution native |

### Raccourcis clavier

| Raccourci | Action |
|---|---|
| `V` | Outil Select |
| `R` | Outil Rectangle |
| `T` | Outil Texte |
| `O` | Outil Cercle |
| `L` | Outil Ligne / Fleche |
| `I` | Outil Image |
| `Ctrl+Z` | Annuler (50 etapes) |
| `Ctrl+Shift+Z` | Retablir |
| `Ctrl+D` | Dupliquer |
| `Ctrl+C` | Copier |
| `Ctrl+V` | Coller |
| `Ctrl+A` | Tout selectionner |
| `Delete` / `Backspace` | Supprimer |
| `Escape` | Deselectionner / fermer |
| `Ctrl+0` | Reset zoom et pan |
| Fleches | Deplacer de 1px |
| `Shift`+Fleches | Deplacer de 8px |
| `Shift` (poignee resize) | Proportions fixes pendant resize |
| `Shift` (poignee rotation) | Snap a 15° pendant rotation |
| `?` | Afficher le panneau des raccourcis |

---

## Stack technique

| Couche | Technologie | Pourquoi |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Rapide, typage strict, HMR |
| Editeur | SVG natif React | WYSIWYG : le rendu editeur = l'export |
| Etat | Zustand + Immer + Zundo | Simple, performant, undo/redo 50 etapes |
| Styles | Tailwind CSS v4 | Utility-first, zero runtime |
| Icones | Lucide React | Coherence visuelle, pas d'emojis |
| Hebergement | Cloudflare Pages (prevu) | Gratuit, edge global |
| BDD / Auth | Supabase (prevu) | Gratuit tier genereux, auth + storage |

---

## Architecture

Le projet suit le pattern **Bulletproof React** — organisation par fonctionnalite.

```
src/
├── app/
│   └── App.tsx                       # Coquille principale
├── features/
│   └── editor/
│       ├── components/
│       │   ├── EditorCanvas.tsx          # Canvas SVG, zoom/pan, marquee, placement
│       │   ├── EditorToolbar.tsx         # Outils, undo/redo, zoom, export, buildSvgString
│       │   ├── LayerPanel.tsx            # Sidebar gauche : calques
│       │   ├── PropertyPanel.tsx         # Sidebar droite : proprietes
│       │   ├── ElementRenderer.tsx       # Switch type → composant SVG
│       │   ├── ShortcutsModal.tsx        # Modal raccourcis clavier (?)
│       │   ├── OnboardingOverlay.tsx     # Guide interactif premier lancement
│       │   ├── TemplatesPanel.tsx        # Modal selection templates
│       │   └── elements/
│       │       ├── RectElement.tsx       # <rect> + degrade + 8 poignees
│       │       ├── TextElement.tsx       # <text> + fond + edition inline
│       │       ├── CircleElement.tsx     # <ellipse> + degrade + 8 poignees
│       │       ├── LineElement.tsx       # <line> + fleches + 2 poignees
│       │       └── ImageElement.tsx      # <image> + 8 poignees
│       ├── data/
│       │   └── templates.ts              # 8 templates avec factory build()
│       ├── hooks/
│       │   ├── useAutoSave.ts            # Sauvegarde localStorage debouncee
│       │   ├── useDragElement.ts         # Drag + snap-to-grid + multi-drag
│       │   ├── useResizeElement.ts       # 8 poignees + snap + Shift aspect ratio
│       │   ├── useResizeLineElement.ts   # 2 poignees start/end pour les lignes
│       │   └── useKeyboardShortcuts.ts   # Tous les raccourcis
│       ├── stores/
│       │   ├── editorStore.ts            # Elements, selection, clipboard, CRUD, undo/redo
│       │   └── uiStore.ts                # Outil actif, zoom, pan, grille, modales
│       └── types/
│           └── elements.ts               # BaseElement + 5 types avec factories
└── utils/
    ├── cn.ts                             # clsx + tailwind-merge
    └── generateId.ts                     # nanoid court
```

---

## Roadmap

- [x] **Phase 1** — Fondations : canvas SVG, elements rect/text/circle, proprietes, undo/redo, onboarding
- [x] **Phase 2** — Interactions : redimensionnement 8 poignees, zoom/pan, multi-selection, edition inline, templates, Ctrl+D
- [x] **Phase 3** — Outils : panel calques (visibilite, verrouillage, renommage), snap-to-grid
- [x] **Phase 4** — Persistence : sauvegarde auto localStorage, fond canvas, alignement/distribution, export SVG/PNG
- [x] **Phase 5** — Elements avances : Ligne/Fleche (dessin click+drag), Image URL, presets canvas, export complet
- [x] **Phase 6** — Finitions : Copier/Coller Ctrl+C/V, degrades sur rect/cercle, fond texte, proportions fixes (Shift), modal raccourcis (?), 3 nouveaux templates (Gradient Hero, Architecture, Changelog), Copier Markdown
- [ ] **Phase 7** — Comptes : auth Supabase, sauvegarde cloud, dashboard projets
- [ ] **Phase 8** — Lancement : landing page, analytics, monetisation, ProductHunt

---

## Contribuer

```bash
# Branche de dev active
git checkout claude/project-review-planning-Dsj7U

# Verifier les types
npx tsc --noEmit

# Lancer le dev server
npm run dev
```

---

## Licence

MIT — construit par [@Diurndesign](https://github.com/Diurndesign)
