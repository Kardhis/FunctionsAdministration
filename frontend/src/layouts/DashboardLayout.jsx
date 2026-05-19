import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import { dashboardNav, filterDashboardNavByRole } from '../data/dashboardMock.js'
import { isAdmin } from '../auth/roles.js'
import { applyThemeToRoot, loadThemeSetting } from '../theme/theme.js'
import SidebarPanel from './SidebarPanel.jsx'

function pageTitleFromPath(pathname) {
  const base = pathname.replace(/\/+$/, '')
  if (base === '/dashboard') return 'Dashboard'
  if (base.startsWith('/dashboard/admin/users')) return 'Administració · Usuaris'
  if (base.startsWith('/dashboard/habits')) {
    const leaf = base.split('/').filter(Boolean).slice(2).join('/') // habits/...
    const map = {
      overview: 'Hàbits · Dashboard',
      objectives: 'Hàbits · Objetivos',
      manage: 'Hàbits · Hábitos',
      log: 'Hàbits · Registros',
      week: 'Hàbits · Semana',
      analytics: 'Hàbits · Analítica',
      settings: 'Hàbits · Ajustes',
    }
    return map[leaf] ?? 'Hàbits'
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
  const { user, logout, roles } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const navItems = useMemo(() => filterDashboardNavByRole(dashboardNav, isAdmin(roles)), [roles])

  const title = useMemo(() => pageTitleFromPath(location.pathname), [location.pathname])
  const displayName = useMemo(() => displayNameFromUser(user), [user])
  const email = useMemo(() => emailFromUser(user), [user])

  useEffect(() => {
    let mounted = true
    loadThemeSetting()
      .then((t) => {
        if (!mounted) return
        applyThemeToRoot(t)
      })
      .catch(() => {
        if (!mounted) return
        applyThemeToRoot('system')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  return (
    <div className="min-h-[100svh] bg-bg text-text">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(800px 500px at 15% 10%, rgba(34,211,238,0.12), transparent 60%), radial-gradient(900px 600px at 90% 20%, rgba(96,165,250,0.10), transparent 55%)',
        }}
      />

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-[100svh] w-[min(280px,92vw)] flex-col border-r border-border bg-bg/95 shadow-float backdrop-blur-md transition-transform duration-200 ease-out lg:hidden',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!navOpen}
      >
        <SidebarPanel
          location={location}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          mobileDrawer
          onCloseMobile={() => setNavOpen(false)}
          displayName={displayName}
          email={email}
          navId="dashboard-mobile-nav"
          navItems={navItems}
        />
      </aside>

      <div className="relative flex w-full max-w-none gap-4 px-3 py-4 sm:gap-6 sm:px-4 md:px-6 md:py-6 lg:gap-6">
        <aside
          className={`sticky top-4 hidden h-[calc(100svh-2rem)] shrink-0 rounded-3xl border border-border bg-bg/70 shadow-soft backdrop-blur-md lg:flex lg:top-6 lg:h-[calc(100svh-3rem)] ${
            isCollapsed ? 'w-[84px]' : 'w-[280px]'
          }`}
        >
          <SidebarPanel
            location={location}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((v) => !v)}
            mobileDrawer={false}
            onCloseMobile={undefined}
            displayName={displayName}
            email={email}
            navId={undefined}
            navItems={navItems}
          />
        </aside>

        <div className="min-w-0 flex-1 overflow-x-clip">
          <header className="sticky top-4 z-10 rounded-3xl border border-border bg-bg/70 shadow-soft backdrop-blur-md lg:top-6">
            <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-border bg-bg/80 text-text-h shadow-soft hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40 lg:hidden dark:hover:bg-white/5"
                  aria-expanded={navOpen}
                  aria-controls="dashboard-mobile-nav"
                  onClick={() => setNavOpen(true)}
                >
                  <span className="sr-only">Abrir menú</span>
                  <span className="text-base" aria-hidden>
                    ☰
                  </span>
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-text">{title}</p>
                  <h1 className="mt-1 text-xl font-semibold leading-tight text-text-h sm:text-2xl md:text-3xl">{title}</h1>
                  <p className="mt-2 text-sm text-text">
                    {greetingForNow()}, <span className="font-medium text-text-h">{displayName}</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                  className="min-h-11"
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

          <main className="mt-4 sm:mt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
