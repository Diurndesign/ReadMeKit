import { describe, expect, it } from 'vitest'
import { buildReadmeString, DEFAULT_SECTIONS } from '../buildReadmeString'

const base = {
  projectName: 'My Project',
  bannerFile: './readmekit-banner.svg',
  sections: { ...DEFAULT_SECTIONS },
  links: [],
}

describe('buildReadmeString', () => {
  it('starts with the ReadMeKit attribution comment', () => {
    expect(buildReadmeString(base)).toMatch(/^<!-- Généré avec ReadMeKit/)
  })

  it('embeds the banner SVG image with correct alt text', () => {
    const md = buildReadmeString(base)
    expect(md).toContain('<img src="./readmekit-banner.svg" alt="My Project" />')
  })

  it('uses the provided banner filename', () => {
    const md = buildReadmeString({ ...base, bannerFile: './my-banner.svg' })
    expect(md).toContain('src="./my-banner.svg"')
  })

  it('includes all default-enabled sections', () => {
    const md = buildReadmeString(base)
    expect(md).toContain('## Description')
    expect(md).toContain('## Installation')
    expect(md).toContain('## Usage')
    expect(md).toContain('## Features')
    expect(md).toContain('## License')
  })

  it('omits Contributing by default', () => {
    expect(buildReadmeString(base)).not.toContain('## Contributing')
  })

  it('includes Contributing when explicitly enabled', () => {
    const md = buildReadmeString({
      ...base,
      sections: { ...DEFAULT_SECTIONS, contributing: true },
    })
    expect(md).toContain('## Contributing')
  })

  it('omits a section when disabled', () => {
    const md = buildReadmeString({
      ...base,
      sections: { ...DEFAULT_SECTIONS, description: false },
    })
    expect(md).not.toContain('## Description')
  })

  it('generates a valid kebab-case package name in the install command', () => {
    const md = buildReadmeString({ ...base, projectName: 'My Cool Project' })
    expect(md).toContain('npm install my-cool-project')
  })

  it('uses package name in the usage import statement', () => {
    const md = buildReadmeString({ ...base, projectName: 'My Lib' })
    expect(md).toContain("from 'my-lib'")
  })

  it('renders links as HTML anchors', () => {
    const md = buildReadmeString({
      ...base,
      links: [{ label: 'Site', url: 'https://example.com' }],
    })
    expect(md).toContain('<a href="https://example.com">Site</a>')
  })

  it('renders multiple links separated by bullet points', () => {
    const md = buildReadmeString({
      ...base,
      links: [
        { label: 'Site', url: 'https://a.com' },
        { label: 'Docs', url: 'https://b.com' },
      ],
    })
    expect(md).toContain('•')
    expect(md).toContain('<a href="https://a.com">Site</a>')
    expect(md).toContain('<a href="https://b.com">Docs</a>')
  })

  it('omits the links block when no links are provided', () => {
    expect(buildReadmeString(base)).not.toContain('<a href=')
  })

  it('ignores links with empty label or url', () => {
    const md = buildReadmeString({
      ...base,
      links: [{ label: '', url: 'https://example.com' }, { label: 'Site', url: '' }],
    })
    expect(md).not.toContain('<a href=')
  })

  it('handles empty project name gracefully', () => {
    const md = buildReadmeString({ ...base, projectName: '' })
    expect(md).toContain('Mon Projet')
    expect(md).toContain('mon-projet')
  })

  it('ends with a single newline', () => {
    const md = buildReadmeString(base)
    expect(md.endsWith('\n')).toBe(true)
    expect(md.endsWith('\n\n')).toBe(false)
  })

  it('produces empty output when all sections are disabled', () => {
    const off = Object.fromEntries(Object.keys(DEFAULT_SECTIONS).map((k) => [k, false]))
    const md = buildReadmeString({ ...base, sections: off })
    // Should still have the banner, just no section headings
    expect(md).toContain('<img')
    expect(md).not.toContain('##')
  })
})
