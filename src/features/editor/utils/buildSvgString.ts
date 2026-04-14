/**
 * Core SVG builder — converts EditorElements into an exportable SVG string.
 *
 * Dark mode support:
 *  1. Canvas background : opts.darkBg  → @media rule on #rmk-bg
 *  2. Per-element       : el.darkFill  → CSS class .rmk-dk-{id} with @media rule
 * Both are emitted in a single consolidated <style> block inside <defs>.
 * GitHub's SVG renderer supports <style> and @media(prefers-color-scheme).
 */
import { wrapText } from '@/utils/wrapText'
import type { EditorElement } from '../types/elements'

const PAD = 20

export interface BuildSvgOptions {
  /** Adds @media dark-mode rule on the canvas background rect. */
  darkBg?: string
  /** Rasterize TextElements via canvas PNG instead of <text> nodes. */
  rasterizeText?: boolean
}

// ── Private helpers ────────────────────────────────────────────────────────────

function svgGradientCoords(angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return {
    x1: `${50 - 50 * Math.sin(a)}%`, y1: `${50 - 50 * Math.cos(a)}%`,
    x2: `${50 + 50 * Math.sin(a)}%`, y2: `${50 + 50 * Math.cos(a)}%`,
  }
}

function withRotation(lines: string[], rotation: number, cx: number, cy: number): string[] {
  if (!rotation) return lines
  return [`  <g transform="rotate(${rotation}, ${cx}, ${cy})">`, ...lines.map((l) => '  ' + l), `  </g>`]
}

/** Creates a linearGradient def if the element has gradient fields; returns the fill value. */
function resolveGradient(
  el: { id: string; fill: string; gradientFrom?: string; gradientTo?: string; gradientAngle?: number },
  defs: string[],
): string {
  if (!el.gradientFrom || !el.gradientTo) return el.fill
  const id = `grad-${el.id}`
  const gc = svgGradientCoords(el.gradientAngle ?? 90)
  defs.push(
    `  <linearGradient id="${id}" x1="${gc.x1}" y1="${gc.y1}" x2="${gc.x2}" y2="${gc.y2}">` +
    `<stop offset="0%" stop-color="${el.gradientFrom}"/><stop offset="100%" stop-color="${el.gradientTo}"/></linearGradient>`,
  )
  return `url(#${id})`
}

/** Pushes a dark-fill CSS rule and returns the class name, or '' if no darkFill. */
function emitDarkFill(
  el: { id: string; darkFill?: string },
  fill: string,
  styleRules: string[],
): string {
  if (!el.darkFill) return ''
  const cls = `rmk-dk-${el.id}`
  styleRules.push(`.${cls}{fill:${fill}}@media(prefers-color-scheme:dark){.${cls}{fill:${el.darkFill}}}`)
  return cls
}

// ── Main export ────────────────────────────────────────────────────────────────

