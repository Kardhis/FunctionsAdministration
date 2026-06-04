import { useEffect, useState } from 'react'
import Button from '../../../components/Button.jsx'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock.js'

const LABELS = {
  project:  { title: 'Projecte', namePlaceholder: 'Ex: Treball, Personal…' },
  category: { title: 'Categoria', namePlaceholder: 'Ex: Urgent, Recerca…' },
}

const DEFAULT_COLOR = '#6366f1'

/**
 * @param {{
 *   open: boolean,
 *   type: 'project' | 'category',
 *   initial?: { id: number, name: string, color: string } | null,
 *   onClose: () => void,
 *   onSubmit: (data: { name: string, color: string }) => Promise<{ ok: boolean, error?: string }>
 * }} props
 */
export default function TaskTaxonomyModal({ open, type = 'project', initial = null, onClose, onSubmit }) {
  useBodyScrollLock(open)

  const [name,       setName]       = useState('')
  const [color,      setColor]      = useState(DEFAULT_COLOR)
  const [nameError,  setNameError]  = useState('')
  const [submitError,setSubmitError]= useState('')
  const [loading,    setLoading]    = useState(false)

  const isEdit = Boolean(initial)
  const labels = LABELS[type] ?? LABELS.project

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setColor(initial?.color ?? DEFAULT_COLOR)
    setNameError('')
    setSubmitError('')
    setLoading(false)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('El nom és obligatori')
      return
    }
    if (trimmed.length > 80) {
      setNameError('Màxim 80 caràcters')
      return
    }
    setNameError('')
    setSubmitError('')
    setLoading(true)
    try {
      const result = await onSubmit({ name: trimmed, color })
      if (result?.ok) {
        onClose()
      } else {
        setSubmitError(result?.error ?? 'Error desant')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="taxonomy-modal-title"
    >
      <div className="my-8 w-full max-w-sm rounded-2xl border border-border bg-bg shadow-soft">
        <div className="border-b border-border px-6 py-4">
          <h2 id="taxonomy-modal-title" className="text-base font-semibold text-text-h">
            {isEdit ? `Editar ${labels.title.toLowerCase()}` : `Nou ${labels.title.toLowerCase()}`}
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-6 py-5">
            <div>
              <label htmlFor="taxonomy-name" className="block text-xs font-medium uppercase tracking-wide text-text">
                Nom <span className="text-danger">*</span>
              </label>
              <input
                id="taxonomy-name"
                type="text"
                maxLength={80}
                autoFocus
                className="mt-1.5 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                placeholder={labels.namePlaceholder}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                disabled={loading}
              />
              {nameError && <p className="mt-1 text-xs text-danger" role="alert">{nameError}</p>}
            </div>

            <div>
              <label htmlFor="taxonomy-color" className="block text-xs font-medium uppercase tracking-wide text-text">
                Color
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="taxonomy-color"
                  type="color"
                  className="h-10 w-10 cursor-pointer rounded-xl border border-border bg-bg p-0.5 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={loading}
                />
                <span
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium"
                  style={{ color, borderColor: `${color}66` }}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  {name.trim() || labels.title}
                </span>
              </div>
            </div>

            {submitError && (
              <p className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel·lar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Desant…' : isEdit ? 'Desar canvis' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
