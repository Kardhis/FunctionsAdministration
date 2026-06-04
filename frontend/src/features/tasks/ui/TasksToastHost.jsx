import { createPortal } from 'react-dom'
import { useTasksStore } from '../store/tasksStore.js'

/**
 * Toasts rendered on document.body so they are not clipped by dashboard overflow/stacking.
 */
export default function TasksToastHost() {
  const toasts = useTasksStore((s) => s.toasts)
  const dismissToastById = useTasksStore((s) => s.dismissToastById)

  if (!toasts.length) return null

  return createPortal(
    <div
      className="fixed right-4 z-[100] flex w-[min(420px,calc(100dvw-2rem))] flex-col gap-2 pointer-events-auto"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t, idx) => (
        <div
          key={t.id ?? `toast-${idx}`}
          className={[
            'rounded-2xl border px-4 py-3 text-sm shadow-float backdrop-blur-md',
            t.kind === 'success'
              ? 'border-border bg-bg/95 text-text-h'
              : 'border-border bg-bg/95 text-danger',
          ].join(' ')}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{t.message}</p>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-[44px] items-center justify-center text-text-h/70 hover:text-text-h"
              onClick={() => dismissToastById(t.id)}
              aria-label="Tancar notificació"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  )
}
