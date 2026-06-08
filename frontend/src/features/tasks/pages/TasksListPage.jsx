import { useEffect, useRef, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Pagination from '../../../components/Pagination.jsx'
import TableScrollWrapper from '../../../components/TableScrollWrapper.jsx'
import { usePagination } from '../../../hooks/usePagination.js'
import { useTasksStore } from '../store/tasksStore.js'
import {
  listTasks, createTask, updateTask, deleteTask,
  completeTask, cancelTask, duplicateTask, reopenTask,
} from '../data/tasksRepo.js'
import TaskFormModal from '../ui/TaskFormModal.jsx'
import TaskStatusBadge from '../ui/TaskStatusBadge.jsx'
import ConfirmActionModal from '../ui/ConfirmActionModal.jsx'
import { TASK_STATUSES, STATUS_FILTER_ACTIVE, STATUS_FILTER_ALL, isFinal, canComplete } from '../domain/taskStatus.js'
import { buildTaskUpdatePayload } from '../domain/taskPayload.js'

const PAGE_SIZE = 25

export default function TasksListPage() {
  const projects    = useTasksStore((s) => s.projects)
  const categories  = useTasksStore((s) => s.categories)
  const addToast    = useTasksStore((s) => s.addToast)

  // Filters
  const [filterStatus,    setFilterStatus]    = useState(STATUS_FILTER_ACTIVE)
  const [filterProjectId, setFilterProjectId] = useState('')
  const [filterCategoryId,setFilterCategoryId]= useState('')
  const [filterImportant, setFilterImportant] = useState('')
  const [filterUrgent,    setFilterUrgent]    = useState('')
  const [filterRecurring, setFilterRecurring] = useState('')
  const [filterQ,         setFilterQ]         = useState('')

  // Data
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [pagedData, setPagedData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0, size: PAGE_SIZE, first: true, last: true })
  const [page, setPage] = useState(0)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [deleting,     setDeleting]     = useState(null)
  const [actionLoading,setActionLoading]= useState(false)
  const createInFlightRef = useRef(false)

  async function refresh(p = page) {
    setLoading(true)
    setError('')
    try {
      const data = await listTasks({
        status:     filterStatus !== STATUS_FILTER_ACTIVE && filterStatus !== STATUS_FILTER_ALL
          ? filterStatus
          : undefined,
        includeAll: filterStatus === STATUS_FILTER_ALL,
        projectId:  filterProjectId  ? Number(filterProjectId)  : undefined,
        categoryId: filterCategoryId ? Number(filterCategoryId) : undefined,
        important:  filterImportant !== '' ? filterImportant === 'true' : undefined,
        urgent:     filterUrgent    !== '' ? filterUrgent === 'true'    : undefined,
        recurring:  filterRecurring !== '' ? filterRecurring === 'true' : undefined,
        q:          filterQ          || undefined,
        page: p,
        size: PAGE_SIZE,
      })
      setPagedData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error carregant tasques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
    refresh(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterProjectId, filterCategoryId, filterImportant, filterUrgent, filterRecurring, filterQ])

  useEffect(() => {
    refresh(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handleCreate(values) {
    if (createInFlightRef.current) {
      return { ok: false, error: 'create_in_flight' }
    }
    createInFlightRef.current = true
    try {
      await createTask(buildPayload(values))
      addToast('Tasca creada correctament')
      void refresh()
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    } finally {
      createInFlightRef.current = false
    }
  }

  async function handleUpdate(values) {
    const payload = buildTaskUpdatePayload(values)
    try {
      await updateTask(editing.id, payload)
      await refresh()
      addToast('Tasca actualitzada')
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  async function handleAction(fn, task, successMsg) {
    setActionLoading(true)
    try {
      await fn(task.id)
      await refresh()
      addToast(successMsg)
    } catch (e) {
      addToast(e.message ?? 'Error en l\'acció', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setActionLoading(true)
    try {
      await deleteTask(deleting.id)
      setDeleting(null)
      await refresh()
      addToast('Tasca eliminada')
    } catch (e) {
      addToast(e.message ?? 'Error eliminant tasca', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const rows = pagedData.content ?? []

  return (
    <div className="space-y-4">
      <TaskFormModal
        open={isCreateOpen}
        mode="create"
        projects={projects}
        categories={categories}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <TaskFormModal
        open={Boolean(editing)}
        mode="edit"
        initial={editing}
        projects={projects}
        categories={categories}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />
      <ConfirmActionModal
        open={Boolean(deleting)}
        title="Eliminar tasca"
        message={deleting ? `Segur que vols eliminar "${deleting.title}"?` : ''}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        loading={actionLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Card className="p-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Totes les tasques</p>
            <p className="mt-1 text-sm text-text">
              {pagedData.totalElements} tasca{pagedData.totalElements !== 1 ? 'ques' : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            + Nova tasca
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <label>
            <span className="block text-xs font-medium uppercase tracking-wide text-text">Estat</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value={STATUS_FILTER_ACTIVE}>Actives</option>
              <option value={STATUS_FILTER_ALL}>Tots</option>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="block text-xs font-medium uppercase tracking-wide text-text">Projecte</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
            >
              <option value="">Tots</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label>
            <span className="block text-xs font-medium uppercase tracking-wide text-text">Categoria</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
            >
              <option value="">Totes</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label>
            <span className="block text-xs font-medium uppercase tracking-wide text-text">Importància</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              value={filterImportant}
              onChange={(e) => setFilterImportant(e.target.value)}
            >
              <option value="">Totes</option>
              <option value="true">Important</option>
              <option value="false">No important</option>
            </select>
          </label>

          <label>
            <span className="block text-xs font-medium uppercase tracking-wide text-text">Urgència</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              value={filterUrgent}
              onChange={(e) => setFilterUrgent(e.target.value)}
            >
              <option value="">Totes</option>
              <option value="true">Urgent</option>
              <option value="false">No urgent</option>
            </select>
          </label>
        </div>

        {/* Search */}
        <div className="mt-3">
          <label>
            <span className="sr-only">Cerca per títol</span>
            <input
              type="search"
              className="w-full rounded-2xl border border-border bg-bg px-4 py-2.5 text-sm text-text-h shadow-soft placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
              placeholder="Cerca per títol…"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
            />
          </label>
        </div>

        {/* States */}
        {loading && <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Carregant…</div>}
        {error && <div className="mt-4 rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">{error}</div>}

        {/* Mobile cards */}
        <div className="mt-4 space-y-3 lg:hidden">
          {rows.map((t) => (
            <div key={t.id} className={['rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border', t.overdue && !isFinal(t.status) ? 'ring-danger/40' : ''].join(' ')}>
              <div className="flex items-start justify-between gap-2">
                <p className={['text-sm font-medium', isFinal(t.status) ? 'line-through text-text/50' : 'text-text-h'].join(' ')}>{t.title}</p>
                <TaskStatusBadge status={t.status} />
              </div>
              {t.description && (
                <p className="mt-1 line-clamp-2 text-xs text-text/70">{t.description}</p>
              )}
              {t.plannedDate && <p className="mt-1 text-xs text-text">{fmtDate(t.plannedDate)}{t.plannedTime ? ` ${t.plannedTime.slice(0,5)}` : ''}</p>}
              {t.dueDate && <p className={['mt-0.5 text-xs', t.overdue && !isFinal(t.status) ? 'text-danger' : 'text-text'].join(' ')}>Límit: {fmtDate(t.dueDate)}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" className="min-h-11" onClick={() => setEditing(t)}>Editar</Button>
                {canComplete(t.status) && (
                  <Button type="button" variant="secondary" size="sm" className="min-h-11" onClick={() => handleAction(completeTask, t, 'Tasca completada')}>Completar</Button>
                )}
                {isFinal(t.status) && (
                  <Button type="button" variant="secondary" size="sm" className="min-h-11" onClick={() => handleAction(reopenTask, t, 'Tasca reoberta')}>Reobrir</Button>
                )}
                <Button type="button" variant="danger" size="sm" className="min-h-11" onClick={() => setDeleting(t)}>Eliminar</Button>
              </div>
            </div>
          ))}
          {!loading && !rows.length && (
            <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
              Cap tasca per als filtres actuals.
            </p>
          )}
        </div>

        {/* Desktop table */}
        <TableScrollWrapper noBorder>
          <table className="hidden min-w-[900px] w-full border-separate border-spacing-y-2 lg:table">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-text">
                <th className="px-2 text-left">Títol</th>
                <th className="px-2 text-left">Descripció</th>
                <th className="px-2 text-center">Estat</th>
                <th className="px-2 text-center">Data planificada</th>
                <th className="px-2 text-center">Data límit</th>
                <th className="px-2 text-center hidden xl:table-cell">Projecte</th>
                <th className="px-2 text-center hidden xl:table-cell">Importància</th>
                <th className="px-2 text-center hidden xl:table-cell">Urgència</th>
                <th className="px-2 text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={t.id} className={[
                  'rounded-xl ring-1 ring-[color:var(--border-strong)]',
                  i % 2 === 0 ? 'bg-[color:var(--surface-2)]' : 'bg-[color:var(--surface-3)]',
                  t.overdue && !isFinal(t.status) ? 'ring-[color:var(--danger-border)]' : '',
                ].join(' ')}>
                  <td className="max-w-[200px] px-2 py-3 text-left text-sm font-medium text-text-h">
                    <p className="truncate">{t.title}</p>
                    {t.recurring && <span className="mt-0.5 block text-xs font-normal text-text">Recurrent</span>}
                  </td>
                  <td className="max-w-[240px] px-2 py-3 text-left text-xs text-text/70">
                    {t.description
                      ? <span className="line-clamp-2">{t.description}</span>
                      : <span className="text-text/30">—</span>
                    }
                  </td>
                  <td className="px-2 py-3 text-center">
                    <TaskStatusBadge status={t.status} className="inline-flex" />
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-text">
                    {t.plannedDate ? `${fmtDate(t.plannedDate)}${t.plannedTime ? ` ${t.plannedTime.slice(0,5)}` : ''}` : '—'}
                  </td>
                  <td className={['px-2 py-3 text-center text-sm', t.overdue && !isFinal(t.status) ? 'text-danger font-medium' : 'text-text'].join(' ')}>
                    {fmtDate(t.dueDate) ?? '—'}
                  </td>
                  <td className="px-2 py-3 text-center text-sm text-text hidden xl:table-cell">{t.projectName ?? '—'}</td>
                  <td className="px-2 py-3 text-center text-xs text-text hidden xl:table-cell">
                    {t.important === true ? 'Sí' : t.important === false ? 'No' : '—'}
                  </td>
                  <td className="px-2 py-3 text-center text-xs text-text hidden xl:table-cell">
                    {t.urgent === true ? 'Sí' : t.urgent === false ? 'No' : '—'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      <Button type="button" variant="secondary" size="xs" onClick={() => setEditing(t)}>Editar</Button>
                      {canComplete(t.status) && (
                        <Button type="button" variant="secondary" size="xs" onClick={() => handleAction(completeTask, t, 'Tasca completada')}>Completar</Button>
                      )}
                      {!isFinal(t.status) && (
                        <Button type="button" variant="secondary" size="xs" onClick={() => handleAction(cancelTask, t, 'Tasca cancel·lada')}>Cancel·lar</Button>
                      )}
                      {isFinal(t.status) && (
                        <Button type="button" variant="secondary" size="xs" onClick={() => handleAction(reopenTask, t, 'Tasca reoberta')}>Reobrir</Button>
                      )}
                      <Button type="button" variant="secondary" size="xs" onClick={() => handleAction(duplicateTask, t, 'Tasca duplicada')}>Duplicar</Button>
                      <Button type="button" variant="danger" size="xs" onClick={() => setDeleting(t)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !rows.length && (
                <tr>
                  <td className="px-2 py-3 text-sm text-text" colSpan={9}>
                    Cap tasca per als filtres actuals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScrollWrapper>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-xs text-text">
            {pagedData.totalElements} result{pagedData.totalElements !== 1 ? 'ats' : 'at'}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pagedData.first || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ‹ Anterior
            </Button>
            <span className="px-2 text-sm text-text">
              {pagedData.page + 1} / {Math.max(1, pagedData.totalPages)}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pagedData.last || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Següent ›
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

function buildPayload(values) {
  return {
    title:                values.title?.trim(),
    description:          values.description || null,
    dueDate:              values.dueDate || null,
    plannedDate:          values.plannedDate || null,
    plannedTime:          values.plannedTime || null,
    important:            values.important ?? null,
    clearImportant:       values.important == null ? true : undefined,
    urgent:               values.urgent ?? null,
    clearUrgent:          values.urgent == null ? true : undefined,
    projectId:            values.projectId || null,
    categoryId:           values.categoryId || null,
    recurring:            values.recurring ?? false,
    recurrenceType:       values.recurring ? (values.recurrenceType || null) : null,
    recurrenceInterval:   values.recurring ? (values.recurrenceInterval ?? null) : null,
    recurrenceEndDate:    values.recurring ? (values.recurrenceEndDate || null) : null,
    estimatedMinutes:     values.estimatedMinutes ?? null,
    clearEstimatedMinutes: values.estimatedMinutes == null ? true : undefined,
    totalMinutes:         values.totalMinutes ?? null,
    clearTotalMinutes:    values.totalMinutes == null ? true : undefined,
  }
}
