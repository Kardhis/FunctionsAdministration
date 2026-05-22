import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../data/api.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = useMemo(() => {
    const raw = searchParams.get('token')
    if (raw == null || raw === '') return ''
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }, [searchParams])

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!tokenFromUrl) {
      setError('Falta el token en la URL. Abre el enlace del correo.')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: tokenFromUrl, newPassword: password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const code = data?.error
        const message =
          code === 'invalid_reset_token'
            ? 'El enlace no es válido o ya se ha usado.'
            : code === 'reset_token_expired'
              ? 'El enlace ha caducado. Solicita uno nuevo.'
              : code === 'validation_failed' && Array.isArray(data?.details)
                ? data.details.join(' · ')
                : (code ?? `HTTP ${res.status}`)
        setError(message)
        return
      }
      navigate('/login', {
        replace: true,
        state: { message: 'Contraseña actualizada. Inicia sesión con la nueva contraseña.' },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout sectionLabel="Nueva contraseña" cardLabel="Restablecer contraseña">
      <header className="cpCardTitleRow">
        <h2 className="cpCardTitle">Nueva contraseña</h2>
      </header>

      {!tokenFromUrl ? (
        <p className="cpError" role="alert">
          Falta el token en la URL. Abre el enlace que recibiste por correo.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="cpForm" noValidate>
        <div className="cpField">
          <label className="cpLabel" htmlFor="reset-password">
            Nueva contraseña
          </label>
          <input
            id="reset-password"
            className="cpInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={!tokenFromUrl}
          />
        </div>

        <div className="cpField">
          <label className="cpLabel" htmlFor="reset-password2">
            Repetir contraseña
          </label>
          <input
            id="reset-password2"
            className="cpInput"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={!tokenFromUrl}
          />
        </div>

        <div className="cpActions">
          <button
            className="cpButton"
            type="submit"
            disabled={isLoading || !tokenFromUrl}
            aria-busy={isLoading}
          >
            {isLoading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
          {error ? (
            <p className="cpError" role="alert" aria-live="polite">
              Error: <code>{error}</code>
            </p>
          ) : null}
        </div>
      </form>

      <nav className="cpAuthLinks" aria-label="Volver al acceso">
        <Link className="cpAuthLink" to="/login">
          Volver al inicio de sesión
        </Link>
        <Link className="cpAuthLink" to="/forgot-password">
          Solicitar otro enlace
        </Link>
      </nav>
    </AuthLayout>
  )
}
