export function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-text-h">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-text">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

