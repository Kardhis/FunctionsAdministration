import { useEffect, useState, useMemo } from 'react'
import Button from '../../../components/Button.jsx'
import { useTasksStore } from '../store/tasksStore.js'
import { getCalendarTasks, scheduleTask, completeTask } from '../data/tasksRepo.js'
import TaskStatusBadge from '../ui/TaskStatusBadge.jsx'
import { isFinal, canComplete } from '../domain/taskStatus.js'

function getWeekDates(baseDate) {
  const d = new Date(baseDate)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  d.setDate(diff)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(d)
    date.setDate(d.getDate() + i)
    return date.toISOString().slice(0, 10)
  })
}

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

const DAY_LABELS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

export default function TasksCalendarPage() {
  const addToast = useTasksStore((s) => s.addToast)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [tasks,   setTasks]   = useState([])
  const [view,    setView]    = useState('week') // 'week' | 'month'
  const [refDate, setRefDate] = useState(isoToday())

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate])

  const rangeFrom = view === 'week'
    ? weekDates[0]
    : `${refDate.slice(0, 7)}-01`

  const rangeTo = useMemo(() => {
    if (view === 'week') return weekDates[6]
    const d = new Date(`${refDate.slice(0, 7)}-01`)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    return d.toISOString().slice(0, 10)
  }, [view, refDate, weekDates])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const res = await getCalendarTasks(rangeFrom, rangeTo)
      setTasks(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error carregant calendari')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [rangeFrom, rangeTo]) // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(dir) {
    const d = new Date(refDate)
    if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setRefDate(d.toISOString().slice(0, 10))
  }

  function tasksByDate(date) {
    return tasks.filter((t) => t.plannedDate === date)
      .sort((a, b) => {
        if (!a.plannedTime && !b.plannedTime) return 0
        if (!a.plannedTime) return 1
        if (!b.plannedTime) return -1
        return a.plannedTime.localeCompare(b.plannedTime)
      })
  }

  async function handleComplete(task) {
    try {
      await completeTask(task.id)
      addToast('Tasca completada')
      await refresh()
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    }
  }

  const today = isoToday()
  const displayMonth = new Date(refDate).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })

  // Month view: generate all days of the month
  const monthDates = useMemo(() => {
    if (view !== 'month') return []
    const start = new Date(`${refDate.slice(0, 7)}-01`)
    const end = new Date(rangeTo)
    const dates = []
    const d = new Date(start)
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10))
      d.setDate(d.getDate() + 1)
    }
    return dates
  }, [view, refDate, rangeTo])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate(-1)}>‹</Button>
          <span className="text-sm font-medium text-text-h capitalize">
            {view === 'week'
              ? `${weekDates[0]} – ${weekDates[6]}`
              : displayMonth}
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate(1)}>›</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setRefDate(isoToday())}>Avui</Button>
        </div>
        <div className="flex rounded-2xl border border-border overflow-hidden">
          <button
            type="button"
            className={['px-3 py-1.5 text-sm transition focus:outline-none', view === 'week' ? 'bg-[color:var(--accent-bg)] text-[color:var(--accent)]' : 'bg-bg text-text hover:bg-black/5 dark:hover:bg-white/5'].join(' ')}
            onClick={() => setView('week')}
          >Setmana</button>
          <button
            type="button"
            className={['px-3 py-1.5 text-sm transition focus:outline-none', view === 'month' ? 'bg-[color:var(--accent-bg)] text-[color:var(--accent)]' : 'bg-bg text-text hover:bg-black/5 dark:hover:bg-white/5'].join(' ')}
            onClick={() => setView('month')}
          >Mes</button>
        </div>
      </div>

      {loading && <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Carregant…</div>}
      {error   && <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">{error}</div>}

      {/* Week view */}
      {view === 'week' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDates.map((date, i) => {
            const dayTasks = tasksByDate(date)
            const isToday = date === today
            return (
              <div
                key={date}
                className={['rounded-2xl border p-3', isToday ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]' : 'border-border bg-bg/60'].join(' ')}
              >
                <div className="mb-2 flex items-center gap-1">
                  <span className="text-xs font-semibold text-text">{DAY_LABELS[i]}</span>
                  <span className={['text-xs', isToday ? 'font-bold text-[color:var(--accent)]' : 'text-text/60'].join(' ')}>
                    {date.slice(8)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-text/40">—</p>
                  )}
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      className={['rounded-xl border p-2 text-xs', isFinal(t.status) ? 'border-border bg-bg/40 opacity-60' : 'border-border bg-bg/80'].join(' ')}
                    >
                      {t.plannedTime && (
                        <p className="text-[10px] text-text/60">{t.plannedTime.slice(0, 5)}</p>
                      )}
                      <p className={['font-medium leading-tight', isFinal(t.status) ? 'line-through text-text/50' : 'text-text-h'].join(' ')}>
                        {t.title}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <TaskStatusBadge status={t.status} />
                        {!isFinal(t.status) && canComplete(t.status) && (
                          <button
                            type="button"
                            className="text-[10px] text-text/60 hover:text-[color:var(--accent)] focus:outline-none"
                            onClick={() => handleComplete(t)}
                            title="Completar"
                            aria-label={`Completar ${t.title}`}
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <div className="space-y-4">
          {/* Header row for month */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-1 text-xs font-semibold uppercase tracking-wide text-text">{d}</div>
            ))}
          </div>

          {/* Fill leading empty days */}
          {(() => {
            const firstDay = new Date(monthDates[0]).getDay()
            const leadingEmpty = firstDay === 0 ? 6 : firstDay - 1
            const cells = [
              ...Array.from({ length: leadingEmpty }, (_, i) => ({ type: 'empty', key: `e${i}` })),
              ...monthDates.map((date) => ({ type: 'day', date, key: date })),
            ]
            return (
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell) =>
                  cell.type === 'empty' ? (
                    <div key={cell.key} />
                  ) : (
                    <div
                      key={cell.key}
                      className={['min-h-[72px] rounded-xl border p-1.5', cell.date === today ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]' : 'border-border bg-bg/40'].join(' ')}
                    >
                      <p className={['mb-1 text-xs', cell.date === today ? 'font-bold text-[color:var(--accent)]' : 'text-text/60'].join(' ')}>
                        {cell.date.slice(8)}
                      </p>
                      {tasksByDate(cell.date).slice(0, 3).map((t) => (
                        <p key={t.id} className={['truncate rounded px-1 py-0.5 text-[10px]', isFinal(t.status) ? 'line-through text-text/40' : 'text-text-h'].join(' ')}>
                          {t.title}
                        </p>
                      ))}
                      {tasksByDate(cell.date).length > 3 && (
                        <p className="text-[10px] text-text/60">+{tasksByDate(cell.date).length - 3} més</p>
                      )}
                    </div>
                  )
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Summary */}
      <p className="text-xs text-text">{tasks.length} tasca{tasks.length !== 1 ? 'ques' : ''} al rang visible</p>
    </div>
  )
}
