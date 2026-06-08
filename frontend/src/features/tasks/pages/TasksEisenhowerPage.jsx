import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/Button.jsx'
import { useTasksStore } from '../store/tasksStore.js'
import { getEisenhower, classifyTask, completeTask, updateTask } from '../data/tasksRepo.js'
import TaskFormModal from '../ui/TaskFormModal.jsx'
import TaskStatusBadge from '../ui/TaskStatusBadge.jsx'
import { EISENHOWER_QUADRANTS, canComplete } from '../domain/taskStatus.js'
import { buildTaskUpdatePayload } from '../domain/taskPayload.js'

const QUADRANT_ACCENT = {
  importantUrgent:       'border-[color:var(--danger-border)] bg-[color:var(--danger-bg)]',
  importantNotUrgent:    'border-[color:var(--success-border)] bg-[color:var(--success-bg)]',
  notImportantUrgent:    'border-[color:var(--warning-border)] bg-[color:var(--warning-bg)]',
  notImportantNotUrgent: 'border-[color:var(--border-strong)] bg-[color:var(--surface-2)]',
}

const QUADRANT_DRAG_OVER = {
  importantUrgent:       'ring-2 ring-[color:var(--danger)]',
  importantNotUrgent:    'ring-2 ring-[color:var(--success)]',
  notImportantUrgent:    'ring-2 ring-[color:var(--warning)]',
  notImportantNotUrgent: 'ring-2 ring-[color:var(--ring)]',
}

const TASK_ITEM_COLOR = {
  importantUrgent:       'var(--danger)',
  importantNotUrgent:    'var(--success)',
  notImportantUrgent:    'var(--warning)',
  notImportantNotUrgent: 'var(--border-strong)',
  unclassified:          'var(--border-strong)',
}

const EMPTY_DATA = {
  importantUrgent: [], importantNotUrgent: [],
  notImportantUrgent: [], notImportantNotUrgent: [], unclassified: [],
}

function fmtDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export default function TasksEisenhowerPage() {
  const projects   = useTasksStore((s) => s.projects)
  const categories = useTasksStore((s) => s.categories)
  const addToast   = useTasksStore((s) => s.addToast)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [data,    setData]    = useState(EMPTY_DATA)
  const [dragOverKey, setDragOverKey] = useState(null)
  const [editing, setEditing] = useState(null)

  const draggedRef = useRef(null)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const res = await getEisenhower()
      setData(res ?? EMPTY_DATA)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error carregant Eisenhower')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function moveToQuadrant(task, sourceKey, quadrant) {
    if (sourceKey === quadrant.key) return
    try {
      await classifyTask(task.id, { important: quadrant.important, urgent: quadrant.urgent })
      addToast('Tasca classificada')
      await refresh()
    } catch (e) {
      addToast(e.message ?? 'Error classificant la tasca', 'error')
    }
  }

  async function handleUnclassify(task) {
    try {
      await classifyTask(task.id, { important: null, urgent: null })
      addToast('Tasca desclassificada')
      await refresh()
    } catch (e) {
      addToast(e.message ?? 'Error', 'error')
    }
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

  async function handleUpdate(values) {
    const payload = buildTaskUpdatePayload(values)
    try {
      await updateTask(editing.id, payload)
      setEditing(null)
      await refresh()
      addToast('Tasca actualitzada')
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  function handleDragStart(task, sourceKey) {
    draggedRef.current = { task, sourceKey }
  }

  function handleDragEnd() {
    draggedRef.current = null
    setDragOverKey(null)
  }

  function handleDrop(quadrant) {
    const dragged = draggedRef.current
    setDragOverKey(null)
    draggedRef.current = null
    if (!dragged) return
    moveToQuadrant(dragged.task, dragged.sourceKey, quadrant)
  }

  return (
    <div className="space-y-6">
      <TaskFormModal
        open={Boolean(editing)}
        mode="edit"
        initial={editing}
        projects={projects}
        categories={categories}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text">Priorització</p>
          <p className="text-sm text-text">
            Arrossega les tasques entre quadrants per canviar-ne la importància i la urgència.
          </p>
        </div>
        {loading && <span className="text-sm text-text" role="status">Carregant…</span>}
      </div>

      {error && (
        <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      {/* 2x2 Matrix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {EISENHOWER_QUADRANTS.map((q) => {
          const tasks = data[q.key] ?? []
          const isDragOver = dragOverKey === q.key
          return (
            <section
              key={q.key}
              aria-label={q.label}
              onDragOver={(e) => { e.preventDefault(); if (dragOverKey !== q.key) setDragOverKey(q.key) }}
              onDragEnter={(e) => { e.preventDefault(); setDragOverKey(q.key) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverKey(null) }}
              onDrop={(e) => { e.preventDefault(); handleDrop(q) }}
              className={[
                'rounded-2xl border p-4 transition',
                QUADRANT_ACCENT[q.key] ?? 'border-border bg-bg/40',
                isDragOver ? QUADRANT_DRAG_OVER[q.key] ?? 'ring-2 ring-[color:var(--ring)]' : '',
              ].join(' ')}
            >
              <header className="mb-3 text-center">
                <h3 className="text-sm font-bold uppercase tracking-wide text-text-h">
                  {q.label} <span className="font-medium text-text">({tasks.length})</span>
                </h3>
                <p className="text-xs text-text">{q.description}</p>
              </header>

              <div className="space-y-2">
                {tasks.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-text/60">
                    Cap tasca en aquest quadrant.
                  </p>
                )}
                {tasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    sourceKey={q.key}
                    accentColor={TASK_ITEM_COLOR[q.key]}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onComplete={handleComplete}
                    onUnclassify={handleUnclassify}
                    onMove={moveToQuadrant}
                    onEdit={setEditing}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Unclassified pool — drag source + keyboard fallback */}
      {(data.unclassified ?? []).length > 0 && (
        <section aria-labelledby="unclassified-heading">
          <h3 id="unclassified-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-text">
            Sense classificar ({data.unclassified.length})
          </h3>
          <div className="space-y-2">
            {data.unclassified.map((t) => (
              <div
                key={t.id}
                className="flex cursor-default flex-col gap-3 rounded-2xl border border-border bg-bg/60 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <DragHandle
                    label={`Arrossegar "${t.title}"`}
                    onDragStart={() => handleDragStart(t, 'unclassified')}
                    onDragEnd={handleDragEnd}
                  />
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="min-w-0 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  >
                    <p className="text-sm font-medium text-text-h">{t.title}</p>
                    <TaskStatusBadge status={t.status} className="mt-1" />
                  </button>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {EISENHOWER_QUADRANTS.map((q) => (
                    <Button
                      key={q.key}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => moveToQuadrant(t, 'unclassified', q)}
                      aria-label={`Moure "${t.title}" a ${q.label}`}
                    >
                      {q.important ? 'I' : 'NI'}/{q.urgent ? 'U' : 'NU'}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Drag handle for Eisenhower task items.
 */
function DragHandle({ onDragStart, onDragEnd, label }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={label}
      className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-text/20 active:cursor-grabbing hover:text-text/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
    >
      <svg aria-hidden className="h-4 w-3" fill="currentColor" viewBox="0 0 8 12">
        <circle cx="2" cy="2" r="1.5" />
        <circle cx="6" cy="2" r="1.5" />
        <circle cx="2" cy="6" r="1.5" />
        <circle cx="6" cy="6" r="1.5" />
        <circle cx="2" cy="10" r="1.5" />
        <circle cx="6" cy="10" r="1.5" />
      </svg>
    </div>
  )
}

/**
 * Single draggable task inside a quadrant, with accessible keyboard fallback
 * to move it to the other quadrants.
 */
function TaskItem({ task, sourceKey, accentColor, onDragStart, onDragEnd, onComplete, onUnclassify, onMove, onEdit }) {
  const [isDragging, setIsDragging] = useState(false)
  const targets = EISENHOWER_QUADRANTS.filter((q) => q.key !== sourceKey)
  const color = accentColor ?? 'var(--border-strong)'

  function handleDragStart() {
    setIsDragging(true)
    onDragStart(task, sourceKey)
  }

  function handleDragEnd() {
    setIsDragging(false)
    onDragEnd()
  }

  return (
    <div
      style={{ '--item-accent': color }}
      className={[
        'group relative select-none overflow-hidden rounded-xl',
        'border border-[color:var(--border-strong)] bg-[color:var(--surface)]',
        'backdrop-blur-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-px hover:border-[color:var(--item-accent)]',
        'hover:bg-[color:var(--surface-2)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.22)]',
        isDragging
          ? 'rotate-[0.8deg] scale-[0.96] opacity-40 shadow-2xl'
          : 'opacity-100',
      ].join(' ')}
    >
      {/* Left accent bar */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl transition-all duration-200 group-hover:w-[4px]"
        style={{ background: color }}
      />

      <div className="flex items-start gap-2 px-3 py-2.5 pl-4">
        <DragHandle
          label={`Arrossegar "${task.title}"`}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />

        <div className="min-w-0 flex-1">
          {/* Title row + action buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="w-full rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <p className="truncate text-sm font-semibold leading-snug text-text-h">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="min-w-0 flex-1 truncate text-xs text-text/70">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <TaskStatusBadge status={task.status} />
                  {task.plannedDate && (
                    <span className="rounded-full bg-[color:var(--surface-3)] px-2 py-0.5 text-xs text-text/60 tabular-nums">
                      {fmtDate(task.plannedDate)}{task.plannedTime ? ` ${task.plannedTime.slice(0, 5)}` : ''}
                    </span>
                  )}
                  {task.recurring && (
                    <span className="rounded-full bg-[color:var(--surface-3)] px-2 py-0.5 text-xs text-text/60">
                      ↺ Recurrent
                    </span>
                  )}
                  {task.overdue && (
                    <span className="rounded-full bg-[color:var(--danger-bg)] px-2 py-0.5 text-xs font-semibold text-danger">
                      ! Vencuda
                    </span>
                  )}
                </div>
              </button>
            </div>
            <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              {canComplete(task.status) && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onComplete(task)}
                aria-label={`Completar "${task.title}"`}
              >
                ✓
              </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onUnclassify(task)}
                aria-label={`Treure "${task.title}" de la matriu`}
              >
                ×
              </Button>
            </div>
          </div>

          {/* Move-to buttons (revealed on hover / focus) */}
          <div className="mt-2 flex flex-wrap items-center gap-0.5 border-t border-[color:var(--divider)] pt-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-text/40">
              Moure →
            </span>
            {targets.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => onMove(task, sourceKey, q)}
                aria-label={`Moure "${task.title}" a ${q.label}`}
                className="rounded-md px-2 py-0.5 text-xs font-medium text-text/50 transition-all duration-100 hover:bg-[color:var(--surface-3)] hover:text-text-h focus:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)]"
              >
                {q.important ? 'I' : 'NI'}/{q.urgent ? 'U' : 'NU'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
