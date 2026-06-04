import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useTasksStore } from './store/tasksStore.js'

const ROUTE_TITLES = {
  list:        'Totes les tasques',
  today:       'Avui',
  eisenhower:  'Matriu Eisenhower',
  calendar:    'Calendari',
  backlog:     'Backlog',
  manage:      'Gestió de projectes i categories',
}

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:py-2',
          isActive
            ? 'bg-[color:var(--accent-bg)] text-text-h ring-[color:var(--accent-border)]'
            : 'text-text-h/80 ring-transparent hover:bg-black/5 dark:hover:bg-white/5',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function TasksAppLayout() {
  const location = useLocation()
  const { user, status } = useAuth()
  const bootstrap = useTasksStore((s) => s.bootstrap)
  const resetSession = useTasksStore((s) => s.resetSession)
  const bootstrapError = useTasksStore((s) => s.bootstrapError)
  const toasts = useTasksStore((s) => s.toasts)
  const dismissToastById = useTasksStore((s) => s.dismissToastById)
  const prevUserRef = useRef(null)

  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    if (prevUserRef.current !== user) {
      resetSession()
      prevUserRef.current = user
    }
    bootstrap()
  }, [bootstrap, resetSession, user, status])

  const seg = location.pathname.split('/').filter(Boolean)
  const lastSeg = seg[seg.length - 1]
  const pageTitle = ROUTE_TITLES[lastSeg] ?? 'Tasques'

  return (
    <div className="space-y-[var(--space-section-gap)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text">Mòdul</p>
          <h2 className="text-xl font-semibold leading-heading text-text-h md:text-2xl">{pageTitle}</h2>
          <p className="mt-1 hidden text-sm text-text sm:block">
            Captura, classifica, planifica i executa les teves tasques.
          </p>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
          aria-label="Seccions del mòdul de tasques"
        >
          <TabLink to="/dashboard/tasks/list">Tasques</TabLink>
          <TabLink to="/dashboard/tasks/today">Avui</TabLink>
          <TabLink to="/dashboard/tasks/eisenhower">Eisenhower</TabLink>
          <TabLink to="/dashboard/tasks/calendar">Calendari</TabLink>
          <TabLink to="/dashboard/tasks/backlog">Backlog</TabLink>
          <TabLink to="/dashboard/tasks/manage">Gestió</TabLink>
        </nav>
      </div>

      {bootstrapError && (
        <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-danger" role="alert">
          {bootstrapError}
        </div>
      )}

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed right-4 z-[60] flex w-[min(420px,calc(100dvw-2rem))] flex-col gap-2"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
          aria-live="polite"
        >
          {toasts.map((t, idx) => (
            <div
              key={t.id ?? `toast-${idx}`}
              className={[
                'rounded-2xl border px-4 py-3 text-sm backdrop-blur-md',
                t.kind === 'success'
                  ? 'border-border bg-bg/90 text-text-h'
                  : 'border-border bg-bg/90 text-danger',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{t.message}</p>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center text-text-h/70 hover:text-text-h"
                  onClick={() => dismissToastById(t.id)}
                  aria-label="Tancar notificació"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Outlet />
    </div>
  )
}
