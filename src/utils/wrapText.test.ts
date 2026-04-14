import { describe, it, expect } from 'vitest'
import { wrapText } from './wrapText'

describe('wrapText', () => {
  // ── Cas limites ──────────────────────────────────────────────

  it('returns [""] for an empty string', () => {
    expect(wrapText('', 200, 16)).toEqual([''])
  })

  it('returns [""] for undefined-ish falsy content', () => {
    // The function checks `if (!content)` — null / undefined coerced
    expect(wrapText(null as unknown as string, 200, 16)).toEqual([''])
  })

  it('returns a single word unwrapped', () => {
    // "Hello" = 5 chars, avgCharWidth = 16*0.55 = 8.8, maxChars = floor(200/8.8) = 22
    // 5 < 22 → fits on one line
    expect(wrapText('Hello', 200, 16)).toEqual(['Hello'])
  })

  // ── Wrapping ─────────────────────────────────────────────────

  it('wraps text that exceeds the available width', () => {
    // fontSize=16 → avgCharWidth=8.8 → maxChars = floor(100/8.8) = 11
    // "Hello World Bonjour" should wrap because "Hello World" = 11 chars (fits), "Bonjour" goes to next line
    const lines = wrapText('Hello World Bonjour', 100, 16)
    expect(lines.length).toBeGreaterThan(1)
    // Every line should be non-empty (words are short enough individually)
    lines.forEach((line) => expect(line.length).toBeGreaterThan(0))
  })

  it('keeps short text on one line when it fits', () => {
    // fontSize=14 → avgCharWidth=7.7, maxChars = floor(300/7.7) = 38
    // "Short text" = 10 chars → fits easily
    expect(wrapText('Short text', 300, 14)).toEqual(['Short text'])
  })

  // ── Newlines explicites ──────────────────────────────────────

  it('respects explicit \\n newlines', () => {
    const lines = wrapText('Line one\nLine two\nLine three', 500, 16)
    expect(lines).toEqual(['Line one', 'Line two', 'Line three'])
  })

  it('preserves empty lines between paragraphs', () => {
    const lines = wrapText('Above\n\nBelow', 500, 16)
    expect(lines).toEqual(['Above', '', 'Below'])
  })

  // ── Mot très long ────────────────────────────────────────────

  it('does not break a single very long word (no hyphenation)', () => {
    const longWord = 'Supercalifragilisticexpialidocious'
    // fontSize=16, width=50 → maxChars = floor(50/8.8) = 5
    // The word is much longer than 5 chars, but the algorithm
    // never splits within a word — it just pushes the whole word.
    const lines = wrapText(longWord, 50, 16)
    expect(lines).toEqual([longWord])
  })

  // ── Interaction fontSize / largeur ───────────────────────────

  it('wraps more aggressively with larger fontSize at same width', () => {
    const sentence = 'The quick brown fox jumps over the lazy dog'
    const linesSmall = wrapText(sentence, 200, 12) // avgChar=6.6 → maxChars=30
    const linesBig = wrapText(sentence, 200, 24) // avgChar=13.2 → maxChars=15
    expect(linesBig.length).toBeGreaterThan(linesSmall.length)
  })
})
