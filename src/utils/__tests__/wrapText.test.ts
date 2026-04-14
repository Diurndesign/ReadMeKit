import { describe, expect, it } from 'vitest'
import { wrapText } from '../wrapText'

describe('wrapText', () => {
  it('returns [""] for empty content', () => {
    expect(wrapText('', 200, 16)).toEqual([''])
  })

  it('returns a single line when text fits', () => {
    const result = wrapText('Hello', 200, 16)
    expect(result).toEqual(['Hello'])
  })

  it('wraps a long line into multiple lines', () => {
    // avgCharWidth = 16 * 0.55 = 8.8 → maxChars ≈ floor(200/8.8) = 22
    // "word1 word2 word3 word4 word5" → should split
    const result = wrapText('one two three four five six seven eight nine ten', 200, 16)
    expect(result.length).toBeGreaterThan(1)
  })

  it('preserves explicit newlines as separate lines', () => {
    const result = wrapText('line one\nline two\nline three', 400, 14)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('line one')
    expect(result[1]).toBe('line two')
    expect(result[2]).toBe('line three')
  })

  it('produces an empty string entry for blank lines', () => {
    const result = wrapText('before\n\nafter', 400, 14)
    expect(result).toHaveLength(3)
    expect(result[1]).toBe('')
  })

  it('never returns an empty array', () => {
    expect(wrapText('', 100, 12).length).toBeGreaterThan(0)
    expect(wrapText('a', 1, 100).length).toBeGreaterThan(0)
  })

  it('handles a single very long word without crashing', () => {
    const longWord = 'abcdefghijklmnopqrstuvwxyz'.repeat(5)
    const result = wrapText(longWord, 100, 16)
    // Should not crash; the word goes on its own line
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.join('')).toContain('abcdefghijklmnopqrstuvwxyz')
  })

  it('wraps each paragraph independently when multiple newlines are present', () => {
    // Two paragraphs, each long enough to wrap
    const para = 'alpha beta gamma delta epsilon zeta eta theta iota'
    const result = wrapText(`${para}\n${para}`, 120, 16)
    // Each paragraph should produce at least 2 lines (120px / (16*0.55) ≈ 13 chars)
    expect(result.length).toBeGreaterThan(2)
  })

  it('larger font size reduces maxChars, causing more wrapping', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    const smallFont = wrapText(text, 300, 12)
    const largeFont = wrapText(text, 300, 32)
    expect(largeFont.length).toBeGreaterThanOrEqual(smallFont.length)
  })

  it('wider container reduces wrapping', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    const narrow = wrapText(text, 100, 16)
    const wide = wrapText(text, 600, 16)
    expect(wide.length).toBeLessThanOrEqual(narrow.length)
  })
})
