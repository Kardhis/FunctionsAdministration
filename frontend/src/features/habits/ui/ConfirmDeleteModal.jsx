import { useEffect } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'

export default function ConfirmDeleteModal({ open, title = 'Confirmar', message = '¿Seguro?', onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onCancel?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-lg items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(88dvh,720px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Confirmación</p>
              <p className="mt-1 text-xl font-semibold text-text-h">{title}</p>
              <p className="mt-2 text-sm text-text">{message}</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onCancel?.()} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={() => onCancel?.()}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" className="min-h-11 w-full bg-[crimson] hover:brightness-110 sm:w-auto" onClick={() => onConfirm?.()}>
              Eliminar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

