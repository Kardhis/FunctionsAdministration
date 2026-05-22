import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Shell de modal reutilizable con backdrop, scroll-lock, cierre por Escape,
 * focus trap, foco inicial y restauración de foco al cerrar.
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
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Capture triggering element when opening; restore focus when closing
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else {
      const el = triggerRef.current
      triggerRef.current = null
      if (el) window.requestAnimationFrame(() => el.focus())
    }
  }, [open])

  // Initial focus on first focusable element inside panel
  useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector(FOCUSABLE_SELECTOR)
      el?.focus()
    })
  }, [open])

  // Focus trap — keep Tab within the panel
  useEffect(() => {
    if (!open) return

    function handleTab(e) {
      if (e.key !== 'Tab') return
      const focusable = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[55]"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Backdrop — not in tab order; Escape handles keyboard dismissal */}
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      {/* Panel — slide-up en mobile, centrado en sm+ */}
      <div className="pointer-events-none relative flex h-full items-end justify-center sm:items-center sm:p-4">
        <div
          ref={panelRef}
          className={`pointer-events-auto w-full ${maxWidth} max-h-[min(92dvh,900px)] overflow-y-auto overscroll-y-contain rounded-t-3xl border border-border bg-bg shadow-float sm:rounded-3xl`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
