/**
 * Sanitizes an SVG string for safe embedding in GitHub README files.
 *
 * GitHub's sanitizer (Sanitize gem with their custom allowlist) strips several
 * elements and attributes that could pose security risks or aren't supported.
 * This utility mirrors those restrictions and reports what it removed.
 *
 * References:
 *   https://github.com/jch/html-pipeline
 *   https://github.com/github/markup
 */

/** Elements that GitHub strips entirely from SVG */
const FORBIDDEN_ELEMENTS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  // SVG animation elements — blocked by GitHub's CSP
  'animate',
  'animatemotion',
  'animatetransform',
  'set',
  'discard',
])

export interface SanitizeResult {
  svg: string
  warnings: string[]
}

export function sanitizeForGitHub(svgString: string): SanitizeResult {
  const warnings: string[] = []

  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    warnings.push('SVG invalide — impossible de parser le document')
    return { svg: svgString, warnings }
  }

  const root = doc.documentElement

  // 1. Ensure xmlns is present
  if (!root.getAttribute('xmlns')) {
    root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  // 2. Remove forbidden elements (collect first to avoid live-NodeList issues)
  for (const tag of FORBIDDEN_ELEMENTS) {
    const found = Array.from(doc.querySelectorAll(tag))
    found.forEach((el) => {
      warnings.push(`Élément <${tag}> supprimé (non supporté par GitHub)`)
      el.remove()
    })
  }

  // 3. Walk all remaining elements and strip dangerous attributes
  function walkElement(el: Element) {
    const toRemove: string[] = []

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]
      const name = attr.name.toLowerCase()
      const val = attr.value

      // All event-handler attributes (on*)
      if (name.startsWith('on')) {
        toRemove.push(attr.name)
        warnings.push(`Attribut d'événement supprimé : ${attr.name}`)
        continue
      }

      // javascript: URIs in href / src / action / formaction
      if (/^(href|src|action|formaction|xlink:href)$/.test(name)) {
        if (val.replace(/[\s\u0000-\u001f]/g, '').toLowerCase().startsWith('javascript:')) {
          toRemove.push(attr.name)
          warnings.push(`URI javascript: supprimée dans : ${attr.name}`)
        }
      }
    }

    toRemove.forEach((n) => el.removeAttribute(n))

    // Upgrade deprecated xlink:href → href (SVG 2 compatibility)
    const xlinkNS = 'http://www.w3.org/1999/xlink'
    const xlinkHref = el.getAttributeNS(xlinkNS, 'href')
    if (xlinkHref !== null) {
      if (!el.hasAttribute('href')) el.setAttribute('href', xlinkHref)
      el.removeAttributeNS(xlinkNS, 'href')
    }

    Array.from(el.children).forEach(walkElement)
  }

  walkElement(root)

  // 4. Warn about external image references (GitHub proxies them via camo)
  doc.querySelectorAll('image[href]').forEach((img) => {
    const href = img.getAttribute('href') ?? ''
    if (/^https?:\/\//.test(href)) {
      warnings.push(
        `Image externe détectée — GitHub la proxifie via camo : ${href.slice(0, 80)}${href.length > 80 ? '…' : ''}`,
      )
    }
  })

  // 5. Serialize back to string
  const serializer = new XMLSerializer()
  let result = serializer.serializeToString(root)

  // Remove xlink namespace declarations injected by XMLSerializer
  result = result.replace(/\s+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, '')

  return { svg: result, warnings }
}