export function buildSvgString(
  elements: EditorElement[],
  canvasBg = 'transparent',
  canvasWidth: number | null = null,
  canvasHeight: number | null = null,
  opts: BuildSvgOptions = {},
): { svg: string; w: number; h: number; ox: number; oy: number } | null {
  const visible = elements.filter((e) => e.visible !== false)
  if (visible.length === 0) return null

  let w: number, h: number, ox: number, oy: number

  if (canvasWidth && canvasHeight) {
    w = canvasWidth; h = canvasHeight; ox = 0; oy = 0
  } else {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const el of visible) {
      if (el.type === 'line') {
        const x2 = el.x + el.width, y2 = el.y + el.height
        minX = Math.min(minX, el.x, x2); minY = Math.min(minY, el.y, y2)
        maxX = Math.max(maxX, el.x, x2); maxY = Math.max(maxY, el.y, y2)
      } else if (el.type === 'text') {
        const textH = wrapText(el.content, el.width, el.fontSize).length * el.fontSize * 1.3
        minX = Math.min(minX, el.x); minY = Math.min(minY, el.y)
        maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + Math.max(el.height, textH))
      } else {
        minX = Math.min(minX, el.x); minY = Math.min(minY, el.y)
        maxX = Math.max(maxX, el.x + el.width); maxY = Math.max(maxY, el.y + el.height)
      }
    }
    w = maxX - minX + PAD * 2; h = maxY - minY + PAD * 2
    ox = minX - PAD; oy = minY - PAD
  }

  const defs: string[] = []
  const body: string[] = []
  const styleRules: string[] = []

  // ── Canvas background ──────────────────────────────────────────────────────
  const lightBg = canvasBg !== 'transparent' ? canvasBg : null
  if (opts.darkBg) {
    const lightFill = lightBg ?? 'transparent'
    styleRules.push(
      `@media(prefers-color-scheme:dark){#rmk-bg{fill:${opts.darkBg}}}` +
      `@media(prefers-color-scheme:light){#rmk-bg{fill:${lightFill}}}`,
    )
    body.push(`  <rect id="rmk-bg" x="${ox}" y="${oy}" width="${w}" height="${h}" fill="${lightFill}"/>`)
  } else if (lightBg) {
    body.push(`  <rect x="${ox}" y="${oy}" width="${w}" height="${h}" fill="${lightBg}"/>`)
  }

  // ── Elements ───────────────────────────────────────────────────────────────
  for (const el of visible) {
    const op = el.opacity !== 1 ? ` opacity="${el.opacity}"` : ''
    const rot = el.rotation ?? 0

    if (el.type === 'rect') {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      const rx = el.cornerRadius > 0 ? ` rx="${el.cornerRadius}" ry="${el.cornerRadius}"` : ''
      const fill = resolveGradient(el, defs)
      const cls = emitDarkFill(el, fill, styleRules)
      body.push(...withRotation(
        cls
          ? [`<rect class="${cls}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx}${st}${op}/>`]
          : [`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="${fill}"${st}${op}/>`],
        rot, cx, cy,
      ))

    } else if (el.type === 'circle') {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2
      const st = el.strokeWidth > 0 ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''
      const fill = resolveGradient(el, defs)
      const cls = emitDarkFill(el, fill, styleRules)
      body.push(...withRotation(
        cls
          ? [`<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}"${st}${op}/>`]
          : [`<ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}"${st}${op}/>`],
        rot, cx, cy,
      ))

    } else if (el.type === 'text') {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2
      const lines = wrapText(el.content, el.width, el.fontSize)
      const lineHeight = el.fontSize * 1.3

      if (opts.rasterizeText) {
        const scale = 2
        const totalH = Math.max(el.height, lines.length * lineHeight + el.fontSize * 0.3)
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(el.width) * scale
        canvas.height = Math.ceil(totalH) * scale
        const ctx = canvas.getContext('2d')!
        ctx.scale(scale, scale)
        if (el.background) {
          const pad = el.bgPadding ?? 4
          ctx.fillStyle = el.background
          ctx.beginPath()
          const bgRx = el.bgRadius ?? 4
          if (typeof (ctx as CanvasRenderingContext2D & { roundRect?: unknown }).roundRect === 'function') {
            (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void })
              .roundRect(-pad, -pad, el.width + pad * 2, totalH + pad * 2, bgRx)
          } else {
            ctx.rect(-pad, -pad, el.width + pad * 2, totalH + pad * 2)
          }
          ctx.fill()
        }
        ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`
        ctx.fillStyle = el.fill
        ctx.textAlign = el.textAlign as CanvasTextAlign
        const tx = el.textAlign === 'center' ? el.width / 2 : el.textAlign === 'right' ? el.width : 0
        lines.forEach((line, i) => ctx.fillText(line, tx, el.fontSize + i * lineHeight))
        body.push(...withRotation(
          [`<image href="${canvas.toDataURL('image/png')}" x="${el.x}" y="${el.y}" width="${el.width}" height="${totalH}"${op}/>`],
          rot, cx, cy,
        ))
      } else {
        const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start'
        const tx = el.textAlign === 'center' ? cx : el.textAlign === 'right' ? el.x + el.width : el.x
        const innerLines: string[] = []
        if (el.background) {
          const pad = el.bgPadding ?? 4
          const bgH = Math.max(el.height, lines.length * lineHeight)
          innerLines.push(
            `<rect x="${el.x - pad}" y="${el.y - pad}" width="${el.width + pad * 2}" height="${bgH + pad * 2}"` +
            ` rx="${el.bgRadius ?? 4}" ry="${el.bgRadius ?? 4}" fill="${el.background}"${op}/>`,
          )
        }
        const tspans = lines.map((line, i) => {
          const esc = (line || ' ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          return `    <tspan x="${tx}" y="${el.y + el.fontSize + i * lineHeight}">${esc}</tspan>`
        }).join('\n')
        const cls = emitDarkFill(el, el.fill, styleRules)
        innerLines.push(
          cls
            ? `<text class="${cls}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${anchor}"${op}>\n${tspans}\n  </text>`
            : `<text font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" fill="${el.fill}" text-anchor="${anchor}"${op}>\n${tspans}\n  </text>`,
        )
        body.push(...withRotation(innerLines, rot, cx, cy))
      }

    } else if (el.type === 'line') {
      const x2 = el.x + el.width, y2 = el.y + el.height
      const da =
        el.strokeDash === 'dashed' ? ` stroke-dasharray="${el.strokeWidth * 4} ${el.strokeWidth * 2}"` :
        el.strokeDash === 'dotted' ? ` stroke-dasharray="${el.strokeWidth} ${el.strokeWidth * 2}"` : ''
      const mid = `arrow-${el.id}`
      if (el.arrowEnd || el.arrowStart) {
        defs.push(
          `  <marker id="${mid}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">` +
          `<polygon points="0 0, 10 3.5, 0 7" fill="${el.stroke}"/></marker>`,
        )
      }
      body.push(
        `  <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}"` +
        ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-linecap="round"${da}` +
        `${el.arrowEnd ? ` marker-end="url(#${mid})"` : ''}${el.arrowStart ? ` marker-start="url(#${mid})"` : ''}${op}/>`,
      )

    } else if (el.type === 'image' && el.src) {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2
      body.push(...withRotation(
        [`<image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid meet"${op}/>`],
        rot, cx, cy,
      ))
    }
  }

  if (styleRules.length > 0) defs.unshift(`  <style>${styleRules.join('')}</style>`)

  const defsBlock = defs.length ? `  <defs>\n${defs.join('\n')}\n  </defs>` : ''
  return {
    svg: [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${ox} ${oy} ${w} ${h}">`,
      ...(defsBlock ? [defsBlock] : []),
      ...body,
      '</svg>',
    ].join('\n'),
    w, h, ox, oy,
  }
}
