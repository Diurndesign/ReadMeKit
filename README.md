<p align="center">
  <img src="./readmekit-presentation.svg" alt="ReadMeKit — Visual README Presentation" width="900" />
</p>

# ReadMeKit

**ReadMeKit** est un éditeur visuel dans le navigateur qui permet de concevoir des composants pour les READMEs GitHub — bannières, badges, diagrammes, etc. — et de les exporter en SVG, PNG ou PDF.

## Fonctionnalités

- Éditeur canvas SVG avec pan, zoom et grille snap-to-grid
- Éléments : rectangles, cercles, texte (multiligne), lignes/flèches, images
- Redimensionnement, rotation et sélection multiple (lasso + Shift)
- Panneau de propriétés complet (couleurs, gradients, opacité, border-radius, etc.)
- Panneau de calques avec drag-and-drop pour réordonner
- Templates prédéfinis (Hero, Features, Badges, Stats, Contributors)
- Presets de taille : GitHub Banner, Large Banner, Social Card, Square
- Export SVG / PNG / PDF avec options GitHub-ready
- Undo/Redo illimité (Ctrl+Z / Ctrl+Shift+Z)
- Guide interactif de bienvenue
- Raccourcis clavier complets

## Stack technique

- React 19 + TypeScript
- Zustand 5 + Immer + Zundo (undo/redo)
- Vite
- Tailwind CSS 4
- Vitest + Testing Library

## Installation

```bash
git clone https://github.com/Diurndesign/ReadMeKit.git
cd ReadMeKit
npm install
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (type-check + bundle) |
| `npm run preview` | Prévisualisation du build |
| `npm run test` | Tests unitaires |

## Démo

Le projet est déployé sur GitHub Pages : **https://diurndesign.github.io/ReadMeKit/**

## Licence

MIT
