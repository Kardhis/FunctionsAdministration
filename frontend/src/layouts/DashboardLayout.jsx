import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import { dashboardNav } from '../data/dashboardMock.js'
import { applyThemeToRoot, loadThemeSetting } from '../theme/theme.js'

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

/** @param {{ to: string }} child @param {string} pathname */
function childPathActive(child, pathname) {
  return pathname === child.to || pathname.startsWith(`${child.to}/`)
}

/** @param {import('../data/types.js').NavItem} item @param {string} pathname */
function navGroupChildActive(item, pathname) {
  return Boolean(item.children?.some((c) => childPathActive(c, pathname)))
}

/** @param {string} icon */
function NavGlyph({ icon }) {
  if (icon === 'grid') return '▦'
  if (icon === 'spark') return '✦'
  if (icon === 'check') return '✓'
  if (icon === 'chart') return '▤'
  if (icon === 'calendar') return '▢'
  if (icon === 'user') return '◉'
  if (icon === 'shield') return '◈'
  return '•'
}

function SidebarPanel({
  location,
  isCollapsed,
  onToggleCollapse,
  mobileDrawer,
  onCloseMobile,
  displayName,
  email,
  navId,
  navItems,
}) {
  const showLabels = mobileDrawer || !isCollapsed
  const [groupOpenOverride, setGroupOpenOverride] = useState({})

  /** @param {import('../data/types.js').NavItem} item */
  function isGroupOpen(item) {
    if (!item.children?.length) return false
    if (Object.prototype.hasOwnProperty.call(groupOpenOverride, item.key)) {
      return groupOpenOverride[item.key]
    }
    return navGroupChildActive(item, location.pathname)
  }

  /** @param {import('../data/types.js').NavItem} item */
  function toggleGroup(item) {
    setGroupOpenOverride((prev) => {
      const prevOpen =
        Object.prototype.hasOwnProperty.call(prev, item.key) ? prev[item.key] : navGroupChildActive(item, location.pathname)
      return { ...prev, [item.key]: !prevOpen }
    })
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]">
            <span className="font-semibold">N</span>
          </div>
          {showLabels ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-h">Neon_Access</p>
              <p className="truncate text-xs text-text">Product Dashboard</p>
            </div>
          ) : null}
        </div>

        {mobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl text-text-h hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:hover:bg-white/5"
            aria-label="Cerrar menú"
          >
            <span className="text-lg">✕</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-h hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40 dark:hover:bg-white/5"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <span className="text-lg">{isCollapsed ? '»' : '«'}</span>
          </button>
        )}
      </div>

      <nav id={navId} className="mt-6 flex flex-col gap-1" aria-label="Principal">
        {navItems.map((item) => {
          if (item.children?.length) {
            const firstTo = item.children[0].to
            const groupActive = navGroupChildActive(item, location.pathname)

            if (!showLabels) {
              return (
                <NavLink
                  key={item.key}
                  to={firstTo}
                  onClick={mobileDrawer ? onCloseMobile : undefined}
                  className={() =>
                    [
                      'group flex items-center justify-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition lg:py-2',
                      groupActive
                        ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                        : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                    ].join(' ')
                  }
                  title={item.label}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                    <NavGlyph icon={item.icon} />
                  </span>
                </NavLink>
              )
            }

            const open = isGroupOpen(item)
            return (
              <div key={item.key} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(item)}
                  aria-expanded={open}
                  className={[
                    'group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition lg:py-2',
                    groupActive && !open ? 'text-text-h ring-1 ring-[color:var(--accent-border)]/60' : '',
                    'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                    <NavGlyph icon={item.icon} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-xs text-text-h/70" aria-hidden>
                    {open ? '▾' : '▸'}
                  </span>
                </button>
                {open ? (
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.key}
                        to={child.to}
                        onClick={mobileDrawer ? onCloseMobile : undefined}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                            isActive || childPathActive(child, location.pathname)
                              ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                              : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                          ].join(' ')
                        }
                      >
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          }

          const to = item.to ?? '/dashboard'
          return (
            <NavLink
              key={item.key}
              to={to}
              end={to === '/dashboard'}
              onClick={mobileDrawer ? onCloseMobile : undefined}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition lg:py-2',
                  isActive || (item.key === 'habits' && location.pathname.startsWith('/dashboard/habits'))
                    ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                    : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                ].join(' ')
              }
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                <NavGlyph icon={item.icon} />
              </span>
              {showLabels ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div className={`flex items-center gap-3 rounded-2xl border border-border bg-bg/80 p-3 ${showLabels ? '' : 'justify-center'}`}>
          <Avatar name={displayName} size="sm" />
          {showLabels ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-h">{displayName}</p>
              {email ? <p className="truncate text-xs text-text">{email}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, roles } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const navItems = useMemo(() => {
    const isAdmin = Array.isArray(roles) && roles.includes('ADMIN')
    return dashboardNav.filter((item) => !item.requiresAdmin || isAdmin)
  }, [roles])

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

              <div className="flex flex-wrap items-center gap-3 pl-[3.25rem] lg:pl-0">
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
