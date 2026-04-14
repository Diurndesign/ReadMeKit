/**
 * Grille de cases à cocher pour activer / désactiver chaque section du README.
 * Utilise README_SECTIONS (ordre canonique + labels) défini dans buildReadmeString.
 */
import { README_SECTIONS } from '../../utils/buildReadmeString'

interface Props {
  sections: Record<string, boolean>
  onChange: (sections: Record<string, boolean>) => void
}

export function ReadmeSectionPicker({ sections, onChange }: Props) {
  const toggle = (key: string) =>
    onChange({ ...sections, [key]: !sections[key] })

  return (
    <section>
      <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest mb-3">
        Sections
      </p>
      <div className="flex flex-col gap-2">
        {README_SECTIONS.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!sections[key]}
              onChange={() => toggle(key)}
              className="accent-[#6366f1]"
            />
            <span className="text-[12px] text-[#d4d4d8] group-hover:text-white transition-colors">
              {label}
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}
