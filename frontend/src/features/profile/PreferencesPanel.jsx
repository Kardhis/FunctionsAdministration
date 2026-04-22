export default function PreferencesPanel() {
  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <p className="text-sm font-medium text-text-h">Preferencias</p>
      <div className="mt-3 space-y-3 text-sm text-text">
        <label className="flex items-center justify-between gap-3">
          <span>Recordatorios</span>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Resumen semanal</span>
          <input type="checkbox" className="h-4 w-4" />
        </label>
      </div>
    </div>
  )
}

