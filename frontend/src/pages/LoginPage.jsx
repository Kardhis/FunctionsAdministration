import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { API_BASE } from '../data/api.js'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'LoginPage.jsx:onSubmit:pre_fetch',
          message: 'Submitting login',
          data: {
            apiBase: API_BASE,
            pageOrigin: typeof window !== 'undefined' ? window.location.origin : null,
            pageProtocol: typeof window !== 'undefined' ? window.location.protocol : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'LoginPage.jsx:onSubmit:post_fetch',
          message: 'Login response received',
          data: {
            status: res.status,
            ok: res.ok,
            redirected: res.redirected,
            type: res.type,
            url: res.url,
            errorCode: data?.error ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log

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
      // #region agent log
      fetch('http://127.0.0.1:7799/ingest/4640c2d9-05e7-49ac-af5a-780a24bdc3b2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '16e790' },
        body: JSON.stringify({
          sessionId: '16e790',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'LoginPage.jsx:onSubmit:catch',
          message: 'Login fetch threw',
          data: {
            name: err instanceof Error ? err.name : null,
            message: err instanceof Error ? err.message : String(err),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion agent log
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
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

