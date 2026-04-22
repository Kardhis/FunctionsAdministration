export default function KpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {['Consistencia', 'Mejor hábito', 'Tendencia'].map((t) => (
        <div key={t} className="rounded-2xl border border-border bg-bg/60 p-4">
          <p className="text-sm text-text">{t}</p>
          <p className="mt-2 text-2xl font-semibold text-text-h">—</p>
        </div>
      ))}
    </div>
  )
}

