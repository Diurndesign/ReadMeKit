/**
 * Embeds external fonts as Base64-encoded @font-face declarations inside an SVG.
 *
 * GitHub's CSP blocks external font loading (fonts.googleapis.com, fonts.gstatic.com),
 * so custom fonts won't render in README SVGs unless they are inlined.
 * This utility fetches fonts from Google Fonts and embeds them as data: URIs,
 * making the SVG fully self-contained.
 */

/** Font families that render without embedding on virtually every platform */
const SYSTEM_FONT_FAMILIES = new Set(
  [
    // CSS generic keywords
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    'system-ui', 'math', 'emoji', 'fangsong',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    // Apple / macOS
    '-apple-system', 'blinkmacsystemfont', 'sf pro', 'sf mono',
    'helvetica neue', 'helvetica',
    // Windows
    'segoe ui', 'segoe print', 'segoe script',
    'ms sans serif', 'ms serif', 'ms ui gothic',
    'consolas', 'calibri', 'cambria', 'candara', 'constantia', 'corbel',
    'franklin gothic medium',
    // Cross-platform common
    'arial', 'arial narrow', 'arial unicode ms',
    'impact', 'georgia', 'palatino', 'palatino linotype', 'book antiqua',
    'times', 'times new roman',
    'courier', 'courier new',
    'lucida console', 'lucida sans unicode', 'lucida grande',
    'tahoma', 'trebuchet ms', 'verdana',
    'comic sans ms', 'symbol', 'webdings', 'wingdings',
    // Linux / open-source
    'liberation sans', 'liberation serif', 'liberation mono',
    'dejavu sans', 'dejavu serif', 'dejavu sans mono',
    'ubuntu', 'ubuntu mono', 'noto sans', 'noto serif', 'noto mono',
    'roboto', 'open sans', 'lato', 'source sans pro', 'source code pro',
    // CJK system fonts
    'meiryo', 'malgun gothic', 'microsoft yahei', 'microsoft jhenghei',
    'simsun', 'ming liu', 'ms gothic', 'ms mincho', 'yu gothic', 'yu mincho',
  ].map((f) => f.toLowerCase()),
)

function isSystemFont(family: string): boolean {
  return SYSTEM_FONT_FAMILIES.has(family.toLowerCase().replace(/['"]/g, '').trim())
}

/**
 * Parse all font-family attribute values in the SVG and return
 * the non-system families that need embedding.
 */
export function extractEmbeddableFonts(svgString: string): string[] {
  const seen = new Set<string>()
  for (const m of svgString.matchAll(/font-family="([^"]+)"/g)) {
    for (const raw of m[1].split(',')) {
      const clean = raw.trim().replace(/['"]/g, '')
      if (clean && !isSystemFont(clean)) seen.add(clean)
    }
  }
  return Array.from(seen)
}

/**
 * Fetch a single font family from Google Fonts and return a Base64 @font-face
 * rule, or null if the font cannot be found / fetched.
 */
async function fetchGoogleFontFace(family: string): Promise<string | null> {
  try {
    // Request the CSS from Google Fonts, using a modern UA to get woff2
    const apiUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family.replace(/ /g, '+'),
    )}&display=swap`

    const css = await fetch(apiUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.text()
    })

    // Extract the first woff2 URL, fall back to woff
    const woff2Match = css.match(/url\((https:\/\/[^)]+\.woff2[^)]*)\)\s*format\(['"]?woff2['"]?\)/)
    const woffMatch = css.match(/url\((https:\/\/[^)]+\.woff[^)]*)\)\s*format\(['"]?woff['"]?\)/)
    const fontUrl = woff2Match?.[1] ?? woffMatch?.[1]
    if (!fontUrl) return null

    const buf = await fetch(fontUrl).then((r) => r.arrayBuffer())

    // btoa in chunks to avoid call-stack overflow on large fonts
    const bytes = new Uint8Array(buf)
    let binary = ''
    const CHUNK = 0x8000
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
    }
    const b64 = btoa(binary)
    const fmt = fontUrl.includes('.woff2') ? 'woff2' : 'woff'
    const mime = `font/${fmt}`

    return `@font-face{font-family:'${family}';src:url('data:${mime};base64,${b64}') format('${fmt}');font-display:swap}`
  } catch {
    return null
  }
}

export interface EmbedFontResult {
  svg: string
  /** Font families that were successfully embedded */
  embedded: string[]
  /** Font families that could not be fetched from Google Fonts */
  failed: string[]
}

/**
 * Scan the SVG for non-system font families, fetch them from Google Fonts,
 * and embed them as Base64 @font-face declarations in a <style> block.
 */
export async function embedFontsInSvg(svgString: string): Promise<EmbedFontResult> {
  const families = extractEmbeddableFonts(svgString)
  if (families.length === 0) return { svg: svgString, embedded: [], failed: [] }

  const embedded: string[] = []
  const failed: string[] = []
  const fontFaces: string[] = []

  await Promise.allSettled(
    families.map(async (family) => {
      const face = await fetchGoogleFontFace(family)
      if (face) {
        fontFaces.push(face)
        embedded.push(family)
      } else {
        failed.push(family)
      }
    }),
  )

  if (fontFaces.length === 0) return { svg: svgString, embedded, failed }

  const styleBlock = `<style>\n${fontFaces.join('\n')}\n</style>`
  // Inject immediately after the opening <svg ...> tag
  const svg = svgString.replace(/(<svg[^>]*>)/, `$1\n${styleBlock}`)
  return { svg, embedded, failed }
}
