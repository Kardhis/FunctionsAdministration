import { useEffect, useState } from 'react'
import { apiFetch } from '../../data/api.js'

export default function KpiGrid() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const now = new Date()
    const toDate = now.toISOString().slice(0, 10)
    const from = new Date(now)
    from.setDate(now.getDate() - 6)
    const fromDate = from.toISOString().slice(0, 10)

    apiFetch(`/api/stats?${new URLSearchParams({ fromDate, toDate }).toString()}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const totalMinutes = data?.totalMinutes ?? null
  const totalSessions = data?.totalSessions ?? null
  const habits = Array.isArray(data?.byHabit) ? data.byHabit : []
  const best = habits.slice().sort((a, b) => (b.totalMinutes ?? 0) - (a.totalMinutes ?? 0))[0] ?? null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-bg/60 p-4">
        <p className="text-sm text-text">Sesiones (7 días)</p>
        <p className="mt-2 text-2xl font-semibold text-text-h">{totalSessions ?? '—'}</p>
      </div>
      <div className="rounded-2xl border border-border bg-bg/60 p-4">
        <p className="text-sm text-text">Minutos (7 días)</p>
        <p className="mt-2 text-2xl font-semibold text-text-h">{totalMinutes ?? '—'}</p>
      </div>
      <div className="rounded-2xl border border-border bg-bg/60 p-4">
        <p className="text-sm text-text">Mejor hábito</p>
        <p className="mt-2 text-2xl font-semibold text-text-h">{best ? `${best.habitId}` : '—'}</p>
        <p className="mt-1 text-xs text-text">{best ? `${best.totalMinutes} min` : ''}</p>
      </div>
      {error ? (
        <p className="md:col-span-3 text-sm text-red-600 dark:text-red-400">
          Error cargando stats: <code>{error}</code>
        </p>
      ) : null}
    </div>
  )
}

