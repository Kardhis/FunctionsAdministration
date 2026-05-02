import { useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import { getWeekRangeMonday } from '../domain/periods.js'
import { formatDurationHuman } from '../domain/time.js'
import { formatDateEs } from '../../../data/dateFormat.js'

export default function HabitsWeekPage() {
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)

  const [offset, setOffset] = useState(0) // weeks offset from current
  const anchor = useMemo(() => addDays(new Date(), offset * 7), [offset])
  const week = useMemo(() => getWeekRangeMonday(anchor), [anchor])

  const days = useMemo(() => {
    const out = []
    let d = week.start
    for (let i = 0; i < 7; i += 1) {
      out.push(format(d, 'yyyy-MM-dd'))
      d = addDays(d, 1)
    }
    return out
  }, [week.start])

  const matrix = useMemo(() => {
    const activeHabits = habits.filter((h) => h.active).slice().sort((a, b) => a.name.localeCompare(b.name))
    return activeHabits.map((h) => {
      const row = days.map((day) => {
        const minutes = entries.filter((e) => e.habitId === h.id && e.date === day).reduce((a, e) => a + e.durationMinutes, 0)
        return { day, minutes }
      })
      const total = row.reduce((a, x) => a + x.minutes, 0)
      return { habit: h, row, total }
    })
  }, [days, entries, habits])

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Vista semanal</p>
          <p className="mt-1 text-sm text-text">
            {formatDateEs(format(week.start, 'yyyy-MM-dd'))} → {formatDateEs(format(week.end, 'yyyy-MM-dd'))}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm" onClick={() => setOffset((v) => v - 1)}>
            ← Semana
          </button>
          <button type="button" className="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm" onClick={() => setOffset(0)}>
            Hoy
          </button>
          <button type="button" className="min-h-11 rounded-xl border border-border bg-bg px-3 py-2 text-sm" onClick={() => setOffset((v) => v + 1)}>
            Semana →
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3 lg:hidden">
        {matrix.map((m) => (
          <div key={m.habit.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">{m.habit.icon || '•'}</span>
              <span className="min-w-0 text-base font-semibold text-text-h">{m.habit.name}</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
              {m.row.map((cell) => (
                <div key={cell.day} className="min-w-0">
                  <p className="text-[10px] font-medium uppercase leading-tight text-text">{formatDateEs(cell.day).slice(0, 5)}</p>
                  <div className="mt-1 min-h-[2rem]">
                    {cell.minutes > 0 ? (
                      <Badge tone="accent" className="max-w-full justify-center px-1 py-0.5 text-[10px]">
                        {formatDurationHuman(cell.minutes)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-text">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-border pt-3 text-sm font-semibold text-text-h">Total: {formatDurationHuman(m.total)}</p>
          </div>
        ))}
        {!matrix.length ? <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">No hay hábitos activos esta semana.</p> : null}
      </div>

      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="min-w-[980px] w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-text">
              <th className="px-2">Hábito</th>
              {days.map((d) => (
                <th key={d} className="px-2">
                  {formatDateEs(d).slice(0, 5)}
                </th>
              ))}
              <th className="px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((m) => (
              <tr key={m.habit.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.habit.icon || '•'}</span>
                    <span className="text-sm font-semibold text-text-h">{m.habit.name}</span>
                  </div>
                </td>
                {m.row.map((cell) => (
                  <td key={cell.day} className="px-2 py-3">
                    {cell.minutes > 0 ? <Badge tone="accent">{formatDurationHuman(cell.minutes)}</Badge> : <span className="text-sm text-text">—</span>}
                  </td>
                ))}
                <td className="px-2 py-3 text-right text-sm font-semibold text-text-h">{formatDurationHuman(m.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
