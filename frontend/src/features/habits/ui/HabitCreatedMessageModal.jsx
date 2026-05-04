import { useEffect } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { modalFooterRow, modalFooterPrimaryButtonClass } from '../../../components/modalFooter.js'
import Badge from '../../../components/Badge.jsx'

export default function HabitCreatedMessageModal({ open, habit, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !habit) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(90dvh,800px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Creado</p>
              <p className="mt-1 text-xl font-semibold text-text-h">Nuevo hábito creado</p>
              <p className="mt-1 text-sm text-text">Se guardó correctamente en la base local.</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-bg/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-text-h">
                  <span className="mr-2 inline-block">{habit.icon || '•'}</span>
                  {habit.name}
                </p>
                {habit.description ? <p className="mt-1 text-sm text-text">{habit.description}</p> : null}
              </div>
              <Badge tone={habit.active ? 'accent' : 'neutral'}>{habit.active ? 'activo' : 'inactivo'}</Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-text sm:grid-cols-2">
              <p>
                <span className="text-text-h">Color:</span> <code>{habit.color}</code>
              </p>
              <p>
                <span className="text-text-h">Categorías:</span>{' '}
                <code>{Array.isArray(habit.categoryIds) && habit.categoryIds.length ? `${habit.categoryIds.length}` : '—'}</code>
              </p>
            </div>
          </div>

          <div className={`mt-6 ${modalFooterRow}`}>
            <Button variant="primary" type="button" size="lg" className={modalFooterPrimaryButtonClass} onClick={() => onClose?.()}>
              Cerrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

