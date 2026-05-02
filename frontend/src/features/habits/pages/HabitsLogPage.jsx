import { useMemo, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import { formatDurationHuman, todayLocalDateString } from '../domain/time.js'
import { periodPresets, resolvePeriodRange } from '../domain/periods.js'
import LiveTimer from '../ui/LiveTimer.jsx'
import HabitEntryCreateModal from '../ui/HabitEntryCreateModal.jsx'
import HabitEntryEditModal from '../ui/HabitEntryEditModal.jsx'
import { formatDateEs } from '../../../data/dateFormat.js'

export default function HabitsLogPage() {
  const habits = useHabitAppStore((s) => s.habits)
  const entries = useHabitAppStore((s) => s.entries)
  const createEntry = useHabitAppStore((s) => s.createEntry)
  const updateEntry = useHabitAppStore((s) => s.updateEntry)
  const deleteEntry = useHabitAppStore((s) => s.deleteEntry)

  const [preset, setPreset] = useState('last_7')
  const [customFrom, setCustomFrom] = useState(todayLocalDateString())
  const [customTo, setCustomTo] = useState(todayLocalDateString())
  const [habitId, setHabitId] = useState('')
  const categories = useHabitAppStore((s) => s.categories)
  const [categoryId, setCategoryId] = useState('')
  const [activeOnly, setActiveOnly] = useState('all') // all|true|false

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const range = useMemo(() => resolvePeriodRange({ preset, customFrom, customTo }), [preset, customFrom, customTo])

  const filteredEntries = useMemo(() => {
    const habitsById = new Map(habits.map((h) => [h.id, h]))
    return entries
      .filter((e) => {
        const t = new Date(`${e.date}T00:00:00`)
        if (t < range.start || t > range.end) return false
        if (habitId && e.habitId !== habitId) return false
        const h = habitsById.get(e.habitId)
        if (!h) return false
        if (categoryId && !(Array.isArray(h.categoryIds) && h.categoryIds.includes(categoryId))) return false
        if (activeOnly === 'true' && h.active !== true) return false
        if (activeOnly === 'false' && h.active !== false) return false
        return true
      })
      .slice()
      .sort((a, b) => `${b.date} ${b.endTime}`.localeCompare(`${a.date} ${a.endTime}`))
  }, [activeOnly, categoryId, entries, habitId, habits, range.end, range.start])

  return (
    <div className="space-y-4">
      <HabitEntryCreateModal
        open={isCreateOpen}
        habits={habits}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async (values) => {
          await createEntry(values)
          return { ok: true }
        }}
      />
      <HabitEntryEditModal
        open={Boolean(editingEntry)}
        habits={habits}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSaved={async (values) => {
          if (!editingEntry?.id) return { ok: false }
          const res = await updateEntry({ id: editingEntry.id, ...values })
          if (res?.ok) setEditingEntry(null)
          return res
        }}
      />
      <LiveTimer
        habits={habits.filter((h) => h.active)}
        onComplete={async (payload) => {
          await createEntry(payload)
        }}
      />

      <div id="sectionRegistros" className="grid w-full grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="w-full p-5 xl:col-span-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Registros</p>
            <p className="mt-1 text-sm text-text">
              Periodo: <span className="font-medium text-text-h">{range.label}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              id="btnNewEntry"
              className="w-full sm:w-auto ring-1 ring-border bg-bg/80 hover:bg-bg"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuevo registro
            </Button>
            <Badge tone="neutral">{filteredEntries.length}</Badge>
          </div>
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
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Todas</option>
              {(Array.isArray(categories) ? categories : []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
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

        <div className="mt-4 space-y-3 lg:hidden">
          {filteredEntries.map((e) => {
            const h = habits.find((x) => x.id === e.habitId)
            return (
              <div key={e.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-text">{formatDateEs(e.date)}</p>
                  <p className="text-base font-semibold text-text-h">{h?.name ?? '—'}</p>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-text">Ventana</dt>
                    <dd className="text-right text-text-h">
                      {e.startTime}–{e.endTime}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-text">Duración</dt>
                    <dd className="text-right font-medium text-text-h">{formatDurationHuman(e.durationMinutes)}</dd>
                  </div>
                  {e.notes ? (
                    <div>
                      <dt className="text-text">Nota</dt>
                      <dd className="mt-1 text-text">{e.notes}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" className="min-h-11 w-full sm:w-auto" onClick={() => setEditingEntry(e)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 w-full text-[crimson] sm:w-auto"
                    onClick={() => {
                      const ok = window.confirm('Eliminar este registro?')
                      if (!ok) return
                      deleteEntry(e.id)
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            )
          })}
          {!filteredEntries.length ? <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Sin registros para los filtros actuales.</p> : null}
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="min-w-[720px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Fecha</th>
                <th className="px-2">Hábito</th>
                <th className="px-2">Ventana</th>
                <th className="px-2">Duración</th>
                <th className="px-2">Nota</th>
                <th className="px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e) => {
                const h = habits.find((x) => x.id === e.habitId)
                return (
                  <tr key={e.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                    <td className="px-2 py-3 text-sm text-text">{formatDateEs(e.date)}</td>
                    <td className="px-2 py-3 text-sm font-medium text-text-h">{h?.name ?? '—'}</td>
                    <td className="px-2 py-3 text-sm text-text">
                      {e.startTime}–{e.endTime}
                    </td>
                    <td className="px-2 py-3 text-sm text-text">{formatDurationHuman(e.durationMinutes)}</td>
                    <td className="px-2 py-3 text-sm text-text">{e.notes ? <span className="line-clamp-2">{e.notes}</span> : '—'}</td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setEditingEntry(e)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[crimson]"
                          onClick={() => {
                            const ok = window.confirm('Eliminar este registro?')
                            if (!ok) return
                            deleteEntry(e.id)
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!filteredEntries.length ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-text" colSpan={6}>
                    Sin registros para los filtros actuales.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  )
}
