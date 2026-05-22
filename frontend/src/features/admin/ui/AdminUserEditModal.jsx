import { useEffect, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { modalFooterRow, modalFooterCancelButtonClass, modalFooterPrimaryButtonClass } from '../../../components/modalFooter.js'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock.js'

/**
 * @param {{ open: boolean, user: { id: number, email: string, displayName?: string|null, active: boolean, roles?: string[] }|null, rolesCatalog: string[], onClose: () => void, onSubmit: (id: number, values: { email: string, displayName: string, active: boolean, roles: string[] }) => Promise<void> }} props
 */
export default function AdminUserEditModal({ open, user, rolesCatalog = [], onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [active, setActive] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState(() => new Set())
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open || !user) return
    setEmail(user.email ?? '')
    setDisplayName(user.displayName ?? '')
    setActive(Boolean(user.active))
    setSelectedRoles(new Set(Array.isArray(user.roles) ? user.roles : []))
    setLocalError('')
    setSaving(false)
  }, [open, user])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !user) return null

  const sortedRoles = [...rolesCatalog].sort((a, b) => String(a).localeCompare(String(b)))

  function toggleRole(name) {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    const em = email.trim()
    const dn = displayName.trim()
    if (!em || !dn) {
      setLocalError('Email i Nom Usuari són obligatoris.')
      return
    }
    const roles = [...selectedRoles]
    if (!roles.length) {
      setLocalError("Selecciona almenys un rol als 'Rols'.")
      return
    }
    setSaving(true)
    try {
      await onSubmit(user.id, { email: em, displayName: dn, active, roles })
      onClose?.()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[55]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-lg items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(92dvh,900px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Administració</p>
              <p className="mt-1 text-xl font-semibold text-text-h">Editar</p>
              <p className="mt-1 text-sm text-text">Modifica les dades de l&apos;usuari.</p>
            </div>
            <Button variant="ghost" type="button" className="min-h-11 min-w-[44px]" onClick={() => onClose?.()} aria-label="Tancar">
              ✕
            </Button>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-text-h">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Nom usuari</span>
              <input
                type="text"
                required
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>

            <div>
              <span className="text-sm font-medium text-text-h">Rols</span>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-border bg-bg/60 p-3">
                {sortedRoles.length ? (
                  sortedRoles.map((r) => (
                    <label key={r} className="flex items-center justify-between gap-3 text-sm text-text-h">
                      <span className="truncate font-mono text-xs">{r}</span>
                      <input type="checkbox" className="ui-checkbox" checked={selectedRoles.has(r)} onChange={() => toggleRole(r)} />
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-text">No hi ha rols disponibles.</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="ui-checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span className="text-sm font-medium text-text-h">Actiu / Desactiu</span>
            </label>

            {localError ? (
              <p className="text-sm text-danger" role="alert">
                {localError}
              </p>
            ) : null}

            <div className={`mt-2 ${modalFooterRow}`}>
              <Button type="button" variant="ghost" size="sm" className={modalFooterCancelButtonClass} onClick={() => onClose?.()} disabled={saving}>
                Cancel·lar
              </Button>
              <Button type="submit" variant="primary" size="lg" className={modalFooterPrimaryButtonClass} disabled={saving}>
                {saving ? 'Guardant…' : 'Desar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
