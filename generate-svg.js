#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// SVG generation utility
function escapeXml(str) {
  return str.replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return map[char] || char;
  });
}

function createText(x, y, text, fontSize = 14, fill = '#c9d1d9', fontFamily = 'system-ui', fontWeight = 'normal', textAnchor = 'start', lineHeight = null) {
  const lh = lineHeight || fontSize * 1.3;
  const lines = text.split('\n');

  let tspans = lines.map((line, i) => {
    return `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${escapeXml(line)}</tspan>`;
  }).join('');

  return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}" font-weight="${fontWeight}" text-anchor="${textAnchor}">${tspans}</text>`;
}

function createRect(x, y, width, height, fill = 'none', stroke = 'none', strokeWidth = 1, rx = 0, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${rx}" opacity="${opacity}"/>`;
}

function createCircle(x, y, r, fill = '#6366f1', opacity = 1) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
}

function createLine(x1, y1, x2, y2, stroke = '#6366f1', strokeWidth = 1, opacity = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
}

function createSectionHeader(x, y, text) {
  return `${createText(x, y, text, 28, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createLine(x, y + 35, x + 200, y + 35, '#6366f1', 2, 0.3)}`;
}

// SVG Content
let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="3613" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 3613">
<defs>
<linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(160)">
<stop offset="0%" style="stop-color:#0f0a2e;stop-opacity:1" />
<stop offset="100%" style="stop-color:#1a1145;stop-opacity:1" />
</linearGradient>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
</style>
</defs>

<!-- Background -->
${createRect(0, 0, 900, 3613, '#0a0a1a')}

<!-- ===== SECTION 1: HERO ===== -->
${createRect(0, 0, 900, 340, 'url(#heroGradient)')}

<!-- Decorative circles -->
${createCircle(800, 50, 120, '#6366f1', 0.12)}
${createCircle(100, 280, 90, '#8b5cf6', 0.08)}
${createCircle(750, 200, 50, '#a78bfa', 0.2)}

