export default function DailyNotes() {
  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <p className="text-sm font-medium text-text-h">Notas</p>
      <textarea
        rows={8}
        className="mt-3 w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="¿Cómo fue tu día?"
      />
    </div>
  )
}

