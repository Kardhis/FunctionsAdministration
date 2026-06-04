import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useIsLgUp } from '../../../hooks/useMediaQuery.js'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, LabelList } from 'recharts'
import Button from '../../../components/Button.jsx'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import DatePickerInput from '../../../components/DatePickerInput.jsx'
import DashboardCard from '../../../components/ui/DashboardCard.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import {
  filterEntries,
  minutesByHabit,
  pieDataFromMinutesByHabit,
  percentRowsByHabit,
  barSeriesByDay,
  summaryStats,
  computeHabitStreakDays,
} from '../domain/stats.js'
import { formatRangeLabel, resolvePeriodRange } from '../domain/periods.js'
import { formatDurationHuman, todayLocalDateString } from '../domain/time.js'
import { formatDateEs } from '../../../data/dateFormat.js'
import { listObjectives } from '../../objectives/data/objectivesRepo.js'

function initialMonthRangeState() {
  const range = resolvePeriodRange({ preset: 'this_month' })
  return {
    range,
    from: format(range.start, 'yyyy-MM-dd'),
    to: format(range.end, 'yyyy-MM-dd'),
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function percentColor(pct) {
  // 0% -> red (0deg), 100% -> green (120deg)
  const hue = clamp(pct, 0, 100) * 1.2
  return `hsl(${hue} 80% 45%)`
}

export default function HabitsOverviewPage() {
  const isLgUp = useIsLgUp()
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)
  const bootstrapped = useHabitAppStore((s) => s.bootstrapped)

  const [objectives, setObjectives] = useState([])
  const [objectivesError, setObjectivesError] = useState('')

  const monthInit = useMemo(() => initialMonthRangeState(), [])
  const [draftFrom, setDraftFrom] = useState(monthInit.from)
  const [draftTo, setDraftTo] = useState(monthInit.to)
  const [appliedRange, setAppliedRange] = useState(monthInit.range)
  const [rangeError, setRangeError] = useState('')

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

  const weekHabitBars = useMemo(() => {
    const rows = [...weekByHabit.entries()]
      .map(([habitId, minutes]) => {
        const h = habits.find((x) => x.id === habitId)
        return {
          habitId,
          name: h?.name ?? String(habitId),
          minutes,
          color: h?.color ?? 'var(--chart-1)',
        }
      })
      .filter((r) => (r.minutes ?? 0) > 0)
      .sort((a, b) => b.minutes - a.minutes)

    return rows
  }, [habits, weekByHabit])

  const last7 = useMemo(() => resolvePeriodRange({ preset: 'last_7' }), [])
  const last7Entries = useMemo(() => {
    return filterEntries(entries, habits, { activeOnly: true }).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= last7.start && t <= last7.end
    })
  }, [entries, habits, last7.end, last7.start])
  const bars = useMemo(() => barSeriesByDay({ range: last7, entries: last7Entries }), [last7, last7Entries])

  const weekSummary = useMemo(() => summaryStats({ entries: weekEntries, range: weekRange }), [weekEntries, weekRange])

  const percentEntries = useMemo(() => {
    return filterEntries(entries, habits, { activeOnly: true }).filter((e) => {
      const t = new Date(`${e.date}T00:00:00`)
      return t >= appliedRange.start && t <= appliedRange.end
    })
  }, [appliedRange.end, appliedRange.start, entries, habits])

  const percentStats = useMemo(() => percentRowsByHabit(percentEntries, habits), [percentEntries, habits])
  const percentPieData = useMemo(
    () =>
      percentStats.rows.map((r) => ({
        habitId: r.habitId,
        name: r.name,
        value: r.percent,
        color: r.color,
        minutes: r.minutes,
      })),
    [percentStats.rows],
  )

  const appliedRangeLabel = useMemo(() => formatRangeLabel(appliedRange), [appliedRange])

  const handleRecalculatePercentages = useCallback(() => {
    if (!draftFrom || !draftTo) {
      setRangeError('Indica fecha desde y fecha hasta.')
      return
    }
    if (draftFrom > draftTo) {
      setRangeError('La fecha desde no puede ser posterior a la fecha hasta.')
      return
    }
    setRangeError('')
    setAppliedRange(resolvePeriodRange({ preset: 'custom', customFrom: draftFrom, customTo: draftTo }))
  }, [draftFrom, draftTo])

  const chartTooltipStyle = useMemo(
    () => ({
      background: 'var(--surface-3)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-float)',
      color: 'var(--text-h)',
    }),
    [],
  )

  const chartTooltipLabelStyle = useMemo(() => ({ color: 'var(--text)' }), [])

  useEffect(() => {
    if (!bootstrapped) return undefined
    let mounted = true
    setObjectivesError('')
    listObjectives({ status: 'IN_PROGRESS' })
      .then((rows) => {
        if (!mounted) return
        const arr = Array.isArray(rows) ? rows : []
        const mapped = arr
          .map((o) => {
            const target = Number(o?.targetValue ?? 0) || 0
            const progress = Number(o?.progressValue ?? 0) || 0
            const pct = target > 0 ? clamp((progress / target) * 100, 0, 100) : 0
            return {
              id: String(o?.id ?? ''),
              habitName: String(o?.habitName ?? 'Hábito'),
              metricType: String(o?.metricType ?? ''),
              targetValue: target,
              progressValue: progress,
              startDate: o?.startDate ?? null,
              endDate: o?.endDate ?? null,
              pct,
            }
          })
          .filter((x) => x.id)
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 6)
        setObjectives(mapped)
      })
      .catch((e) => {
        if (!mounted) return
        setObjectivesError(e instanceof Error ? e.message : String(e))
        setObjectives([])
      })
    return () => {
      mounted = false
    }
  }, [bootstrapped])

  return (
    <div className="space-y-[var(--space-section-gap)]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Tiempo hoy"
          value={formatDurationHuman(todayMinutes)}
          subtitle={`${todayEntries.length} registro(s)`}
          icon="⏱"
        />
        <DashboardCard
          title="Semana (resumen)"
          value={formatDurationHuman(weekSummary.totalMinutes)}
          subtitle={`Media diaria (rango): ${Math.round(weekSummary.avgMinutesPerDayInRange)} min`}
          icon="▦"
        />
        <DashboardCard
          title="Top hábito (semana)"
          value={top3[0]?.name ?? '—'}
          subtitle={top3[0] ? `${formatDurationHuman(top3[0].minutes)}` : 'Sin datos'}
          icon="✦"
        />
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-h">Objetivos en progreso</p>
              <p className="mt-1 text-sm text-text">Progreso calculado sobre el objetivo activo.</p>
            </div>
            <Badge tone="neutral">{objectives.length}</Badge>
          </div>

          {objectivesError ? (
            <div className="mt-4 rounded-2xl border border-border bg-[color:var(--surface-2)] p-4 text-sm text-[color:var(--danger)]">
              Error cargando objetivos: <code>{objectivesError}</code>
            </div>
          ) : null}

          {objectives.length ? (
            <div className="mt-4 space-y-3">
              {objectives.map((o) => {
                const color = percentColor(o.pct)
                const label = `${Math.round(o.pct)}%`
                const valueLabel =
                  o.metricType === 'MINUTES'
                    ? `${formatDurationHuman(o.progressValue)} / ${formatDurationHuman(o.targetValue)}`
                    : `${o.progressValue} / ${o.targetValue}`

                return (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate text-sm font-semibold text-text-h">{o.habitName}</p>
                          <span className="text-xs text-muted">
                            {o.startDate ? formatDateEs(o.startDate) : '—'} → {o.endDate ? formatDateEs(o.endDate) : '—'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted">{valueLabel}</p>
                      </div>
                      <div className="shrink-0">
                        <span
                          className="ui-chip"
                          style={{
                            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, var(--border))`,
                            color,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${o.pct}%`,
                          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, white))`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
              <p className="text-sm font-medium text-text-h">Sin objetivos en progreso</p>
              <p className="mt-1 text-sm text-text">Crea un objetivo para ver aquí tu avance en %.</p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-h">Distribución del tiempo (%)</p>
              <p className="mt-1 text-sm text-text">
                Porcentaje sobre el tiempo imputado en el periodo. Por defecto, mes en curso ({appliedRangeLabel}).
              </p>
            </div>
            <Badge tone="accent">{appliedRangeLabel}</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <label className="lg:col-span-4">
              <span className="text-xs font-medium uppercase tracking-wide text-text">Fecha desde</span>
              <DatePickerInput value={draftFrom} onChange={setDraftFrom} label="Fecha desde" />
            </label>
            <label className="lg:col-span-4">
              <span className="text-xs font-medium uppercase tracking-wide text-text">Fecha hasta</span>
              <DatePickerInput value={draftTo} onChange={setDraftTo} label="Fecha hasta" />
            </label>
            <div className="lg:col-span-4">
              <Button
                id="habit-percent-recalculate"
                type="button"
                variant="primary"
                className="w-full"
                onClick={handleRecalculatePercentages}
                disabled={!draftFrom || !draftTo}
              >
                Recalcular porcentajes
              </Button>
            </div>
          </div>

          {rangeError ? (
            <p className="mt-3 text-sm text-[color:var(--danger)]" role="alert">
              {rangeError}
            </p>
          ) : null}

          {percentPieData.length ? (
            <>
              <div
                id="habit-percent-chart"
                className={`mt-4 min-w-0 overflow-hidden ${isLgUp ? 'h-[300px]' : 'h-[240px] sm:h-[280px]'}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={percentPieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={isLgUp ? 50 : 40}
                      outerRadius={isLgUp ? 88 : 70}
                      paddingAngle={2}
                    >
                      {percentPieData.map((entry) => (
                        <Cell key={entry.habitId} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartTooltipLabelStyle}
                      formatter={(value, _name, item) => {
                        const minutes = item?.payload?.minutes ?? 0
                        return [`${Number(value).toFixed(1)}% · ${formatDurationHuman(minutes)}`, 'Tiempo']
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2" aria-label="Desglose por hábito">
                {percentStats.rows.map((r) => (
                  <li
                    key={r.habitId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[color:var(--surface-2)] px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: r.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-text-h">{r.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-text">
                      {r.percent.toFixed(1)}% · {formatDurationHuman(r.minutes)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
              <p className="text-sm font-medium text-text-h">Sin tiempo imputado en este periodo</p>
              <p className="mt-1 text-sm text-text">
                Registra sesiones en el periodo ({appliedRangeLabel}) o ajusta las fechas y pulsa «Recalcular porcentajes».
              </p>
            </div>
          )}

          <p className="mt-2 text-xs text-text">
            Total imputado ({appliedRangeLabel}): {formatDurationHuman(percentStats.totalMinutes)}
          </p>
        </Card>

        <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-h">Tiempo por hábito (semana)</p>
                <p className="mt-1 text-sm text-text">Lunes → Domingo, ordenado de mayor a menor.</p>
              </div>
              <Badge tone="accent">Semana</Badge>
            </div>

            {weekHabitBars.length ? (
              <div className={`mt-4 min-w-0 overflow-hidden ${isLgUp ? 'h-[320px]' : 'h-[260px] sm:h-[300px]'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekHabitBars}
                    layout="vertical"
                    margin={{ left: isLgUp ? 8 : 4, right: isLgUp ? 72 : 4, top: 8, bottom: 8 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: isLgUp ? 12 : 10, fill: 'var(--text)' }}
                      axisLine={{ stroke: 'var(--divider)' }}
                      tickLine={{ stroke: 'var(--divider)' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      interval={0}
                      width={isLgUp ? 140 : 88}
                      tickMargin={isLgUp ? 10 : 6}
                      tick={{ fontSize: isLgUp ? 12 : 10, fill: 'var(--text)' }}
                      axisLine={{ stroke: 'var(--divider)' }}
                      tickLine={{ stroke: 'var(--divider)' }}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={chartTooltipLabelStyle}
                      formatter={(value) => [`${value} min`, 'Tiempo']}
                    />
                    <Bar dataKey="minutes" radius={[10, 10, 10, 10]}>
                      {weekHabitBars.map((row) => (
                        <Cell key={row.habitId} fill={row.color} />
                      ))}
                      {isLgUp ? (
                        <LabelList
                          dataKey="minutes"
                          position="right"
                          formatter={(v) => formatDurationHuman(Number(v) || 0)}
                          style={{ fill: 'var(--text-h)', fontSize: 12, fontWeight: 600 }}
                        />
                      ) : null}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
                <p className="text-sm font-medium text-text-h">Sin datos esta semana</p>
                <p className="mt-1 text-sm text-text">Cuando registres sesiones, verás aquí el tiempo invertido por hábito.</p>
              </div>
            )}
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-5 xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-h">Últimos 7 días</p>
                <p className="mt-1 text-sm text-text">Tiempo total por día (minutos).</p>
              </div>
              <Badge tone="accent">Bar</Badge>
            </div>
            <div className={`mt-4 min-w-0 overflow-hidden ${isLgUp ? 'h-64' : 'h-52 sm:h-60'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars} margin={{ left: 4, right: 8, bottom: isLgUp ? 8 : 20, top: 8 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: isLgUp ? 12 : 10, fill: 'var(--text)' }}
                    axisLine={{ stroke: 'var(--divider)' }}
                    tickLine={{ stroke: 'var(--divider)' }}
                    tickFormatter={(v) => formatDateEs(v)}
                    angle={isLgUp ? 0 : -35}
                    textAnchor={isLgUp ? 'middle' : 'end'}
                    height={isLgUp ? 30 : 48}
                  />
                  <YAxis
                    width={isLgUp ? undefined : 32}
                    tick={{ fontSize: isLgUp ? 12 : 10, fill: 'var(--text)' }}
                    axisLine={{ stroke: 'var(--divider)' }}
                    tickLine={{ stroke: 'var(--divider)' }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartTooltipLabelStyle} />
                  <Bar dataKey="minutes" radius={[10, 10, 0, 0]} fill="var(--chart-1)" />
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
            <div className={`mt-4 min-w-0 overflow-hidden ${isLgUp ? 'h-64' : 'h-56 sm:h-64'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isLgUp ? 55 : 42}
                    outerRadius={isLgUp ? 90 : 72}
                    paddingAngle={2}
                  >
                    {pieChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={chartTooltipLabelStyle}
                    formatter={(value) => [`${value} min`, 'Tiempo']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-text">Total semana: {formatDurationHuman(pie.total)}</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold text-text-h">Top 3 de la semana</p>
          <div className="mt-4 space-y-3">
            {top3.length ? (
              top3.map((t, idx) => (
                <div
                  key={t.habitId}
                  className="ui-hover flex items-center justify-between gap-3 rounded-2xl border border-border bg-[color:var(--surface-2)] p-3 hover:border-[color:var(--border-strong)]"
                >
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
              <div className="rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
                <p className="text-sm font-medium text-text-h">Sin datos todavía</p>
                <p className="mt-1 text-sm text-text">Registra una sesión para empezar a ver tus hábitos destacados.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
