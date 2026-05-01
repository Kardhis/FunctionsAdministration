import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from 'recharts'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import { filterEntries, minutesByHabit, pieDataFromMinutesByHabit, barSeriesByDay, summaryStats, computeHabitStreakDays } from '../domain/stats.js'
import { resolvePeriodRange } from '../domain/periods.js'
import { formatDurationHuman, todayLocalDateString } from '../domain/time.js'
import { formatDateEs } from '../../../data/dateFormat.js'

export default function HabitsOverviewPage() {
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)

  const today = todayLocalDateString()
  const todayEntries = useMemo(() => entries.filter((e) => e.date === today), [entries, today])
  const todayMinutes = useMemo(() => todayEntries.reduce((a, e) => a + e.durationMinutes, 0), [todayEntries])

  const weekRange = useMemo(() => resolvePeriodRange({ preset: 'this_week' }), [])
  const weekEntries = useMemo(() => {
    return filterEntries(entries, habits, { activeOnly: true }).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= weekRange.start && t <= weekRange.end
    })
  }, [entries, habits, weekRange.end, weekRange.start])

  const weekByHabit = useMemo(() => minutesByHabit(weekEntries), [weekEntries])
  const top3 = useMemo(() => {
    const rows = [...weekByHabit.entries()]
      .map(([habitId, minutes]) => {
        const h = habits.find((x) => x.id === habitId)
        return { habitId, name: h?.name ?? 'Hábito', minutes, color: h?.color ?? '#888' }
      })
      .sort((a, b) => b.minutes - a.minutes)
    return rows.slice(0, 3)
  }, [habits, weekByHabit])

  const pie = useMemo(() => pieDataFromMinutesByHabit(weekByHabit, habits), [habits, weekByHabit])
  const pieChartData = useMemo(
    () => pie.rows.map((r) => ({ name: r.name, value: r.minutes, color: r.color })).filter((r) => r.value > 0),
    [pie.rows],
  )

  const last7 = useMemo(() => resolvePeriodRange({ preset: 'last_7' }), [])
  const last7Entries = useMemo(() => {
    return filterEntries(entries, habits, { activeOnly: true }).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= last7.start && t <= last7.end
    })
  }, [entries, habits, last7.end, last7.start])
  const bars = useMemo(() => barSeriesByDay({ range: last7, entries: last7Entries }), [last7, last7Entries])

  const weekSummary = useMemo(() => summaryStats({ entries: weekEntries, range: weekRange }), [weekEntries, weekRange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-text">Tiempo hoy</p>
          <p className="mt-2 text-3xl font-semibold text-text-h">{formatDurationHuman(todayMinutes)}</p>
          <p className="mt-2 text-xs text-text">{todayEntries.length} registros</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-text">Semana (resumen)</p>
          <p className="mt-2 text-3xl font-semibold text-text-h">{formatDurationHuman(weekSummary.totalMinutes)}</p>
          <p className="mt-2 text-xs text-text">
            Media diaria (rango): <span className="font-medium text-text-h">{Math.round(weekSummary.avgMinutesPerDayInRange)} min</span>
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-text">Top hábito (semana)</p>
          <p className="mt-2 text-xl font-semibold text-text-h">{top3[0]?.name ?? '—'}</p>
          <p className="mt-2 text-xs text-text">{top3[0] ? `${formatDurationHuman(top3[0].minutes)}` : 'Sin datos'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-h">Últimos 7 días</p>
              <p className="mt-1 text-sm text-text">Tiempo total por día (minutos).</p>
            </div>
            <Badge tone="accent">Bar</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={(v) => formatDateEs(v)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="minutes" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-h">Distribución (semana)</p>
              <p className="mt-1 text-sm text-text">Pie por tiempo total.</p>
            </div>
            <Badge tone="neutral">Pie</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} min`, 'Tiempo']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-text">Total semana: {formatDurationHuman(pie.total)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold text-text-h">Top 3 de la semana</p>
          <div className="mt-4 space-y-3">
            {top3.length ? (
              top3.map((t, idx) => (
                <div key={t.habitId} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-h">
                      {idx + 1}. {t.name}
                    </p>
                    <p className="text-xs text-text">Racha: {computeHabitStreakDays({ habitId: t.habitId, entries })} día(s)</p>
                  </div>
                  <Badge tone="neutral">{formatDurationHuman(t.minutes)}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-text">Sin datos todavía.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
