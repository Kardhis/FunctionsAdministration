import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import { listReminders, putReminder } from '../data/remindersRepo.js'
import { toIsoNow } from '../domain/time.js'

function downloadTextFile({ filename, text, mime }) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function HabitsSettingsPage() {
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)
  const enforceNoOverlap = useHabitAppStore((s) => s.settings.enforceNoOverlap)
  const theme = useHabitAppStore((s) => s.settings.theme)
  const setEnforceNoOverlap = useHabitAppStore((s) => s.setEnforceNoOverlap)
  const setTheme = useHabitAppStore((s) => s.setTheme)

  const [reminders, setReminders] = useState([])

  useEffect(() => {
    listReminders().then(setReminders)
  }, [])

  const exportPayload = useMemo(() => ({ exportedAt: toIsoNow(), habits, entries }), [entries, habits])

  async function seedReminderStub() {
    const r = {
      id: crypto.randomUUID?.() ?? `rm_${Date.now()}`,
      habitId: habits[0]?.id ?? null,
      title: 'Recordatorio (stub)',
      schedule: { kind: 'daily', time: '09:30' },
      enabled: false,
      createdAt: toIsoNow(),
    }
    await putReminder(r)
    setReminders(await listReminders())
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <p className="text-sm font-semibold text-text-h">Validación</p>
        <p className="mt-1 text-sm text-text">Opcional: bloquear solapes de registros el mismo día.</p>

        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 p-4">
          <span className="text-sm font-medium text-text-h">Evitar solapes</span>
          <input type="checkbox" className="h-4 w-4" checked={enforceNoOverlap} onChange={(e) => setEnforceNoOverlap(e.target.checked)} />
        </label>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-text-h">Tema</p>
        <p className="mt-1 text-sm text-text">Dark mode (persistido localmente).</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { key: 'system', label: 'Sistema' },
            { key: 'light', label: 'Claro' },
            { key: 'dark', label: 'Oscuro' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTheme(t.key)}
              className={[
                'rounded-2xl border px-4 py-3 text-sm font-medium transition',
                theme === t.key ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-text-h' : 'border-border bg-bg text-text-h hover:bg-black/5 dark:hover:bg-white/5',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-h">Exportación</p>
            <p className="mt-1 text-sm text-text">CSV/JSON de hábitos y registros (MVP).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                const csv = Papa.unparse(
                  entries.map((e) => ({
                    id: e.id,
                    habitId: e.habitId,
                    date: e.date,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    durationMinutes: e.durationMinutes,
                    notes: e.notes ?? '',
                  })),
                  { header: true },
                )
                downloadTextFile({ filename: 'habit_entries.csv', text: csv, mime: 'text/csv;charset=utf-8' })
              }}
            >
              CSV (registros)
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => downloadTextFile({ filename: 'habit_app.json', text: JSON.stringify(exportPayload, null, 2), mime: 'application/json' })}
            >
              JSON (todo)
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-h">Recordatorios (base)</p>
            <p className="mt-1 text-sm text-text">Estructura persistida para evolucionar a notificaciones reales.</p>
          </div>
          <Button variant="primary" type="button" onClick={seedReminderStub} disabled={!habits.length}>
            Añadir stub
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {reminders.length ? (
            reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-h">{r.title}</p>
                  <p className="truncate text-xs text-text">{JSON.stringify(r.schedule)}</p>
                </div>
                <Badge tone={r.enabled ? 'accent' : 'neutral'}>{r.enabled ? 'on' : 'off'}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-text">Sin recordatorios todavía.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
