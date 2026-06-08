import Button from '../../../components/Button.jsx'
import TaskStatusBadge from './TaskStatusBadge.jsx'
import { isFinal, canComplete } from '../domain/taskStatus.js'

function fmtDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

/**
 * Compact task card for mobile lists and specialized views.
 *
 * @param {{
 *   task: object,
 *   onEdit?: (task: object) => void,
 *   onComplete?: (task: object) => void,
 *   onCancel?: (task: object) => void,
 *   onReopen?: (task: object) => void,
 *   onDelete?: (task: object) => void,
 *   onSchedule?: (task: object) => void,
 *   compact?: boolean,
 * }} props
 */
export default function TaskCard({
  task,
  onEdit,
  onComplete,
  onCancel,
  onReopen,
  onDelete,
  onSchedule,
  compact = false,
}) {
  const final = isFinal(task.status)

  return (
    <div
      className={[
        'rounded-2xl border border-border bg-bg/60 ring-1 ring-border',
        task.overdue && !final ? 'ring-danger/40 border-danger/30' : '',
        compact ? 'p-3' : 'p-4',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Complete checkbox / indicator */}
        {onComplete && canComplete(task.status) && (
          <button
            type="button"
            aria-label="Completar tasca"
            onClick={() => onComplete(task)}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-bg hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] transition"
          />
        )}
        {final && (
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-border text-xs text-text">
            ✓
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3 min-w-0">
            <p className={['min-w-0 max-w-[50%] truncate text-sm font-medium sm:max-w-none sm:shrink-0', final ? 'line-through text-text/50' : 'text-text-h'].join(' ')}>
              {task.title}
            </p>
            {task.description && (
              <p className="min-w-0 flex-1 truncate text-xs text-text/70">
                {task.description}
              </p>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} />

            {task.overdue && !final && (
              <span className="inline-flex items-center rounded-xl bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger ring-1 ring-danger/30">
                Vencuda
              </span>
            )}
            {task.recurring && (
              <span className="inline-flex items-center rounded-xl bg-bg px-2 py-0.5 text-xs text-text ring-1 ring-border">
                Recurrent
              </span>
            )}
            {task.important === true && (
              <span className="inline-flex items-center rounded-xl bg-[color:var(--accent-bg)] px-2 py-0.5 text-xs text-[color:var(--accent)] ring-1 ring-[color:var(--accent-border)]">
                Important
              </span>
            )}
            {task.urgent === true && (
              <span className="inline-flex items-center rounded-xl bg-[color:var(--warning-bg,oklch(0.95_0.05_80))] px-2 py-0.5 text-xs text-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/30">
                Urgent
              </span>
            )}
            {(task.estimatedMinutes != null || task.totalMinutes != null) && (
              <span className="text-xs text-text tabular-nums">
                {task.totalMinutes != null
                  ? `${task.totalMinutes} min reals${task.estimatedMinutes != null ? ` / ${task.estimatedMinutes} est.` : ''}`
                  : `${task.estimatedMinutes} min est.`}
              </span>
            )}
            {task.projectName && (
              <span className="text-xs text-text" style={{ color: task.projectColor ?? undefined }}>
                {task.projectName}
              </span>
            )}
            {task.categoryName && (
              <span
                className="inline-flex items-center rounded-xl px-2 py-0.5 text-xs ring-1"
                style={{
                  backgroundColor: task.categoryColor ? `${task.categoryColor}20` : undefined,
                  color: task.categoryColor ?? undefined,
                  borderColor: task.categoryColor ? `${task.categoryColor}50` : undefined,
                }}
              >
                {task.categoryName}
              </span>
            )}
          </div>

          {(task.plannedDate || task.dueDate) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
              {task.plannedDate && (
                <span className="text-xs text-text">
                  <span className="font-bold underline">Data Planificada:</span>{' '}
                  <span className="font-medium text-text-h tabular-nums">
                    {fmtDate(task.plannedDate)}{task.plannedTime ? ` ${task.plannedTime.slice(0, 5)}` : ''}
                  </span>
                </span>
              )}
              {task.dueDate && (
                <span className="text-xs text-text">
                  <span className="font-bold underline text-[color:var(--danger-dark)]">Data Límit:</span>{' '}
                  <span className={[
                    'font-bold tabular-nums text-[color:var(--danger-dark)]',
                    task.overdue && !final ? 'underline decoration-[color:var(--danger-dark)]/40' : '',
                  ].join(' ')}>
                    {fmtDate(task.dueDate)}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {onSchedule && !final && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onSchedule(task)}>
              Planificar
            </Button>
          )}
          {onEdit && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(task)}>
              Editar
            </Button>
          )}
          {onComplete && canComplete(task.status) && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onComplete(task)}>
              Completar
            </Button>
          )}
          {onCancel && !final && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onCancel(task)}>
              Cancel·lar
            </Button>
          )}
          {onReopen && final && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onReopen(task)}>
              Reobrir
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(task)}>
              Eliminar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
