import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../data/api.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data?.error === 'validation_failed' && Array.isArray(data?.details)) {
          setError(data.details.join(' · '))
          return
        }
        setError(data?.error ?? `HTTP ${res.status}`)
        return
      }
      setInfo(
        typeof data?.message === 'string'
          ? data.message
          : 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout sectionLabel="Recuperar contraseña" cardLabel="Solicitar enlace">
      <header className="cpCardTitleRow">
        <h2 className="cpCardTitle">Recuperar contraseña</h2>
      </header>

      <form onSubmit={onSubmit} className="cpForm" noValidate>
        <div className="cpField">
          <label className="cpLabel" htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            className="cpInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>

        <div className="cpActions">
          <button className="cpButton" type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Enviando…' : 'Enviar enlace'}
          </button>
          {info ? (
            <p className="cpInfo" role="status" aria-live="polite">
              {info}
            </p>
          ) : null}
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
      </nav>
    </AuthLayout>
  )
}
