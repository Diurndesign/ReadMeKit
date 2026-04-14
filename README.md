<p align="center">
  <img src="./readmekit-presentation.svg" alt="ReadMeKit — Visual README Presentation" width="900" />
</p>

---

## What is ReadMeKit?

ReadMeKit is a browser-based visual editor for creating SVG banner components for GitHub README files. Instead of writing SVG by hand or using generic design tools, you drag and drop shapes, text, images, and lines on a live canvas, style everything with a property panel, and export a clean, GitHub-ready SVG in one click.

The exported SVG is optimized for GitHub rendering: sanitized attributes, optional font embedding, dark mode support via `prefers-color-scheme`, and a complete README.md generator that combines your banner with pre-filled Markdown sections.

## Features

**Visual Canvas Editor** — Drag and drop rectangles, circles, text, lines, and images on an infinite SVG canvas with real-time preview.

**Property Panel** — Fine-tune every element: position, size, rotation, opacity, colors, gradients, border radius, font family, font weight, text alignment, and more.

**Layer Manager** — Reorder, rename, lock, and toggle visibility of elements with drag-and-drop layer ordering.

**8 Starter Templates** — Hero Banner, Gradient Hero, Feature Grid, Architecture Diagram, Tech Stack, Stats Card, Changelog, and Contributors. Load one and customize it, or start from scratch.

**Canvas Presets** — Quick-switch between standard sizes: GitHub Banner (800×200), Large Banner (1200×300), Social Card (1200×630), Square (500×500), or Auto.

**Multi-format Export** — Export as SVG, PNG (1x and Retina 2x), or PDF. Optionally embed fonts as base64, convert text to images for full portability, or enable dark mode support.

**README.md Generator** — A dedicated export tab generates a full README.md file with your SVG banner at the top and configurable Markdown sections (Description, Installation, Usage, Features, Contributing, License, Links).

**50-state Undo/Redo** — Full history with Ctrl+Z / Ctrl+Shift+Z powered by Zundo.

**Multi-selection & Alignment** — Select multiple elements, align them (left, center, right, top, middle, bottom), distribute evenly, and group/ungroup.

**Keyboard Shortcuts** — V (Select), R (Rectangle), T (Text), O (Circle), L (Line), I (Image), Delete, Ctrl+Z/Y, and more.

**Dark Mode SVG** — Set per-element dark fills that automatically adapt to the viewer's OS theme using CSS `@media (prefers-color-scheme: dark)`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Diurndesign/ReadMeKit.git
cd ReadMeKit/readmekit

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

The output is generated in the `dist/` folder, ready to be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.).

## Usage

### 1. Create & Design

Open the app and pick a tool from the toolbar — Rectangle, Text, Circle, Line, or Image. Click on the canvas to place an element. Drag to move, use corner handles to resize, and the top handle to rotate.

### 2. Style & Position

Select any element to open the property panel on the right. Adjust colors, gradients, opacity, border radius, font properties, stroke styles, and more. Use the layer panel on the left to reorder elements, lock them, or toggle visibility.

### 3. Export

Click **Export** to open the export dialog:

- **SVG tab** — Preview your banner in light and dark mode. Download as SVG, PNG, or PDF. Copy the Markdown snippet to embed it in your README.
- **README tab** — Generate a full `README.md` with your banner and editable Markdown sections. Download the file or copy the Markdown to your clipboard.

### Templates

Instead of starting from scratch, pick one of the 8 built-in templates:

| Template | Description |
|---|---|
| Hero Banner | Title + subtitle on a solid background |
| Gradient Hero | Title + subtitle with a gradient background |
| Feature Grid | Grid layout showcasing key features |
| Architecture | Diagram-style layout for system architecture |
| Tech Stack | Horizontal badges for your tech stack |
| Stats Card | Highlight key numbers and metrics |
| Changelog | Version history layout |
| Contributors | Team/contributor showcase |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS 4 |
| State management | Zustand 5 + Immer |
| Undo/Redo | Zundo |
| PDF export | jsPDF |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |
| Linting | ESLint |

### Project structure

```
src/
├── app/                  # App entry point
├── features/
│   └── editor/
│       ├── components/   # UI components (Canvas, Toolbar, Panels, Export)
│       │   ├── elements/ # SVG element renderers (Rect, Text, Circle, Line, Image)
│       │   └── export/   # Export dialog sub-components
│       ├── data/         # Template definitions
│       ├── hooks/        # Business logic (drag, resize, rotate, export, shortcuts)
│       ├── stores/       # Zustand stores (editorStore, uiStore)
│       ├── types/        # TypeScript type definitions
│       └── utils/        # SVG generation, README generation, helpers
└── utils/                # Shared utilities (cn, generateId, wrapText, fontEmbedder)
```

The project follows the [Bulletproof React](https://github.com/alan2207/bulletproof-react) architecture pattern: feature-based organization with co-located components, hooks, stores, and types.

## Scripts

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint with ESLint
```

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`npm run test`) and linting (`npm run lint`)
5. Commit your changes (`git commit -m "Add my feature"`)
6. Push to the branch (`git push origin feature/my-feature`)
7. Open a Pull Request

## License

MIT © [Diurn](https://github.com/Diurndesign)

---

<p align="center">
  Made with ReadMeKit — <a href="mailto:diurn.design@gmail.com">diurn.design@gmail.com</a>
</p>
