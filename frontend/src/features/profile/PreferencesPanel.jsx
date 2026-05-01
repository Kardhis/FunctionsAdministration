import { useEffect, useState } from 'react'
import { applyThemeToRoot, loadThemeSetting, saveThemeSetting } from '../../theme/theme.js'

export default function PreferencesPanel() {
  const [theme, setTheme] = useState('system')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadThemeSetting()
      .then((t) => setTheme(String(t || 'system')))
      .catch(() => setTheme('system'))
  }, [])

  async function setAndApply(next) {
    setTheme(next)
    applyThemeToRoot(next)
    setSaving(true)
    try {
      await saveThemeSetting(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text-h">Tema</p>
            <p className="mt-1 text-sm text-text">Cambia entre modo claro y oscuro (persistido).</p>
          </div>
          {saving ? <span className="ui-chip">Guardando…</span> : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { key: 'light', label: 'Claro' },
            { key: 'dark', label: 'Oscuro' },
            { key: 'system', label: 'Sistema' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setAndApply(t.key)}
              className={[
                'rounded-2xl border px-4 py-3 text-sm font-medium transition-[background,border-color,color,transform] duration-200 ease-out',
                theme === t.key
                  ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-text-h'
                  : 'border-border bg-transparent text-text-h hover:bg-white/5',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
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
    </div>
  )
}

