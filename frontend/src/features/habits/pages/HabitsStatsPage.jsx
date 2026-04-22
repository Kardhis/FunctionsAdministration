import { useMemo, useState } from 'react'
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import Button from '../../../components/Button.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import { periodPresets, resolvePeriodRange } from '../domain/periods.js'
import { compareRanges, filterEntries, minutesByHabit, pieDataFromMinutesByHabit, barSeriesByDay, presetCompareWeekVsPrev, presetCompareMonthVsPrev } from '../domain/stats.js'
import { formatDurationHuman } from '../domain/time.js'

export default function HabitsStatsPage() {
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)

  const [preset, setPreset] = useState('last_30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [habitId, setHabitId] = useState('')
  const [category, setCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('all')

  const range = useMemo(() => resolvePeriodRange({ preset, customFrom, customTo }), [preset, customFrom, customTo])

  const filtered = useMemo(() => {
    const base = filterEntries(entries, habits, {
      habitId: habitId || undefined,
      category: category || undefined,
      activeOnly: activeOnly === 'all' ? undefined : activeOnly === 'true',
    })
    return base.filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= range.start && t <= range.end
    })
  }, [activeOnly, category, entries, habitId, habits, range.end, range.start])

  const byHabit = useMemo(() => minutesByHabit(filtered), [filtered])
  const pie = useMemo(() => pieDataFromMinutesByHabit(byHabit, habits), [byHabit, habits])
  const pieData = useMemo(() => pie.rows.map((r) => ({ name: r.name, value: r.minutes, color: r.color })).filter((r) => r.value > 0), [pie.rows])

  const bars = useMemo(() => barSeriesByDay({ range, entries: filtered }), [filtered, range])

  const lineByHabitTop = useMemo(() => {
    const top = pie.rows.slice(0, 2).map((r) => r.habitId)
    const days = bars.map((b) => b.day)
    return days.map((day) => {
      const row = { day }
      for (const id of top) {
        const minutes = filtered.filter((e) => e.habitId === id && e.date === day).reduce((a, e) => a + e.durationMinutes, 0)
        const h = habits.find((x) => x.id === id)
        row[h?.name ?? id] = minutes
      }
      return row
    })
  }, [bars, filtered, habits, pie.rows])

  const weekCmp = useMemo(() => {
    const { thisWeek, prevWeek } = presetCompareWeekVsPrev()
    const a = filterEntries(entries, habits, {}).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= thisWeek.start && t <= thisWeek.end
    })
    const b = filterEntries(entries, habits, {}).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= prevWeek.start && t <= prevWeek.end
    })
    return compareRanges({ entriesA: a, entriesB: b })
  }, [entries, habits])

  const monthCmp = useMemo(() => {
    const { thisMonth, prevMonth } = presetCompareMonthVsPrev()
    const a = filterEntries(entries, habits, {}).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= thisMonth.start && t <= thisMonth.end
    })
    const b = filterEntries(entries, habits, {}).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= prevMonth.start && t <= prevMonth.end
    })
    return compareRanges({ entriesA: a, entriesB: b })
  }, [entries, habits])

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-h">Filtros</p>
            <p className="mt-1 text-sm text-text">Los gráficos se recalculan automáticamente.</p>
          </div>
          <Badge tone="neutral">{filtered.length} registros</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Periodo</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={preset} onChange={(e) => setPreset(e.target.value)}>
              {periodPresets.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Hábito</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={habitId} onChange={(e) => setHabitId(e.target.value)}>
              <option value="">Todos</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Categoría</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas</option>
              <option value="salud">Salud</option>
              <option value="estudio">Estudio</option>
              <option value="trabajo">Trabajo</option>
              <option value="ejercicio">Ejercicio</option>
              <option value="ocio">Ocio</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Activo</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={activeOnly} onChange={(e) => setActiveOnly(e.target.value)}>
              <option value="all">Todos</option>
              <option value="true">Solo activos</option>
              <option value="false">Solo inactivos</option>
            </select>
          </label>

          {preset === 'custom' ? (
            <>
              <label className="lg:col-span-3">
                <span className="text-xs font-medium uppercase tracking-wide text-text">Desde</span>
                <input type="date" className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </label>
              <label className="lg:col-span-3">
                <span className="text-xs font-medium uppercase tracking-wide text-text">Hasta</span>
                <input type="date" className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </label>
            </>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold text-text-h">Comparativa semanal</p>
          <p className="mt-2 text-sm text-text">
            Esta semana: <span className="font-semibold text-text-h">{formatDurationHuman(weekCmp.a)}</span> · Semana anterior:{' '}
            <span className="font-semibold text-text-h">{formatDurationHuman(weekCmp.b)}</span>
          </p>
          <p className="mt-2 text-xs text-text">Delta: {formatDurationHuman(Math.abs(weekCmp.delta))} ({weekCmp.pct.toFixed(1)}%)</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-text-h">Comparativa mensual</p>
          <p className="mt-2 text-sm text-text">
            Este mes: <span className="font-semibold text-text-h">{formatDurationHuman(monthCmp.a)}</span> · Mes anterior:{' '}
            <span className="font-semibold text-text-h">{formatDurationHuman(monthCmp.b)}</span>
          </p>
          <p className="mt-2 text-xs text-text">Delta: {formatDurationHuman(Math.abs(monthCmp.delta))} ({monthCmp.pct.toFixed(1)}%)</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-h">Pie chart</p>
              <p className="mt-1 text-sm text-text">Tiempo por hábito en el periodo filtrado.</p>
            </div>
            <Badge tone="neutral">Pie</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} min`, 'Tiempo']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-text">Total: {formatDurationHuman(pie.total)}</p>
        </Card>

        <Card className="p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-h">Barras por día</p>
              <p className="mt-1 text-sm text-text">Tiempo total diario (filtrado).</p>
            </div>
            <Badge tone="accent">Bar</Badge>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="minutes" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-h">Evolución (top 2 hábitos)</p>
            <p className="mt-1 text-sm text-text">Líneas por día dentro del periodo filtrado.</p>
          </div>
          <Badge tone="neutral">Line</Badge>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineByHabitTop}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              {Object.keys(lineByHabitTop[0] ?? {})
                .filter((k) => k !== 'day')
                .map((k, idx) => (
                  <Line key={k} type="monotone" dataKey={k} strokeWidth={2} dot={false} stroke={idx === 0 ? '#7c3aed' : '#0ea5e9'} />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={() => window.alert('Exportación: ver pantalla Ajustes (CSV/JSON).')}>
            Exportar desde Ajustes
          </Button>
        </div>
      </Card>
    </div>
  )
}
