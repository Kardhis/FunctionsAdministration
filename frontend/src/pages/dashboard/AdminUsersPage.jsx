import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import { apiFetch } from '../../data/api.js'

function RoleChips({ roles }) {
  const list = Array.isArray(roles) ? roles : []
  return (
    <div className="flex flex-wrap gap-2">
      {list.length ? list.map((r) => <Badge key={r} tone={r === 'ADMIN' ? 'accent' : 'neutral'}>{r}</Badge>) : <Badge tone="neutral">sin roles</Badge>}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)

  const sorted = useMemo(() => [...users].sort((a, b) => String(a.email).localeCompare(String(b.email))), [users])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/admin/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function createUser() {
    setError('')
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: {
          email: newEmail,
          password: newPassword,
          displayName: newDisplayName || null,
          roles: newIsAdmin ? ['ADMIN', 'USER'] : ['USER'],
        },
      })
      setNewEmail('')
      setNewPassword('')
      setNewDisplayName('')
      setNewIsAdmin(false)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function toggleActive(u) {
    setError('')
    try {
      await apiFetch(`/api/admin/users/${u.id}/status`, { method: 'PUT', body: { active: !u.active } })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function setRoles(u, roles) {
    setError('')
    try {
      await apiFetch(`/api/admin/users/${u.id}/roles`, { method: 'PUT', body: { roles } })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionHeader title="Admin · Usuarios" subtitle="Crear, activar/desactivar y asignar roles." right={<Button variant="secondary" onClick={refresh} disabled={loading}>{loading ? 'Cargando…' : 'Refrescar'}</Button>} />

        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            Error: <code>{error}</code>
          </p>
        ) : null}
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-text-h">Crear usuario</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input className="rounded-2xl border border-border bg-bg/60 px-3 py-2 text-sm text-text-h" placeholder="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <input className="rounded-2xl border border-border bg-bg/60 px-3 py-2 text-sm text-text-h" placeholder="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input className="rounded-2xl border border-border bg-bg/60 px-3 py-2 text-sm text-text-h" placeholder="displayName (opcional)" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} />
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-bg/60 px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-text-h">
              <input type="checkbox" checked={newIsAdmin} onChange={(e) => setNewIsAdmin(e.target.checked)} />
              ADMIN
            </label>
            <Button variant="primary" onClick={createUser} disabled={!newEmail || !newPassword}>Crear</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-semibold text-text-h">Usuarios</p>
        <div className="mt-4 space-y-3">
          {sorted.map((u) => {
            const roles = Array.isArray(u.roles) ? u.roles : []
            const isAdmin = roles.includes('ADMIN')
            const nextRoles = isAdmin ? ['USER'] : ['ADMIN', 'USER']
            return (
              <div key={u.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-bg/60 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-h">{u.email}</p>
                  <p className="truncate text-xs text-text">{u.displayName ?? '—'}</p>
                  <div className="mt-2">
                    <RoleChips roles={roles} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={u.active ? 'accent' : 'neutral'}>{u.active ? 'activo' : 'inactivo'}</Badge>
                  <Button variant="secondary" onClick={() => toggleActive(u)}>
                    {u.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="secondary" onClick={() => setRoles(u, nextRoles)}>
                    {isAdmin ? 'Quitar ADMIN' : 'Hacer ADMIN'}
                  </Button>
                </div>
              </div>
            )
          })}
          {!sorted.length ? <p className="text-sm text-text">No hay usuarios.</p> : null}
        </div>
      </Card>
    </div>
  )
}

