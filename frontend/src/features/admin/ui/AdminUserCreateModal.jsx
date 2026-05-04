import { useEffect, useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { modalFooterRow, modalFooterCancelButtonClass, modalFooterPrimaryButtonClass } from '../../../components/modalFooter.js'

/**
 * @param {{ open: boolean, rolesCatalog: string[], onClose: () => void, onSubmit: (values: { email: string, password: string, displayName: string, active: boolean, roles: string[] }) => Promise<void> }} props
 */
export default function AdminUserCreateModal({ open, rolesCatalog = [], onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [active, setActive] = useState(true)
  const [selectedRoles, setSelectedRoles] = useState(() => new Set())
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setEmail('')
    setDisplayName('')
    setPassword('')
    setActive(true)
    const initial = new Set()
    if (rolesCatalog.includes('USER')) initial.add('USER')
    setSelectedRoles(initial)
    setLocalError('')
    setSaving(false)
  }, [open, rolesCatalog])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

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
    if (!em || !dn || !password) {
      setLocalError('Completa Email, Nom Usuari i Contrasenya.')
      return
    }
    const roles = [...selectedRoles]
    if (!roles.length) {
      setLocalError("Selecciona almenys un rol als 'Rols'.")
      return
    }
    setSaving(true)
    try {
      await onSubmit({ email: em, password, displayName: dn, active, roles })
      onClose?.()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-lg items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(92dvh,900px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Administració</p>
              <p className="mt-1 text-xl font-semibold text-text-h">Crear Usuari</p>
              <p className="mt-1 text-sm text-text">Omple tots els camps obligatoris.</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Tancar">
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
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Nom Usuari</span>
              <input
                type="text"
                required
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Contrasenya</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div>
              <span className="text-sm font-medium text-text-h">Rols</span>
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-border bg-bg/60 p-3">
                {sortedRoles.length ? (
                  sortedRoles.map((r) => (
                    <label key={r} className="flex items-center justify-between gap-3 text-sm text-text-h">
                      <span className="truncate font-mono text-xs">{r}</span>
                      <input type="checkbox" className="h-4 w-4 shrink-0" checked={selectedRoles.has(r)} onChange={() => toggleRole(r)} />
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-text">No hi ha rols disponibles.</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span className="text-sm font-medium text-text-h">Actiu / Desactiu</span>
            </label>

            {localError ? (
              <p className="text-sm text-[crimson] dark:text-red-400" role="alert">
                {localError}
              </p>
            ) : null}

            <div className={`mt-2 ${modalFooterRow}`}>
              <Button type="button" variant="ghost" size="sm" className={modalFooterCancelButtonClass} onClick={() => onClose?.()} disabled={saving}>
                Cancel·lar
              </Button>
              <Button type="submit" variant="primary" size="lg" className={modalFooterPrimaryButtonClass} disabled={saving}>
                {saving ? 'Guardant…' : 'Crear'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
