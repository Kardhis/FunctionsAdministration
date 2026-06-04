import { useEffect, useRef } from 'react'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock.js'
import Button from '../../../components/Button.jsx'

/**
 * @param {{
 *   open: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   confirmVariant?: string,
 *   loading?: boolean,
 *   onCancel: () => void,
 *   onConfirm: () => void,
 * }} props
 */
export default function ConfirmActionModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
  loading = false,
  onCancel,
  onConfirm,
}) {
  useBodyScrollLock(open)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  useEffect(() => {
    if (open) {
      const btn = dialogRef.current?.querySelector('button')
      btn?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div ref={dialogRef} className="w-full max-w-sm rounded-2xl border border-border bg-bg p-6 shadow-soft">
        <h2 id="confirm-modal-title" className="text-base font-semibold text-text-h">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel·lar
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Espera…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
