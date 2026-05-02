export default function MonthGrid() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-border bg-bg/60 p-2 sm:p-4">
      <div className="grid min-w-[280px] grid-cols-7 gap-1 text-center text-[10px] text-text sm:gap-2 sm:text-xs">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} className="py-1.5 font-medium sm:py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-2 grid min-w-[280px] grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square min-w-0 rounded-xl border border-border bg-bg p-1 text-[10px] text-text shadow-soft sm:rounded-2xl sm:p-2 sm:text-xs">
            <div className="truncate text-text-h">{(i % 30) + 1}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

