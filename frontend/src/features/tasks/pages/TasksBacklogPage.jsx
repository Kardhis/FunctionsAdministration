import { useEffect, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { useTasksStore } from '../store/tasksStore.js'
import { getBacklog, completeTask, cancelTask, deleteTask, scheduleTask, createTask } from '../data/tasksRepo.js'
import TaskCard from '../ui/TaskCard.jsx'
import TaskFormModal from '../ui/TaskFormModal.jsx'
import ConfirmActionModal from '../ui/ConfirmActionModal.jsx'

const PAGE_SIZE = 25

export default function TasksBacklogPage() {
  const projects  = useTasksStore((s) => s.projects)
  const categories= useTasksStore((s) => s.categories)
  const addToast  = useTasksStore((s) => s.addToast)

  const [loading,      setLoading]     = useState(false)
  const [error,        setError]       = useState('')
  const [pagedData,    setPagedData]   = useState({ content: [], totalElements: 0, page: 0, totalPages: 0, first: true, last: true })
  const [page,         setPage]        = useState(0)
  const [isCreateOpen, setIsCreateOpen]= useState(false)
  const [editing,      setEditing]     = useState(null)
  const [deleting,     setDeleting]    = useState(null)
  const [actionLoading,setActionLoading] = useState(false)

  async function refresh(p = page) {
    setLoading(true)
    setError('')
    try {
      const res = await getBacklog({ page: p, size: PAGE_SIZE })
      setPagedData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error carregant backlog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh(0) }, [])
  useEffect(() => { refresh(page) }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(values) {
    try {
      await createTask({ ...values, plannedDate: values.plannedDate ?? null })
      await refresh(0)
      setPage(0)
      addToast('Tasca creada al backlog')
      return { ok: true }
    } catch (e) {
      return { ok: false }
    }
  }

  async function handlePlanToday(task) {
    const today = new Date().toISOString().slice(0, 10)
    try {
      await scheduleTask(task.id, { plannedDate: today, plannedTime: null })
      addToast('Tasca planificada per avui')
      await refresh(page)
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setActionLoading(true)
    try {
      await deleteTask(deleting.id)
      setDeleting(null)
      await refresh(page)
      addToast('Tasca eliminada')
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const rows = pagedData.content ?? []

  return (
    <div className="space-y-4">
      <TaskFormModal open={isCreateOpen} mode="create" projects={projects} categories={categories}
        onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />
      <TaskFormModal open={Boolean(editing)} mode="edit" initial={editing} projects={projects} categories={categories}
        onClose={() => setEditing(null)}
        onSubmit={async (values) => {
          try {
            const { updateTask } = await import('../data/tasksRepo.js')
            await updateTask(editing.id, values)
            await refresh(page)
            addToast('Tasca actualitzada')
            return { ok: true }
          } catch (e) { return { ok: false } }
        }} />
      <ConfirmActionModal open={Boolean(deleting)} title="Eliminar tasca"
        message={deleting ? `Segur que vols eliminar "${deleting.title}"?` : ''}
        confirmLabel="Eliminar" confirmVariant="danger" loading={actionLoading}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} />

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-h">Backlog</p>
            <p className="mt-1 text-sm text-text">
              {pagedData.totalElements} tasca{pagedData.totalElements !== 1 ? 'ques' : ''} sense planificar
            </p>
          </div>
          <Button type="button" variant="primary" onClick={() => setIsCreateOpen(true)}>
            + Nova tasca
          </Button>
        </div>

        {loading && <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Carregant…</div>}
        {error   && <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">{error}</div>}

        <div className="mt-4 space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-h">{t.title}</p>
                  {t.description && <p className="mt-0.5 line-clamp-2 text-xs text-text">{t.description}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.important === true && (
                      <span className="inline-flex items-center rounded-xl bg-[color:var(--accent-bg)] px-2 py-0.5 text-xs text-[color:var(--accent)] ring-1 ring-[color:var(--accent-border)]">Important</span>
                    )}
                    {t.urgent === true && (
                      <span className="inline-flex items-center rounded-xl bg-[color:var(--warning-bg,oklch(0.95_0.05_80))] px-2 py-0.5 text-xs text-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/30">Urgent</span>
                    )}
                    {t.categoryName && (
                      <span className="inline-flex items-center rounded-xl px-2 py-0.5 text-xs ring-1 ring-border text-text">{t.categoryName}</span>
                    )}
                    {t.projectName && (
                      <span className="text-xs text-text">{t.projectName}</span>
                    )}
                    {t.dueDate && (
                      <span className={['text-xs', t.overdue ? 'text-danger font-medium' : 'text-text'].join(' ')}>
                        Límit: {t.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" variant="primary" size="sm" onClick={() => handlePlanToday(t)}>Planificar avui</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(t)}>Editar</Button>
                  <Button type="button" variant="secondary" size="sm" onClick={async () => {
                    await completeTask(t.id); addToast('Tasca completada'); await refresh(page)
                  }}>Completar</Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => setDeleting(t)}>Eliminar</Button>
                </div>
              </div>
            </div>
          ))}
          {!loading && !rows.length && (
            <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
              El backlog és buit. Totes les tasques estan planificades.
            </p>
          )}
        </div>

        {/* Pagination */}
        {pagedData.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-xs text-text">{pagedData.totalElements} resultats</p>
            <div className="flex items-center gap-1">
              <Button type="button" variant="secondary" size="sm" disabled={pagedData.first || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>‹</Button>
              <span className="px-2 text-sm text-text">{pagedData.page + 1} / {Math.max(1, pagedData.totalPages)}</span>
              <Button type="button" variant="secondary" size="sm" disabled={pagedData.last || loading} onClick={() => setPage((p) => p + 1)}>›</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
