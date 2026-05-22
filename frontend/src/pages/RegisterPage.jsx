import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../data/api.js'
import AuthLayout from '../layouts/AuthLayout.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const body = {
        email,
        password,
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
      }
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409 && data?.error === 'email_exists') {
        setError('Ya existe una cuenta con este correo.')
        return
      }
      if (!res.ok) {
        if (data?.error === 'validation_failed' && Array.isArray(data?.details)) {
          setError(data.details.join(' · '))
          return
        }
        setError(data?.error ?? `HTTP ${res.status}`)
        return
      }
      navigate('/login', {
        replace: true,
        state: { message: 'Cuenta creada. Ya puedes iniciar sesión.' },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout sectionLabel="Registro" cardLabel="Crear cuenta">
      <header className="cpCardTitleRow">
        <h2 className="cpCardTitle">Crear cuenta</h2>
      </header>

      <form onSubmit={onSubmit} className="cpForm" noValidate>
        <div className="cpField">
          <label className="cpLabel" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            className="cpInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required
          />
        </div>

        <div className="cpField">
          <label className="cpLabel" htmlFor="register-name">
            Nombre (opcional)
          </label>
          <input
            id="register-name"
            className="cpInput"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="cpField">
          <label className="cpLabel" htmlFor="register-password">
            Contraseña (mín. 8 caracteres)
          </label>
          <input
            id="register-password"
            className="cpInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="cpActions">
          <button className="cpButton" type="submit" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Creando…' : 'Registrarse'}
          </button>
          {error ? (
            <p className="cpError" role="alert" aria-live="polite">
              Error: <code>{error}</code>
            </p>
          ) : null}
        </div>
      </form>

      <nav className="cpAuthLinks" aria-label="Enlace a acceso">
        <Link className="cpAuthLink" to="/login">
          ¿Ya tienes cuenta? Iniciar sesión
        </Link>
      </nav>
    </AuthLayout>
  )
}
