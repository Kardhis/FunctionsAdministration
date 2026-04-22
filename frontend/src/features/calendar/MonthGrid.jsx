export default function MonthGrid() {
  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-text">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} className="py-2 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl border border-border bg-bg p-2 text-xs text-text shadow-soft">
            <div className="text-text-h">{(i % 30) + 1}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

