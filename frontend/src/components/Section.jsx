export function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-text-h">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-text">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0 sm:ml-auto">{right}</div> : null}
    </div>
  )
}

