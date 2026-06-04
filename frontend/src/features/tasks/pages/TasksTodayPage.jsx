import { useEffect, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { useTasksStore } from '../store/tasksStore.js'
import { getTodayTasks, completeTask, startTask, blockTask, scheduleTask } from '../data/tasksRepo.js'
import TaskCard from '../ui/TaskCard.jsx'
import TaskFormModal from '../ui/TaskFormModal.jsx'
import { createTask } from '../data/tasksRepo.js'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function TasksTodayPage() {
  const projects  = useTasksStore((s) => s.projects)
  const categories= useTasksStore((s) => s.categories)
  const addToast  = useTasksStore((s) => s.addToast)

  const [loading,       setLoading]      = useState(false)
  const [error,         setError]        = useState('')
  const [data,          setData]         = useState({ plannedToday: [], overdue: [], importantUnplanned: [] })
  const [isCreateOpen,  setIsCreateOpen] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const res = await getTodayTasks(todayIso())
      setData(res ?? { plannedToday: [], overdue: [], importantUnplanned: [] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error carregant el dia')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function handleAction(fn, task, msg) {
    try {
      await fn(task.id)
      addToast(msg)
      await refresh()
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    }
  }

  async function handleMoveToTomorrow(task) {
    try {
      await scheduleTask(task.id, { plannedDate: tomorrowIso(), plannedTime: task.plannedTime ?? null })
      addToast('Tasca moguda a demà')
      await refresh()
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    }
  }

  async function handleCreate(values) {
    try {
      await createTask({ ...values, plannedDate: values.plannedDate || todayIso() })
      await refresh()
      addToast('Tasca creada')
      return { ok: true }
    } catch (e) {
      return { ok: false }
    }
  }

  const today = new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-5">
      <TaskFormModal
        open={isCreateOpen}
        mode="create"
        projects={projects}
        categories={categories}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text">Foc diari</p>
          <p className="text-sm text-text capitalize">{today}</p>
        </div>
        <Button type="button" variant="primary" onClick={() => setIsCreateOpen(true)}>
          + Nova tasca
        </Button>
      </div>

      {loading && <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Carregant…</div>}
      {error   && <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">{error}</div>}

      {/* Today's tasks */}
      <section aria-labelledby="today-section">
        <h3 id="today-section" className="mb-3 text-xs font-semibold uppercase tracking-wide text-text">
          Tasques d'avui ({data.plannedToday.length})
        </h3>
        {data.plannedToday.length === 0 && !loading ? (
          <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
            Cap tasca planificada per avui.
          </p>
        ) : (
          <div className="space-y-3">
              {data.plannedToday.map((t) => (
              <div key={t.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
                <TaskCard task={t} onComplete={(task) => handleAction(completeTask, task, 'Tasca completada')} compact />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleAction(startTask, t, 'Tasca iniciada')}>Iniciar</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleAction(blockTask, t, 'Tasca blocada')}>Blocar</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleMoveToTomorrow(t)}>Demà</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Overdue */}
      {(data.overdue.length > 0 || !loading) && (
        <section aria-labelledby="overdue-section">
          <h3 id="overdue-section" className="mb-3 text-xs font-semibold uppercase tracking-wide text-danger">
            Vencudes ({data.overdue.length})
          </h3>
          {data.overdue.length === 0 ? (
            <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
              Cap tasca vencuda.
            </p>
          ) : (
            <div className="space-y-3">
              {data.overdue.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onComplete={(task) => handleAction(completeTask, task, 'Tasca completada')}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Important unplanned */}
      {data.importantUnplanned.length > 0 && (
        <section aria-labelledby="important-section">
          <h3 id="important-section" className="mb-3 text-xs font-semibold uppercase tracking-wide text-text">
            Importants sense planificar ({data.importantUnplanned.length})
          </h3>
          <div className="space-y-3">
            {data.importantUnplanned.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onSchedule={async (task) => {
                  await scheduleTask(task.id, { plannedDate: todayIso(), plannedTime: null })
                  addToast('Tasca planificada per avui')
                  await refresh()
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
