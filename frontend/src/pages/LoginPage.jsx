import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`)
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
        <div className="cpHero">
          <div className="cpPill" aria-hidden="true">
            <span className="cpDot" />
            <span className="cpPillText">Neon_Access</span>
          </div>
          <h1 className="cpTitle">Iniciar sesión</h1>
          <p className="cpSubtitle">
            Autenticación con JWT en cookie <code>HttpOnly</code>. El frontend no
            toca el token; solo envía <code>credentials: "include"</code>.
          </p>
        </div>

        <div className="cpCard" role="region" aria-label="Panel de acceso">
          <div className="cpCardInner">
            <header className="cpCardTitleRow">
              <h2 className="cpCardTitle">Acceso</h2>
              <p className="cpCardHint">
                Usa las credenciales demo o prueba un error para ver el feedback.
              </p>
            </header>

            <form onSubmit={onSubmit} className="cpForm" noValidate>
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

                <details className="cpDetails">
                  <summary>Credenciales demo</summary>
                  <ul>
                    <li>
                      <code>demo@example.com</code>
                    </li>
                    <li>
                      <code>password</code>
                    </li>
                  </ul>
                </details>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

