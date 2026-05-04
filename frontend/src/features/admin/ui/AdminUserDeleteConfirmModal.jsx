import { useEffect, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { modalFooterRow, modalFooterCancelButtonClass, modalFooterPrimaryButtonClass } from '../../../components/modalFooter.js'

/**
 * @param {{ open: boolean, user: { id: number, displayName?: string|null, email: string }|null, onCancel: () => void, onConfirm: () => Promise<void> }} props
 */
export default function AdminUserDeleteConfirmModal({ open, user, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setBusy(false)
  }, [open, user])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open || !user) return null

  const display = user.displayName?.trim() || user.email

  async function handleConfirm() {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onCancel?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-lg items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(88dvh,720px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Confirmació</p>
              <p className="mt-1 text-xl font-semibold text-text-h">Eliminar</p>
              <p className="mt-2 text-sm text-text">
                Estàs segur que vols eliminar a <span className="font-semibold text-text-h">{display}</span>?
              </p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onCancel?.()} aria-label="Tancar">
              ✕
            </Button>
          </div>

          <div className={`mt-6 ${modalFooterRow}`}>
            <Button type="button" variant="ghost" size="sm" className={modalFooterCancelButtonClass} onClick={() => onCancel?.()} disabled={busy}>
              Cancel·lar
            </Button>
            <Button type="button" variant="danger" size="lg" className={modalFooterPrimaryButtonClass} onClick={handleConfirm} disabled={busy}>
              {busy ? 'Eliminant…' : 'Eliminar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
