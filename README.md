<p align="center">
  <img src="https://img.shields.io/badge/status-Phase%201%20%E2%80%94%20Foundations-6366f1?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/stack-React%2019%20%2B%20TypeScript%20%2B%20Vite-3b82f6?style=flat-square" alt="Stack" />
  <img src="https://img.shields.io/badge/cost-%240%2Fmonth-22c55e?style=flat-square" alt="Cost" />
</p>

<h1 align="center">ReadMeKit</h1>

<p align="center">
  <strong>Un editeur visuel dans le navigateur pour creer de beaux composants README.</strong><br />
  Bannieres heros, grilles de fonctionnalites, diagrammes d'architecture, sections contributeurs — exportables en SVG compatible GitHub.
</p>

---

## Le probleme

Aujourd'hui, creer un README soigne sur GitHub est penible. Les developpeurs assemblent 4 a 5 outils separes (capsule-render, shields.io, github-readme-stats, readme.so) aux styles visuels incompatibles. Le resultat : des READMEs qui ressemblent a un collage.

**Aucun editeur visuel unifie n'existe pour les composants README.**

## La solution

ReadMeKit est un editeur visuel type Figma, construit pour un seul objectif : concevoir des composants README et les exporter en SVG qui s'affiche parfaitement sur GitHub.

- **Editeur SVG natif** — ce que tu vois dans l'editeur est exactement ce qui sera exporte
- **Glisser-deposer** — positionne les elements intuitivement
- **Panneau de proprietes** — couleur, taille, opacite, typographie, tout se regle visuellement
- **Undo/Redo** — Ctrl+Z / Ctrl+Shift+Z avec historique de 50 etats
- **Onboarding interactif** — un guide pas-a-pas au premier lancement
- **Zero cout** — stack 100% gratuite (Cloudflare Pages, Supabase, open source)

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Vite + React 19 + TypeScript |
| Editeur | SVG natif React (pas de canvas) |
| Etat | Zustand + Immer + Zundo (undo/redo) |
| Styles | Tailwind CSS v4 |
| Icones | Lucide React |
| Hebergement | Cloudflare Pages (prevu) |
| BDD / Auth | Supabase (prevu) |
| Paiements | Lemon Squeezy ou Polar (prevu) |

## Demarrage rapide

```bash
# Cloner le depot
git clone https://github.com/difrancesco/readmekit.git
cd readmekit

# Installer les dependances
npm install

# Lancer le serveur de dev
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) — l'onboarding interactif te guidera.

## Raccourcis clavier

| Raccourci | Action |
|---|---|
| `V` | Outil de selection |
| `R` | Outil Rectangle |
| `T` | Outil Texte |
| `Delete` / `Backspace` | Supprimer l'element selectionne |
| `Ctrl+Z` | Annuler |
| `Ctrl+Shift+Z` | Retablir |
| `Escape` | Deselectionner |

## Architecture

Le projet suit le pattern **Bulletproof React** — organisation par fonctionnalite, pas par type de fichier.

```
src/
├── app/                    # Coquille de l'application
├── components/             # Composants UI partages (shadcn/ui)
├── features/
│   ├── editor/             # L'editeur visuel (canvas, toolbar, panneau)
│   │   ├── components/     # EditorCanvas, EditorToolbar, PropertyPanel
│   │   ├── hooks/          # useDragElement, useKeyboardShortcuts
│   │   ├── stores/         # editorStore (Zustand), uiStore
│   │   └── types/          # EditorElement, RectElement, TextElement
│   ├── export/             # Pipeline d'export SVG/PNG (a venir)
│   ├── templates/          # Templates predefinis (a venir)
│   ├── auth/               # Authentification GitHub (a venir)
│   └── dashboard/          # Tableau de bord utilisateur (a venir)
├── hooks/                  # Hooks partages
├── utils/                  # Utilitaires (cn, generateId)
└── main.tsx
```

## Roadmap

Le projet suit une roadmap de 26 semaines :

- [x] **Phase 1** — Fondations : canvas SVG, ajout/selection/deplacement d'elements, panneau de proprietes, undo/redo, onboarding
- [ ] **Phase 2** — Interactions : redimensionnement, edition inline, selection multiple, premiers templates
- [ ] **Phase 3** — Export : SVG compatible GitHub, mode sombre, gestion des polices
- [ ] **Phase 4** — Comptes : auth Supabase, sauvegarde des designs, dashboard
- [ ] **Phase 5** — Composants : diagrammes d'architecture, section contributeurs, bibliotheque de templates
- [ ] **Phase 6** — Lancement : landing page, analytics, monetisation, ProductHunt

## Produits freres (prevus)

ReadMeKit fait partie d'un ecosysteme de 3 outils GitHub au design soigne :

1. **ReadMeKit** — editeur visuel de composants README *(en cours)*
2. **RepoScore** — tableau de bord de sante de depots (score 0-100)
3. **GitCinema** — visualiseur cinematique de l'evolution d'un depot

## Licence

MIT

---

<p align="center">
  <sub>Construit par <a href="https://github.com/difrancesco">@difrancesco</a> — un projet solo, weekends + soirees.</sub>
</p>
