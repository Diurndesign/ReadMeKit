/**
 * Wrap text to fit within a given pixel width.
 * Uses character-count approximation: avgCharWidth ≈ fontSize × 0.55.
 * Respects explicit newlines (\n) in the content.
 * Returns an array of line strings (never empty — always at least ['']).
 */
export function wrapText(content: string, width: number, fontSize: number): string[] {
  if (!content) return ['']

  const avgCharWidth = fontSize * 0.55
  const maxChars = Math.max(1, Math.floor(width / avgCharWidth))

  const result: string[] = []

  for (const paragraph of content.split('\n')) {
    if (paragraph === '') {
      result.push('')
      continue
    }

    const words = paragraph.split(' ')
    let currentLine = ''

    for (const word of words) {
      if (!currentLine) {
        currentLine = word
      } else {
        const testLine = `${currentLine} ${word}`
        if (testLine.length <= maxChars) {
          currentLine = testLine
        } else {
          result.push(currentLine)
          currentLine = word
        }
      }
    }
    result.push(currentLine)
  }

  return result.length > 0 ? result : ['']
}
