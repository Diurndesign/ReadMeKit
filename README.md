
<p align="center">
  <img src="./readmekit-presentation.svg" alt="ReadMeKit — Visual README Component Editor" width="900" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-Phase%203%20complete-6366f1?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/stack-React%2019%20%2B%20TypeScript%20%2B%20Vite-3b82f6?style=flat-square" alt="Stack" />
  <img src="https://img.shields.io/badge/cost-%240%2Fmonth-22c55e?style=flat-square" alt="Cost" />
  <img src="https://img.shields.io/badge/license-MIT-a1a1aa?style=flat-square" alt="License" />
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
| Rectangle | `R` | Position, taille, couleur de remplissage, bordure (couleur + epaisseur), rayon des coins, opacite |
| Texte | `T` | Contenu, taille de police, graisse, alignement, couleur, opacite |
| Cercle / Ellipse | `O` | Position, taille (rx/ry), couleur, bordure, opacite |

Tous les elements ont : `locked`, `visible`, `name` (optionnel pour le panel calques).

### Canvas

- **Zoom** — molette souris ou boutons +/- ; indicateur de pourcentage cliquable (reset)
- **Pan** — Espace + glisser, ou glisser sur zone vide en mode Select
- **Grille** — grille de points 20px, toggle bouton ou `G` ; quand active, sert de reference visuelle
- **Snap-to-grid 8px** — drag et resize alignes sur grille de 8px quand la grille est activee
- **Fond** — couleur de fond du canvas configurable (section Canvas dans le panneau de proprietes)
- **Reset vue** — `Ctrl+0` ou bouton Maximize

### Selection et manipulation

| Action | Comment faire |
|---|---|
| Selectionner | Clic sur l'element |
| Multi-selectionner | Shift+clic pour ajouter/retirer |
| Selection marquee | Glisser sur zone vide (trace un rectangle de selection) |
| Tout selectionner | `Ctrl+A` |
| Deplacer | Glisser l'element (snap-to-grid si grille active) |
| Deplacer groupe | Selectionner plusieurs + glisser |
| Redimensionner | 8 poignees autour de l'element selectionne |
| Dupliquer | `Ctrl+D` ou bouton dans le panneau |
| Supprimer | `Delete` / `Backspace` |
| Annuler | `Ctrl+Z` (50 etapes) |
| Retablir | `Ctrl+Shift+Z` |
| Edition texte inline | Double-clic sur un element texte |

### Panel calques (sidebar gauche)

- Liste tous les calques dans l'ordre (couche superieure en premier)
- **Clic** — selectionner le calque
- **Double-clic** sur le nom — renommer
- **Icone œil** — masquer/afficher (l'element masque n'apparait pas sur le canvas ni dans les exports)
- **Icone cadenas** — verrouiller (impossible de deplacer ou redimensionner)
- **Icone poubelle** — supprimer

### Panneau de proprietes (sidebar droite)

- **Vide** — message d'aide quand rien n'est selectionne
- **Multi-selection** — affiche le nombre d'elements, bouton supprimer le groupe
- **Element unique** — proprietes specifiques au type + position, taille, opacite
  - Icone de type (carre / cercle / T) dans le header
  - Boutons Dupliquer, Avancer d'un calque, Reculer d'un calque
  - Alignement texte avec icones Lucide (pas de lettres)
  - Color picker fusionne (swatch + champ hex sur une ligne)

### Templates

5 templates prets a l'emploi accessibles via le bouton **Templates** :

| Template | Description |
|---|---|
| Hero Banner | Banniere titre avec sous-titre sur fond indigo |
| Feature Grid | Grille de 3 cartes (Fast / Reliable / Scalable) |
| Tech Stack | Badges de technologies colores (React, TS, Node, etc.) |
| Stats Card | Carte de statistiques (stars, contributeurs, uptime) |
| Contributors | Section equipe avec avatars cercles et roles |

### Export

Bouton **Export** avec dropdown :

| Format | Details |
|---|---|
| SVG vectoriel | Fichier `.svg` compatible GitHub, seuls les elements visibles sont inclus |
| PNG x2 (Retina) | Rendu a 2x la resolution, fond transparent |
| PNG x1 | Rendu a resolution native, fond transparent |

### Onboarding interactif

Guide pas-a-pas au premier lancement (10 etapes) avec :
- Spotlight sur l'element cible
- Detection automatique des actions utilisateu