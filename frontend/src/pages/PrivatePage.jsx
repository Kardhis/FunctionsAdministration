import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function PrivatePage() {
  const navigate = useNavigate()
  const { status, user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch('http://localhost:8080/api/private', {
          method: 'GET',
          credentials: 'include',
        })

        const body = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(body?.message ?? body?.error ?? `HTTP ${res.status}`)
        }

        if (!cancelled) setData(body)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 720 }}>
      <h1>Zona “privada” (Fase 2)</h1>
      <p>
        Estado de auth (basado en backend): <strong>{status}</strong>
        {user ? (
          <>
            {' '}
            (user: <code>{user}</code>)
          </>
        ) : null}
      </p>

      <h2>Respuesta de backend protegido</h2>
      {isLoading ? <p>Cargando...</p> : null}
      {error ? (
        <p style={{ color: 'crimson' }}>
          Error llamando a <code>/api/private</code>: <code>{error}</code>
        </p>
      ) : null}
      {data ? (
        <pre
          style={{
            background: '#111',
            color: '#eee',
            padding: 12,
            borderRadius: 8,
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}

      <h2>Logout</h2>
      <button
        type="button"
        disabled={isLoggingOut}
        onClick={async () => {
          setIsLoggingOut(true)
          try {
            await logout()
            navigate('/login', { replace: true })
          } finally {
            setIsLoggingOut(false)
          }
        }}
      >
        {isLoggingOut ? 'Saliendo...' : 'Cerrar sesión'}
      </button>

      <p>
        <Link to="/login">Volver a login</Link>
      </p>
    </main>
  )
}

