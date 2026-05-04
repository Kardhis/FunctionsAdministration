import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import * as adminRepo from '../../features/admin/data/adminUsersRepo.js'
import AdminUserCreateModal from '../../features/admin/ui/AdminUserCreateModal.jsx'
import AdminUserEditModal from '../../features/admin/ui/AdminUserEditModal.jsx'
import AdminUserPasswordModal from '../../features/admin/ui/AdminUserPasswordModal.jsx'
import AdminUserDeleteConfirmModal from '../../features/admin/ui/AdminUserDeleteConfirmModal.jsx'

function RoleChips({ roles }) {
  const list = Array.isArray(roles) ? roles : []
  return (
    <div className="flex flex-wrap gap-2">
      {list.length ? (
        list.map((r) => (
          <Badge key={r} tone={r === 'ADMIN' ? 'accent' : 'neutral'}>
            {r}
          </Badge>
        ))
      ) : (
        <Badge tone="neutral">—</Badge>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [rolesCatalog, setRolesCatalog] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pwdUser, setPwdUser] = useState(null)

  const sorted = useMemo(() => [...users].sort((a, b) => String(a.email).localeCompare(String(b.email))), [users])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [userList, roleList] = await Promise.all([adminRepo.listUsers(), adminRepo.listRoles()])
      setUsers(Array.isArray(userList) ? userList : [])
      setRolesCatalog(Array.isArray(roleList) ? roleList : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreateSubmit(values) {
    await adminRepo.createUser({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
      active: values.active,
      roles: values.roles,
    })
    await refresh()
  }

  async function handleEditSubmit(id, { email, displayName, active }) {
    const prev = users.find((u) => u.id === id)
    await adminRepo.updateUserBasics(id, { email, displayName })
    if (prev && prev.active !== active) {
      await adminRepo.updateUserStatus(id, active)
    }
    await refresh()
  }

  async function handlePasswordSubmit(id, password) {
    await adminRepo.updateUserPassword(id, password)
    await refresh()
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setError('')
    try {
      await adminRepo.deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleToggleActive(u, nextActive) {
    const snapshot = users
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, active: nextActive } : x)))
    setError('')
    try {
      await adminRepo.updateUserStatus(u.id, nextActive)
      const data = await adminRepo.listUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setUsers(snapshot)
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionHeader
          title="Administració · Usuaris"
          subtitle="Gestió d'usuaris i rols"
          right={
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto ring-1 ring-border bg-bg/80 hover:bg-bg"
              onClick={() => setCreateOpen(true)}
              disabled={loading}
            >
              Crear Usuari
            </Button>
          }
        />

        {error ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            Error: <code>{error}</code>
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/80">
                <th className="px-4 py-3 font-semibold text-text-h">Email</th>
                <th className="px-4 py-3 font-semibold text-text-h">Nom usuari</th>
                <th className="px-4 py-3 font-semibold text-text-h">Rols</th>
                <th className="px-4 py-3 font-semibold text-text-h">Actiu / Desactiu</th>
                <th className="px-4 py-3 text-right font-semibold text-text-h">Accions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.id} className="border-b border-border/80 last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-text-h">{u.email}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-text">{u.displayName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <RoleChips roles={u.roles} />
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-text-h">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={Boolean(u.active)}
                        onChange={(e) => handleToggleActive(u, e.target.checked)}
                        aria-label="Actiu / Desactiu"
                      />
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setEditUser(u)}>
                        Editar
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => setPwdUser(u)}>
                        Canviar Contrasenya
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => setDeleteTarget(u)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!sorted.length && !loading ? (
          <p className="p-5 text-sm text-text">No hi ha usuaris.</p>
        ) : null}
      </Card>

      <AdminUserCreateModal
        open={createOpen}
        rolesCatalog={rolesCatalog}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <AdminUserEditModal
        open={Boolean(editUser)}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSubmit={handleEditSubmit}
      />

      <AdminUserPasswordModal
        open={Boolean(pwdUser)}
        user={pwdUser}
        onClose={() => setPwdUser(null)}
        onSubmit={handlePasswordSubmit}
      />

      <AdminUserDeleteConfirmModal
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
