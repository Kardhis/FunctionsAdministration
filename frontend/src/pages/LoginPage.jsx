import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { API_BASE } from '../data/api.js'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const m = location.state?.message
    if (typeof m === 'string' && m) {
      setInfo(m)
    }
  }, [location.state])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const code = data?.error
        const message =
          code === 'account_inactive'
            ? 'Esta cuenta está desactivada. Un administrador debe activarla en Administració · Usuaris (Actiu / Desactiu).'
            : code === 'invalid_credentials'
              ? 'Credenciales incorrectas.'
              : (code ?? `HTTP ${res.status}`)
        setError(message)
        return
      }

      await refresh()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="cpLogin">
      <div className="cpBackgroundGrid" aria-hidden="true" />
      <div className="cpGlowOrbs" aria-hidden="true" />

      <section className="cpShell" aria-label="Login">
        <div className="cpCard" role="region" aria-label="Panel de acceso">
          <div className="cpCardInner">
            <header className="cpCardTitleRow">
              <h2 className="cpCardTitle">Acceso</h2>
            </header>

            <form onSubmit={onSubmit} className="cpForm" noValidate>
              {info ? (
                <p className="cpInfo" role="status" aria-live="polite">
                  {info}
                </p>
              ) : null}
              <div className="cpField">
                <label className="cpLabel" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="cpInput"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </div>

              <div className="cpField">
                <label className="cpLabel" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="cpInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="cpActions">
                <button
                  className="cpButton"
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? 'Entrando…' : 'Entrar'}
                </button>

                {error ? (
                  <p className="cpError" role="alert" aria-live="polite">
                    Error: <code>{error}</code>
                  </p>
                ) : null}
              </div>
            </form>

            <nav className="cpAuthLinks" aria-label="Otras opciones">
              <Link className="cpAuthLink" to="/register">
                Crear cuenta
              </Link>
              <Link className="cpAuthLink" to="/forgot-password">
                ¿Has olvidado la contraseña?
              </Link>
            </nav>
          </div>
        </div>
      </section>
    </main>
  )
}

