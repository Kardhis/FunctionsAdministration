import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const mobileMenuButtonRef = useRef(null)
  const mobileDrawerRef = useRef(null)
  const previousPathRef = useRef(location.pathname)
  const shouldRestoreFocusRef = useRef(false)

  const navItems = useMemo(() => filterDashboardNavByRole(dashboardNav, isAdmin(roles)), [roles])

  const title = useMemo(() => pageTitleFromPath(location.pathname), [location.pathname])
  const displayName = useMemo(() => displayNameFromUser(user), [user])
  const email = useMemo(() => emailFromUser(user), [user])

  function closeMobileNav({ restoreFocus = false } = {}) {
    shouldRestoreFocusRef.current = restoreFocus
    setNavOpen(false)
  }

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
    if (previousPathRef.current === location.pathname) return undefined
    previousPathRef.current = location.pathname

    const timeoutId = window.setTimeout(() => setNavOpen(false), 0)
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  useEffect(() => {
    if (navOpen || !shouldRestoreFocusRef.current) return undefined
    shouldRestoreFocusRef.current = false

    const animationFrameId = window.requestAnimationFrame(() => {
      mobileMenuButtonRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [navOpen])

  useEffect(() => {
    if (!navOpen) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMobileNav({ restoreFocus: true })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navOpen])

  useEffect(() => {
    if (!navOpen) return undefined

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    function handleTabKey(event) {
      if (event.key !== 'Tab') return
      const focusable = Array.from(mobileDrawerRef.current?.querySelectorAll(focusableSelector) ?? []).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      )
      if (!focusable.length) return

      const firstElement = focusable[0]
      const lastElement = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    mobileDrawerRef.current?.querySelector(focusableSelector)?.focus()
    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
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
          onClick={() => {
            closeMobileNav({ restoreFocus: true })
          }}
        />
      ) : null}

      <aside
        ref={mobileDrawerRef}
        className={[
          'fixed left-0 top-0 z-50 flex h-[100svh] w-[min(280px,92vw)] flex-col border-r border-border bg-bg/95 shadow-float backdrop-blur-md transition-transform duration-200 ease-out lg:hidden',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        aria-hidden={!navOpen}
        inert={!navOpen ? '' : undefined}
      >
        <SidebarPanel
          location={location}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          mobileDrawer
          onCloseMobile={() => {
            closeMobileNav({ restoreFocus: true })
          }}
          displayName={displayName}
          email={email}
          navId="dashboard-mobile-nav"
          navItems={navItems}
        />
      </aside>

      <div
        className="relative flex w-full max-w-none gap-4 px-3 py-4 sm:gap-6 sm:px-4 md:px-6 md:py-6 lg:gap-6"
        inert={navOpen ? '' : undefined}
      >
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
          <header className="sticky top-2 z-10 rounded-3xl border border-border bg-bg/80 shadow-soft backdrop-blur-md sm:top-4 lg:top-6">
            <div className="flex items-start justify-between gap-3 p-3 sm:p-5 md:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <button
                  ref={mobileMenuButtonRef}
                  type="button"
                  className="mt-0.5 inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-border bg-bg/80 text-text-h shadow-soft hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-accent/40 lg:hidden dark:hover:bg-white/5"
                  aria-expanded={navOpen}
                  aria-controls="dashboard-mobile-nav"
                  onClick={() => {
                    if (navOpen) {
                      closeMobileNav({ restoreFocus: true })
                    } else {
                      setNavOpen(true)
                    }
                  }}
                >
                  <span className="sr-only">Abrir menú</span>
                  <span className="text-base" aria-hidden>
                    ☰
                  </span>
                </button>
                <div className="min-w-0">
                  <p className="hidden text-xs font-medium uppercase tracking-wide text-text sm:block">{title}</p>
                  <h1 className="truncate text-lg font-semibold leading-tight text-text-h sm:mt-1 sm:text-2xl md:text-3xl">{title}</h1>
                  <p className="mt-1 hidden text-sm text-text sm:block md:mt-2">
                    {greetingForNow()}, <span className="font-medium text-text-h">{displayName}</span>.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
