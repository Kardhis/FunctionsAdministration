export default function DailyChecklist() {
  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <p className="text-sm font-medium text-text-h">Checklist</p>
      <ul className="mt-3 space-y-2 text-sm text-text">
        <li className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" /> Leer 15 min
        </li>
        <li className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" /> Caminar
        </li>
        <li className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" /> Meditar
        </li>
      </ul>
    </div>
  )
}

