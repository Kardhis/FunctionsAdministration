import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useHabitAppStore } from '../store/habitAppStore.js'
import Button from '../../../components/Button.jsx'
import HabitCreateModal from './HabitCreateModal.jsx'
import HabitCreatedMessageModal from './HabitCreatedMessageModal.jsx'
import { applyThemeToRoot, loadThemeSetting } from '../../../theme/theme.js'

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium ring-1 transition lg:py-2',
          isActive ? 'bg-[color:var(--accent-bg)] text-text-h ring-[color:var(--accent-border)]' : 'text-text-h/80 ring-transparent hover:bg-black/5 dark:hover:bg-white/5',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function HabitsAppLayout() {
  const location = useLocation()
  const bootstrap = useHabitAppStore((s) => s.bootstrap)
  const loading = useHabitAppStore((s) => s.loading)
  const error = useHabitAppStore((s) => s.error)
  const toasts = useHabitAppStore((s) => s.toasts)
  const dismissToast = useHabitAppStore((s) => s.dismissToast)
  const createHabit = useHabitAppStore((s) => s.createHabit)
  const refreshHabits = useHabitAppStore((s) => s.refreshHabits)
  const categories = useHabitAppStore((s) => s.categories)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdHabit, setCreatedHabit] = useState(null)
  const toastTimersRef = useRef(new Map())

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

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
    const timers = toastTimersRef.current

    for (const t of toasts) {
      if (!t?.id || typeof t.createdAt !== 'number') continue
      if (timers.has(t.id)) continue

      const remaining = Math.max(0, 4000 - (Date.now() - t.createdAt))
      const timeoutId = window.setTimeout(() => {
        const idx = useHabitAppStore.getState().toasts.findIndex((x) => x?.id === t.id)
        if (idx >= 0) useHabitAppStore.getState().dismissToast(idx)
        timers.delete(t.id)
      }, remaining)
      timers.set(t.id, timeoutId)
    }

    // Cleanup timers for toasts that no longer exist
    for (const [id, timeoutId] of timers.entries()) {
      if (!toasts.some((t) => t?.id === id)) {
        window.clearTimeout(timeoutId)
        timers.delete(id)
      }
    }
  }, [toasts])

  const title = useMemo(() => {
    const seg = location.pathname.split('/').filter(Boolean)
    const last = seg[seg.length - 1]
    const map = {
      overview: 'Dashboard de hábitos',
      objectives: 'Objetivos',
      manage: 'Gestión de hábitos',
      log: 'Registro de hábitos',
      week: 'Vista semanal',
      analytics: 'Analítica de hábitos',
      settings: 'Ajustes del módulo',
    }
    return map[last] ?? 'Hábitos'
  }, [location.pathname])

  const isManageTab = useMemo(() => location.pathname.endsWith('/dashboard/habits/manage'), [location.pathname])
  const sortedCategories = useMemo(
    () => (Array.isArray(categories) ? categories.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))) : []),
    [categories],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text">Módulo</p>
          <h2 className="text-xl font-semibold text-text-h md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-text">MVP con persistencia local (IndexedDB) y capa lista para API Spring Boot.</p>
        </div>

        <div
          className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
          role="navigation"
          aria-label="Secciones del módulo hábitos"
        >
          <TabLink to="/dashboard/habits/overview">Dashboard</TabLink>
          <TabLink to="/dashboard/habits/objectives">Objetivos</TabLink>
          <TabLink to="/dashboard/habits/manage">Hábitos</TabLink>
          <TabLink to="/dashboard/habits/log">Registros</TabLink>
          <TabLink to="/dashboard/habits/week">Semana</TabLink>
          <TabLink to="/dashboard/habits/analytics">Analítica</TabLink>
          <TabLink to="/dashboard/habits/settings">Ajustes</TabLink>
        </div>
      </div>

      {isManageTab ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text">Acciones rápidas para gestionar tus hábitos.</p>
          <Button
            type="button"
            variant="primary"
            className="bg-[color:var(--accent)] text-white ring-1 ring-[color:var(--accent-border)]"
            onClick={() => setIsCreateOpen(true)}
          >
            Nuevo hábito
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Cargando datos locales…</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-[crimson]" role="alert">
          {error}
        </div>
      ) : null}

      {toasts.length ? (
        <div className="fixed bottom-4 right-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
          {toasts.map((t, idx) => (
            <div
              key={t.id ?? `${t.kind}-${idx}`}
              className={[
                'rounded-2xl border px-4 py-3 text-sm shadow-soft backdrop-blur-md',
                t.kind === 'success' ? 'border-border bg-bg/90 text-text-h' : 'border-border bg-bg/90 text-[crimson]',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{t.message}</p>
                <button type="button" className="text-text-h/70 hover:text-text-h" onClick={() => dismissToast(idx)} aria-label="Cerrar">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <HabitCreateModal
        open={isCreateOpen}
        categories={sortedCategories}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async (values) => {
          const res = await createHabit(values)
          if (res?.ok) {
            setIsCreateOpen(false)
            setCreatedHabit(res.habit)
          }
          return res
        }}
      />

      <HabitCreatedMessageModal
        open={Boolean(createdHabit)}
        habit={createdHabit}
        onClose={async () => {
          setCreatedHabit(null)
          await refreshHabits()
        }}
      />

      <Outlet />
    </div>
  )
}
