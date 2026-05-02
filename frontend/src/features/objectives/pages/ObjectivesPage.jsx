import { useEffect, useMemo, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../../habits/store/habitAppStore.js'
import { toIsoNow } from '../../habits/domain/time.js'
import { createObjective, deleteObjective, listObjectives, updateObjective } from '../data/objectivesRepo.js'
import ObjectiveUpsertModal from '../ui/ObjectiveUpsertModal.jsx'
import ConfirmDeleteModal from '../../habits/ui/ConfirmDeleteModal.jsx'
import { formatDateEs } from '../../../data/dateFormat.js'
import DatePickerInput from '../../../components/DatePickerInput.jsx'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export default function ObjectivesPage() {
  const habits = useHabitAppStore((s) => s.habits)

  const [status, setStatus] = useState('IN_PROGRESS')
  const [habitId, setHabitId] = useState('')
  const [from, setFrom] = useState('') // YYYY-MM-DD for API
  const [to, setTo] = useState('') // YYYY-MM-DD for API

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filteredHabits = useMemo(() => (Array.isArray(habits) ? habits.slice().sort((a, b) => a.name.localeCompare(b.name)) : []), [habits])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await listObjectives({
        status: status || undefined,
        habitId: habitId || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, habitId, from, to])

  return (
    <div className="space-y-4">
      <ObjectiveUpsertModal
        mode="create"
        open={isCreateOpen}
        habits={filteredHabits}
        initial={null}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (values) => {
          const payload = {
            id: newId(),
            habitId: values.habitId,
            notes: values.notes || null,
            startDate: values.startDate,
            endDate: values.endDate,
            metricType: values.metricType,
            targetValue: values.targetValue,
          }
          await createObjective(payload)
          await refresh()
          return { ok: true }
        }}
      />

      <ObjectiveUpsertModal
        mode="edit"
        open={Boolean(editing)}
        habits={filteredHabits}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (values) => {
          if (!editing?.id) return { ok: false }
          await updateObjective(editing.id, {
            habitId: values.habitId,
            notes: values.notes || null,
            startDate: values.startDate,
            endDate: values.endDate,
            metricType: values.metricType,
            targetValue: values.targetValue,
          })
          await refresh()
          return { ok: true }
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        title="Eliminar objetivo"
        message={deleting ? `¿Eliminar el objetivo del hábito “${deleting.habitName}”?` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting?.id) return
          await deleteObjective(deleting.id)
          setDeleting(null)
          await refresh()
        }}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Objetivos</p>
            <p className="mt-1 text-sm text-text">Listado y filtros (por defecto: en progreso).</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              id="btnNewObjective"
              className="w-full sm:w-auto ring-1 ring-border bg-bg/80 hover:bg-bg"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuevo objetivo
            </Button>
            <Badge tone="neutral">{rows.length}</Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Estado</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="DONE">Realizado</option>
              <option value="NOT_DONE">No realizado</option>
              <option value="">Todos</option>
            </select>
          </label>

          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Hábito</span>
            <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" value={habitId} onChange={(e) => setHabitId(e.target.value)}>
              <option value="">Todos</option>
              {filteredHabits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Desde (fin)</span>
            <DatePickerInput value={from} onChange={setFrom} label="Des de" />
            {from ? <p className="mt-1 text-xs text-text">Vista previa: {formatDateEs(from)}</p> : null}
          </label>

          <label className="lg:col-span-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text">Hasta (fin)</span>
            <DatePickerInput value={to} onChange={setTo} label="Hasta (fin)" />
            {to ? <p className="mt-1 text-xs text-text">Vista prèvia: {formatDateEs(to)}</p> : null}
          </label>
        </div>

        {loading ? <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Cargando…</div> : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-[crimson]" role="alert">
            {error}
          </div>
        ) : null}

        <div className="mt-4 space-y-3 lg:hidden">
          {rows.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <p className="text-base font-semibold text-text-h">{o.habitName ?? '—'}</p>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Notas</dt>
                  <dd className="mt-0.5 text-text">{o.notes ? <span className="line-clamp-3">{o.notes}</span> : '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Creado</dt>
                  <dd className="mt-0.5 text-text">{formatDateEs(o.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Inicio</dt>
                  <dd className="mt-0.5 text-text">{formatDateEs(o.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Fin</dt>
                  <dd className="mt-0.5 text-text">{formatDateEs(o.endDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Tipo</dt>
                  <dd className="mt-0.5 text-text">{o.metricType === 'REPETITIONS' ? 'Repeticiones' : 'Minutos'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text">Progreso</dt>
                  <dd className="mt-0.5 text-text">
                    {o.progressValue} / {o.targetValue}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-text">Estado</dt>
                  <dd className="mt-0.5 text-text">{o.statusLabel ?? o.statusCode}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full sm:w-auto"
                  onClick={() =>
                    setEditing({
                      id: o.id,
                      habitId: o.habitId,
                      habitName: o.habitName,
                      notes: o.notes ?? '',
                      startDate: o.startDate ?? '',
                      endDate: o.endDate,
                      metricType: o.metricType,
                      targetValue: o.targetValue,
                    })
                  }
                >
                  Editar
                </Button>
                <Button type="button" variant="ghost" className="min-h-11 w-full text-[crimson] sm:w-auto" onClick={() => setDeleting(o)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          {!loading && !rows.length ? <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Sin objetivos para los filtros actuales.</p> : null}
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="min-w-[860px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Hábito</th>
                <th className="px-2">Notas</th>
                <th className="px-2">Creado</th>
                <th className="px-2">Inicio</th>
                <th className="px-2">Fin</th>
                <th className="px-2">Tipo</th>
                <th className="px-2">Progreso</th>
                <th className="px-2">Estado</th>
                <th className="px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                  <td className="px-2 py-3 text-sm font-medium text-text-h">{o.habitName ?? '—'}</td>
                  <td className="px-2 py-3 text-sm text-text">{o.notes ? <span className="line-clamp-2">{o.notes}</span> : '—'}</td>
                  <td className="px-2 py-3 text-sm text-text">{formatDateEs(o.createdAt)}</td>
                  <td className="px-2 py-3 text-sm text-text">{formatDateEs(o.startDate)}</td>
                  <td className="px-2 py-3 text-sm text-text">{formatDateEs(o.endDate)}</td>
                  <td className="px-2 py-3 text-sm text-text">{o.metricType === 'REPETITIONS' ? 'Repeticiones' : 'Minutos'}</td>
                  <td className="px-2 py-3 text-sm text-text">
                    {o.progressValue} / {o.targetValue}
                  </td>
                  <td className="px-2 py-3 text-sm text-text">{o.statusLabel ?? o.statusCode}</td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setEditing({
                            id: o.id,
                            habitId: o.habitId,
                            habitName: o.habitName,
                            notes: o.notes ?? '',
                            startDate: o.startDate ?? '',
                            endDate: o.endDate,
                            metricType: o.metricType,
                            targetValue: o.targetValue,
                          })
                        }
                      >
                        Editar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-[crimson]" onClick={() => setDeleting(o)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !rows.length ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-text" colSpan={9}>
                    Sin objetivos para los filtros actuales.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

