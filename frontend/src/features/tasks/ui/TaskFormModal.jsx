import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/Button.jsx'
import DatePickerInput from '../../../components/DatePickerInput.jsx'
import TaskTaxonomyModal from './TaskTaxonomyModal.jsx'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock.js'
import { useTasksStore } from '../store/tasksStore.js'
import { taskCreateSchema } from '../domain/taskSchemas.js'
import { TASK_STATUSES, RECURRENCE_TYPES } from '../domain/taskStatus.js'

/**
 * @param {{
 *   open: boolean,
 *   mode: 'create' | 'edit',
 *   initial?: object|null,
 *   projects: Array,
 *   categories: Array,
 *   onClose: () => void,
 *   onSubmit: (values: object) => Promise<{ ok: boolean }>
 * }} props
 */
export default function TaskFormModal({
  open,
  mode = 'create',
  initial = null,
  projects = [],
  categories = [],
  onClose,
  onSubmit,
}) {
  useBodyScrollLock(open)

  const storeCreateProject  = useTasksStore((s) => s.createProject)
  const storeCreateCategory = useTasksStore((s) => s.createCategory)

  const [quickModal, setQuickModal] = useState({ open: false, type: 'project' })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: buildDefaults(initial),
  })

  const recurring        = watch('recurring')
  const plannedDateValue = watch('plannedDate')
  const dueDateValue     = watch('dueDate')
  const recEndDateValue  = watch('recurrenceEndDate')

  useEffect(() => {
    if (open) reset(buildDefaults(initial))
  }, [open, initial, reset])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleQuickCreate(data) {
    const result = quickModal.type === 'project'
      ? await storeCreateProject(data)
      : await storeCreateCategory(data)
    if (result.ok) {
      if (quickModal.type === 'project' && result.project) {
        setValue('projectId', result.project.id, { shouldDirty: true })
      } else if (quickModal.type === 'category' && result.category) {
        setValue('categoryId', result.category.id, { shouldDirty: true })
      }
    }
    return result
  }

  async function handleFormSubmit(values) {
    const result = await onSubmit(values)
    if (result?.ok) onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-bg shadow-soft">
        <div className="border-b border-border px-6 py-4">
          <h2 id="task-form-title" className="text-base font-semibold text-text-h">
            {mode === 'create' ? 'Nova tasca' : 'Editar tasca'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <div className="space-y-4 px-6 py-5">

            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-xs font-medium uppercase tracking-wide text-text">
                Títol <span className="text-danger">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                maxLength={160}
                autoFocus
                className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                placeholder="Escriu el títol de la tasca…"
                {...register('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-desc" className="block text-xs font-medium uppercase tracking-wide text-text">
                Descripció
              </label>
              <textarea
                id="task-desc"
                rows={3}
                className="mt-1.5 w-full resize-y rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                placeholder="Descripció opcional…"
                {...register('description')}
              />
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-text">
                  Data planificada
                </label>
                <DatePickerInput
                  value={plannedDateValue ?? ''}
                  onChange={(v) => setValue('plannedDate', v || null, { shouldDirty: true, shouldValidate: true })}
                  label="Data planificada"
                />
              </div>
              <div>
                <label htmlFor="task-planned-time" className="block text-xs font-medium uppercase tracking-wide text-text">
                  Hora planificada
                </label>
                <input
                  id="task-planned-time"
                  type="time"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('plannedTime')}
                />
                {errors.plannedTime && <p className="mt-1 text-xs text-danger">{errors.plannedTime.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-text">
                Data límit
              </label>
              <DatePickerInput
                value={dueDateValue ?? ''}
                onChange={(v) => setValue('dueDate', v || null, { shouldDirty: true, shouldValidate: true })}
                label="Data límit"
              />
            </div>

            {/* Eisenhower */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-important" className="block text-xs font-medium uppercase tracking-wide text-text">
                  Importància
                </label>
                <select
                  id="task-important"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('important', { setValueAs: (v) => v === '' ? null : v === 'true' })}
                >
                  <option value="">Sense classificar</option>
                  <option value="true">Important</option>
                  <option value="false">No important</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-urgent" className="block text-xs font-medium uppercase tracking-wide text-text">
                  Urgència
                </label>
                <select
                  id="task-urgent"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('urgent', { setValueAs: (v) => v === '' ? null : v === 'true' })}
                >
                  <option value="">Sense classificar</option>
                  <option value="true">Urgent</option>
                  <option value="false">No urgent</option>
                </select>
              </div>
            </div>

            {/* Project & Category */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="task-project" className="block text-xs font-medium uppercase tracking-wide text-text">
                    Projecte
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[color:var(--accent)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] rounded"
                    onClick={() => setQuickModal({ open: true, type: 'project' })}
                  >
                    + Nou
                  </button>
                </div>
                <select
                  id="task-project"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('projectId', { setValueAs: (v) => (v === '' || v == null) ? null : Number(v) })}
                >
                  <option value="">Cap projecte</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="task-category" className="block text-xs font-medium uppercase tracking-wide text-text">
                    Categoria
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[color:var(--accent)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] rounded"
                    onClick={() => setQuickModal({ open: true, type: 'category' })}
                  >
                    + Nova
                  </button>
                </div>
                <select
                  id="task-category"
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('categoryId', { setValueAs: (v) => (v === '' || v == null) ? null : Number(v) })}
                >
                  <option value="">Cap categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated / Total minutes */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="task-estimated" className="block text-xs font-medium uppercase tracking-wide text-text">
                  Durada estimada (min)
                </label>
                <input
                  id="task-estimated"
                  type="number"
                  min={1}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="Ex: 30"
                  {...register('estimatedMinutes', { setValueAs: (v) => (v === '' || v == null) ? null : Number(v) })}
                />
              </div>
              <div>
                <label htmlFor="task-total" className="block text-xs font-medium uppercase tracking-wide text-text">
                  Temps real (min)
                </label>
                <input
                  id="task-total"
                  type="number"
                  min={1}
                  className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="Ex: 45"
                  {...register('totalMinutes', { setValueAs: (v) => (v === '' || v == null) ? null : Number(v) })}
                />
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-h">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border focus:ring-2 focus:ring-[color:var(--ring)]"
                  {...register('recurring')}
                />
                Tasca recurrent
              </label>
            </div>

            {recurring && (
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg/40 p-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="task-rec-type" className="block text-xs font-medium uppercase tracking-wide text-text">
                    Tipus <span className="text-danger">*</span>
                  </label>
                  <select
                    id="task-rec-type"
                    className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-3 py-2.5 text-sm text-text-h focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    {...register('recurrenceType')}
                  >
                    <option value="">Selecciona…</option>
                    {RECURRENCE_TYPES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.recurrenceType && <p className="mt-1 text-xs text-danger">{errors.recurrenceType.message}</p>}
                </div>
                <div>
                  <label htmlFor="task-rec-interval" className="block text-xs font-medium uppercase tracking-wide text-text">
                    Interval <span className="text-danger">*</span>
                  </label>
                  <input
                    id="task-rec-interval"
                    type="number"
                    min={1}
                    className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-3 py-2.5 text-sm text-text-h focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    placeholder="1"
                    {...register('recurrenceInterval', { setValueAs: (v) => v === '' ? null : Number(v) })}
                  />
                  {errors.recurrenceInterval && <p className="mt-1 text-xs text-danger">{errors.recurrenceInterval.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-text">
                    Fi recurrència
                  </label>
                  <DatePickerInput
                    value={recEndDateValue ?? ''}
                    onChange={(v) => setValue('recurrenceEndDate', v || null, { shouldDirty: true, shouldValidate: true })}
                    label="Fi recurrència"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel·lar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Desant…' : mode === 'create' ? 'Crear tasca' : 'Desar canvis'}
            </Button>
          </div>
        </form>
      </div>

      <TaskTaxonomyModal
        open={quickModal.open}
        type={quickModal.type}
        onClose={() => setQuickModal((s) => ({ ...s, open: false }))}
        onSubmit={handleQuickCreate}
      />
    </div>
  )
}

function buildDefaults(initial) {
  if (!initial) {
    return {
      title: '',
      description: '',
      dueDate: null,
      plannedDate: null,
      plannedTime: null,
      important: null,
      urgent: null,
      projectId: null,
      categoryId: null,
      recurring: false,
      recurrenceType: null,
      recurrenceInterval: null,
      recurrenceEndDate: null,
      estimatedMinutes: null,
      totalMinutes: null,
    }
  }
  return {
    title: initial.title ?? '',
    description: initial.description ?? '',
    dueDate: initial.dueDate ?? null,
    plannedDate: initial.plannedDate ?? null,
    plannedTime: initial.plannedTime ? initial.plannedTime.slice(0, 5) : null,
    important: initial.important ?? null,
    urgent: initial.urgent ?? null,
    projectId: initial.projectId ?? null,
    categoryId: initial.categoryId ?? null,
    recurring: initial.recurring ?? false,
    recurrenceType: initial.recurrenceType ?? null,
    recurrenceInterval: initial.recurrenceInterval ?? null,
    recurrenceEndDate: initial.recurrenceEndDate ?? null,
    estimatedMinutes: initial.estimatedMinutes ?? null,
    totalMinutes: initial.totalMinutes ?? null,
  }
}