<!-- Logo circle with R -->
${createCircle(50, 90, 30, '#6366f1')}
${createText(50, 110, 'R', 36, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}

<!-- Title -->
${createText(100, 75, 'ReadMeKit', 42, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}

<!-- Version badge -->
${createRect(100, 130, 100, 30, 'none', '#4f46e5', 2, 15)}
${createText(150, 150, 'v0.1.0', 12, '#a5b4fc', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

<!-- Subtitle -->
${createText(100, 190, 'Visual README Component Editor', 20, '#a78bfa', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- Description -->
${createText(100, 230, 'Design beautiful SVG banners for your GitHub README files.\nDrag, drop, style and export — no code needed.', 14, '#c4b5fd', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start', 18.2)}

<!-- CTA Buttons -->
${createRect(100, 280, 140, 40, '#6366f1', 'none', 0, 8)}
${createText(170, 305, 'Get Started', 14, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}

${createRect(260, 280, 160, 40, 'none', '#6366f1', 2, 8)}
${createText(340, 305, 'View on GitHub', 14, '#c4b5fd', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}

<!-- Nav links -->
${createText(100, 330, 'Features • Getting Started • Usage • Templates • Tech Stack • Contributing • License', 12, '#818cf8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== SECTION 2: WHAT IS READMEKIT ===== -->
${createSectionHeader(80, 365, 'What is ReadMeKit?')}
${createText(80, 430, 'ReadMeKit is a browser-based visual editor for creating SVG banner components for GitHub README files. Instead of writing SVG by hand or using generic design tools, you drag and drop shapes, text, images, and lines on a live canvas, style everything with a property panel, and export a clean, GitHub-ready SVG in one click.', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start', 20)}

${createText(80, 530, 'The exported SVG is optimized for GitHub rendering: sanitized attributes, optional font embedding, dark mode support via prefers-color-scheme, and a complete README.md generator that combines your banner with pre-filled Markdown sections.', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start', 20)}

<!-- ===== SECTION 3: FEATURES ===== -->
${createSectionHeader(80, 595, 'Features')}

<!-- Feature cards grid 5x2 -->
`;

const features = [
  { letter: 'E', title: 'Visual Editor', desc: 'Drag and drop rectangles, circles, text, lines, and images on a live canvas', color: '#6366f1' },
  { letter: 'S', title: 'SVG Export', desc: 'Export clean, GitHub-ready SVG for any README', color: '#10b981' },
  { letter: 'T', title: 'Templates', desc: 'Start from 8 pre-built layouts or create from scratch', color: '#f59e0b' },
  { letter: 'U', title: 'Undo / Redo', desc: '50-state history with Ctrl+Z / Ctrl+Shift+Z', color: '#ef4444' },
  { letter: 'P', title: 'Property Panel', desc: 'Position, size, color, border, opacity controls', color: '#ec4899' },
  { letter: 'L', title: 'Layer Manager', desc: 'Reorder, lock, hide layers with drag and drop', color: '#8b5cf6' },
  { letter: 'M', title: 'README Generator', desc: 'Generate full README.md with banner + Markdown sections', color: '#14b8a6' },
  { letter: 'A', title: 'Alignment', desc: 'Multi-select, align, distribute, and group elements', color: '#3b82f6' },
  { letter: 'K', title: 'Keyboard Shortcuts', desc: 'V, R, T, O, L, I, Delete, Ctrl+Z/Y and more', color: '#f97316' },
  { letter: 'D', title: 'Dark Mode SVG', desc: 'Per-element dark fills with prefers-color-scheme', color: '#a855f7' }
];

let featureY = 660;
for (let i = 0; i < features.length; i += 2) {
  // Left card
  const f1 = features[i];
  svgContent += `${createRect(80, featureY, 350, 120, '#111827', '#1e293b', 1, 8)}
${createCircle(110, featureY + 20, 18, f1.color)}
${createText(110, featureY + 30, f1.letter, 20, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}
${createText(145, featureY + 20, f1.title, 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(145, featureY + 55, f1.desc, 12, '#94a3b8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start', 16)}
`;

  // Right card
  if (i + 1 < features.length) {
    const f2 = features[i + 1];
    svgContent += `${createRect(470, featureY, 350, 120, '#111827', '#1e293b', 1, 8)}
${createCircle(500, featureY + 20, 18, f2.color)}
${createText(500, featureY + 30, f2.letter, 20, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}
${createText(535, featureY + 20, f2.title, 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(535, featureY + 55, f2.desc, 12, '#94a3b8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start', 16)}
`;
  }

  featureY += 140;
}

svgContent += `
<!-- ===== SECTION 4: GETTING STARTED ===== -->
${createSectionHeader(80, 1125, 'Getting Started')}

${createText(80, 1190, 'Prerequisites', 18, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(100, 1225, '• Node.js 18 or later', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 1250, '• npm, yarn, or pnpm', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

${createText(80, 1295, 'Installation', 18, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}

<!-- Code block -->
${createRect(80, 1320, 740, 160, '#0d1117', 'none', 0, 8)}
${createText(95, 1335, '# Clone the repository\ngit clone https://github.com/Diurndesign/ReadMeKit.git\ncd ReadMeKit/readmekit\n\n# Install dependencies\nnpm install\n\n# Start the development server\nnpm run dev', 12, '#e6edf3', '"SF Mono", "Fira Code", Consolas, monospace', 'normal', 'start', 18)}

${createText(80, 1495, 'The app will be available at http://localhost:5173', 14, '#94a3b8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

${createText(80, 1540, 'Build for production', 18, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createRect(80, 1560, 740, 50, '#0d1117', 'none', 0, 8)}
${createText(95, 1580, 'npm run build', 12, '#e6edf3', '"SF Mono", "Fira Code", Consolas, monospace')}
${createText(80, 1625, 'Output in dist/ folder, ready for Vercel, Netlify, GitHub Pages, etc.', 14, '#94a3b8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== SECTION 5: USAGE ===== -->
${createSectionHeader(80, 1692, 'Usage')}

<!-- Step 1 -->
${createCircle(100, 1755, 20, '#6366f1')}
${createText(100, 1765, '1', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}
${createText(140, 1745, 'Create & Design', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(140, 1775, 'Add shapes, text and colors to your canvas', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- Connecting line -->
${createLine(100, 1800, 100, 1850, '#6366f1', 2, 0.3)}

<!-- Step 2 -->
${createCircle(100, 1880, 20, '#6366f1')}
${createText(100, 1890, '2', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}
${createText(140, 1870, 'Style & Position', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(140, 1900, 'Use the property panel to fine-tune everything', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- Connecting line -->
${createLine(100, 1925, 100, 1975, '#6366f1', 2, 0.3)}

<!-- Step 3 -->
${createCircle(100, 2005, 20, '#6366f1')}
${createText(100, 2015, '3', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold', 'middle')}
${createText(140, 1995, 'Export SVG', 16, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(140, 2025, 'One-click export for your GitHub README', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== SECTION 6: TEMPLATES ===== -->
${createSectionHeader(80, 2012, 'Templates')}

<!-- Table header -->
${createRect(80, 2075, 740, 30, '#161b22')}
${createText(100, 2095, 'Template', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}
${createText(380, 2095, 'Description', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}

<!-- Table rows -->
`;

const templates = [
  'Hero Banner',
  'Gradient Hero',
  'Feature Grid',
  'Architecture',
  'Tech Stack',
  'Stats Card',
  'Changelog',
  'Contributors'
];

let tableY = 2110;
templates.forEach((template, i) => {
  const bgColor = i % 2 === 0 ? '#0d1117' : 'transparent';
  svgContent += `${createRect(80, tableY, 740, 30, bgColor)}
${createText(100, tableY + 19, template, 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'start')}
`;
  tableY += 30;
});

svgContent += `
<!-- ===== SECTION 7: TECH STACK ===== -->
${createSectionHeader(80, 2394, 'Tech Stack')}

<!-- Tech badges -->
${createRect(80, 2460, 100, 30, 'none', '#38bdf8', 1, 15)}
${createText(130, 2480, 'React 19', 12, '#38bdf8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(190, 2460, 90, 30, 'none', '#3b82f6', 1, 15)}
${createText(235, 2480, 'TypeScript', 12, '#3b82f6', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(290, 2460, 70, 30, 'none', '#a78bfa', 1, 15)}
${createText(325, 2480, 'Vite', 12, '#a78bfa', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(370, 2460, 100, 30, 'none', '#06b6d4', 1, 15)}
${createText(420, 2480, 'Tailwind 4', 12, '#06b6d4', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(480, 2460, 80, 30, 'none', '#f59e0b', 1, 15)}
${createText(520, 2480, 'Zustand', 12, '#f59e0b', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(570, 2460, 70, 30, 'none', '#10b981', 1, 15)}
${createText(605, 2480, 'Immer', 12, '#10b981', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createRect(650, 2460, 70, 30, 'none', '#ef4444', 1, 15)}
${createText(685, 2480, 'Zundo', 12, '#ef4444', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createText(80, 2530, 'Project structure', 18, '#ffffff', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'bold')}

<!-- Code block -->
${createRect(80, 2555, 740, 155, '#0d1117', 'none', 0, 8)}
${createText(95, 2570, 'src/\n├── app/                  # App entry point\n│   features/\n│   └── editor/\n│       ├── components/   # UI components\n│       │   ├── elements/ # SVG renderers\n│       │   └── export/   # Export sub-components\n│       ├── data/         # Template definitions\n│       ├── hooks/        # Business logic\n│       ├── stores/       # Zustand stores\n│       ├── types/        # TypeScript types\n│       └── utils/        # SVG & README generation\n└── utils/                # Shared utilities', 11, '#e6edf3', '"SF Mono", "Fira Code", Consolas, monospace', 'normal', 'start', 16)}

${createText(80, 2725, 'Follows the Bulletproof React architecture pattern.', 12, '#8b949e', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== SECTION 8: SCRIPTS ===== -->
${createSectionHeader(80, 2859, 'Scripts')}

${createRect(80, 2920, 740, 140, '#0d1117', 'none', 0, 8)}
${createText(95, 2935, 'npm run dev          # Start dev server (Vite)\nnpm run build        # Type-check + production build\nnpm run preview      # Preview production build\nnpm run test         # Run tests once (Vitest)\nnpm run test:watch   # Run tests in watch mode\nnpm run test:coverage # Tests with coverage report\nnpm run lint         # Lint with ESLint', 11, '#e6edf3', '"SF Mono", "Fira Code", Consolas, monospace', 'normal', 'start', 16)}

<!-- ===== SECTION 9: CONTRIBUTING ===== -->
${createSectionHeader(80, 3099, 'Contributing')}

${createText(80, 3165, 'Contributions are welcome! Here&apos;s how to get started:', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

${createText(100, 3210, '1. Fork the repository', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 3235, '2. Create a feature branch (git checkout -b feature/my-feature)', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 3260, '3. Make your changes', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 3285, '4. Run tests (npm run test) and linting (npm run lint)', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 3310, '5. Commit your changes', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(100, 3335, '6. Push to the branch and open a Pull Request', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== SECTION 10: LICENSE ===== -->
${createSectionHeader(80, 3378, 'License')}
${createText(80, 3443, 'MIT © Diurn', 14, '#c9d1d9', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

<!-- ===== FOOTER ===== -->
${createLine(80, 3490, 820, 3490, '#1e293b', 1, 1)}

${createRect(80, 3515, 220, 40, 'none', '#6366f1', 2, 20)}
${createText(190, 3540, 'Made with ReadMeKit', 12, '#6366f1', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 'normal', 'middle')}

${createText(80, 3570, 'github.com/diurndesign/readmekit', 12, '#818cf8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}
${createText(80, 3590, 'diurn.design@gmail.com', 12, '#818cf8', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

${createText(80, 3613, '2025 ReadMeKit — MIT License', 12, '#8b949e', '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif')}

</svg>`;

// Write to file
const outputPath = '/sessions/dazzling-nifty-wozniak/mnt/ReadMekit/readmekit/readmekit-presentation.svg';
fs.writeFileSync(outputPath, svgContent, 'utf-8');
console.log(`✓ SVG generated successfully at ${outputPath}`);
console.log(`✓ File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
