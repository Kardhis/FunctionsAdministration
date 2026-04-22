import { useAuth } from '../../auth/AuthContext.jsx'

export default function AccountSummary() {
  const { user } = useAuth()

  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <p className="text-sm font-medium text-text-h">Cuenta</p>
      <div className="mt-3 space-y-2 text-sm text-text">
        <p>
          <span className="text-text-h">Usuario:</span>{' '}
          <code>{typeof user === 'string' ? user : user?.name ?? '—'}</code>
        </p>
        <p>
          <span className="text-text-h">Email:</span>{' '}
          <code>{typeof user === 'string' ? '—' : user?.email ?? '—'}</code>
        </p>
      </div>
    </div>
  )
}

