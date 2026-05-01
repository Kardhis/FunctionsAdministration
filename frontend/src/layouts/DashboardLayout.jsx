import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import { dashboardNav } from '../data/dashboardMock.js'

function pageTitleFromPath(pathname) {
  const base = pathname.replace(/\/+$/, '')
  if (base === '/dashboard') return 'Dashboard'
  if (base.startsWith('/dashboard/habits')) {
    const leaf = base.split('/').filter(Boolean).slice(2).join('/') // habits/...
    const map = {
      overview: 'Hábitos · Dashboard',
      objectives: 'Hábitos · Objetivos',
      manage: 'Hábitos · Gestión',
      log: 'Hábitos · Registros',
      week: 'Hábitos · Semana',
      analytics: 'Hábitos · Analítica',
      settings: 'Hábitos · Ajustes',
    }
    return map[leaf] ?? 'Hábitos'
  }
  const [, , segment] = base.split('/')
  const map = {
    daily: 'Registro diario',
    stats: 'Estadísticas',
    calendar: 'Calendario',
    profile: 'Perfil',
  }
  return map[segment] ?? 'Dashboard'
}

function greetingForNow(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function displayNameFromUser(user) {
  if (!user) return 'Usuario'
  if (typeof user === 'string') return user
  return user.name || user.email || 'Usuario'
}

function emailFromUser(user) {
  if (!user || typeof user === 'string') return ''
  return user.email || ''
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const title = useMemo(() => pageTitleFromPath(location.pathname), [location.pathname])
  const displayName = useMemo(() => displayNameFromUser(user), [user])
  const email = useMemo(() => emailFromUser(user), [user])

  return (
    <div className="min-h-[100svh] bg-bg text-text">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(800px 500px at 15% 10%, rgba(170,59,255,0.12), transparent 60%), radial-gradient(900px 600px at 90% 20%, rgba(170,59,255,0.08), transparent 55%)',
        }}
      />

      <div className="relative flex w-full max-w-none gap-6 px-4 py-6 md:px-6">
        <aside
          className={`sticky top-6 h-[calc(100svh-3rem)] shrink-0 rounded-3xl border border-border bg-bg/70 shadow-soft backdrop-blur-md ${
            isCollapsed ? 'w-[84px]' : 'w-[280px]'
          }`}
        >
          <div className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]">
                  <span className="font-semibold">N</span>
                </div>
                {isCollapsed ? null : (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-h">Neon_Access</p>
                    <p className="truncate text-xs text-text">Product Dashboard</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-h hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:hover:bg-white/5"
                aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              >
                <span className="text-lg">{isCollapsed ? '»' : '«'}</span>
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {dashboardNav.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition',
                      isActive || (item.key === 'habits' && location.pathname.startsWith('/dashboard/habits'))
                        ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                        : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                    ].join(' ')
                  }
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                    {item.icon === 'grid' ? '▦' : null}
                    {item.icon === 'spark' ? '✦' : null}
                    {item.icon === 'check' ? '✓' : null}
                    {item.icon === 'chart' ? '▤' : null}
                    {item.icon === 'calendar' ? '▢' : null}
                    {item.icon === 'user' ? '◉' : null}
                  </span>
                  {isCollapsed ? null : <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-4">
              <div className={`flex items-center gap-3 rounded-2xl border border-border bg-bg/80 p-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <Avatar name={displayName} size="sm" />
                {isCollapsed ? null : (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-h">{displayName}</p>
                    {email ? <p className="truncate text-xs text-text">{email}</p> : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-6 z-10 rounded-3xl border border-border bg-bg/70 shadow-soft backdrop-blur-md">
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-text">{title}</p>
                <h1 className="mt-1 text-2xl font-semibold leading-tight text-text-h md:text-3xl">{title}</h1>
                <p className="mt-2 text-sm text-text">
                  {greetingForNow()}, <span className="font-medium text-text-h">{displayName}</span>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone="accent" className="hidden md:inline-flex">
                  V1
                </Badge>
                <div className="hidden items-center gap-3 md:flex">
                  <Avatar name={displayName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-h">{displayName}</p>
                    {email ? <p className="truncate text-xs text-text">{email}</p> : null}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={async () => {
                    await logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="mt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

