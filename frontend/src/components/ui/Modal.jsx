import { useEffect } from 'react'

/**
 * Shell de modal reutilizable con backdrop, scroll-lock y cierre por Escape.
 * Los modales existentes pueden migrar a este componente progresivamente.
 *
 * Jerarquía de z-index:
 *   drawer  → z-50
 *   Modal   → z-[55]
 *   toasts  → z-[60]
 *
 * @param {{
 *   open: boolean
 *   onClose: () => void
 *   children: import('react').ReactNode
 *   label?: string
 *   maxWidth?: string
 * }} props
 */
export default function Modal({ open, onClose, children, label, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[55]"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      {/* Panel centrado — slide-up en mobile, centrado en sm+ */}
      <div className="pointer-events-none relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div
          className={`pointer-events-auto w-full ${maxWidth} rounded-t-3xl border border-border bg-bg shadow-float sm:rounded-3xl`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
