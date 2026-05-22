import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'

/** @param {{ to: string }} child @param {string} pathname */
function childPathActive(child, pathname) {
  return pathname === child.to || pathname.startsWith(`${child.to}/`)
}

/** @param {import('../data/types.js').NavItem} item @param {string} pathname */
function navGroupChildActive(item, pathname) {
  return Boolean(item.children?.some((c) => childPathActive(c, pathname)))
}

/** @param {{ icon: string }} props */
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

/**
 * @param {{
 *   location: import('react-router-dom').Location
 *   isCollapsed: boolean
 *   onToggleCollapse: () => void
 *   mobileDrawer: boolean
 *   onCloseMobile: (() => void) | undefined
 *   displayName: string
 *   email: string
 *   navId: string | undefined
 *   navItems: import('../data/types.js').NavItem[]
 *   onLogout: () => void
 * }} props
 */
export default function SidebarPanel({
  location,
  isCollapsed,
  onToggleCollapse,
  mobileDrawer,
  onCloseMobile,
  displayName,
  email,
  navId,
  navItems,
  onLogout,
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
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden p-4">
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

      <nav id={navId} className="mt-6 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain" aria-label="Principal">
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
                      'group flex items-center justify-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:py-2',
                      groupActive
                        ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                        : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                    ].join(' ')
                  }
                  title={item.label}
                >
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                    <NavGlyph icon={item.icon} />
                  </span>
                </NavLink>
              )
            }

            const open = isGroupOpen(item)
            const groupMenuId = `nav-submenu-${item.key}`
            return (
              <div key={item.key} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(item)}
                  aria-expanded={open}
                  aria-controls={groupMenuId}
                  className={[
                    'group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:py-2',
                    groupActive && !open ? 'text-text-h ring-1 ring-[color:var(--accent-border)]/60' : '',
                    'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
                    <NavGlyph icon={item.icon} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-xs text-text-h/70" aria-hidden="true">
                    {open ? '▾' : '▸'}
                  </span>
                </button>
                {open ? (
                  <div id={groupMenuId} className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.key}
                        to={child.to}
                        onClick={mobileDrawer ? onCloseMobile : undefined}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:py-2',
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
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] lg:py-2',
                  isActive || (item.key === 'habits' && location.pathname.startsWith('/dashboard/habits'))
                    ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
                    : 'text-text-h/80 hover:bg-black/5 dark:hover:bg-white/5',
                ].join(' ')
              }
            >
              <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/5 text-text-h ring-1 ring-border transition group-hover:bg-black/10 dark:bg-white/5 dark:group-hover:bg-white/10">
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-h">{displayName}</p>
              {email ? <p className="truncate text-xs text-text">{email}</p> : null}
            </div>
          ) : null}
        </div>
        {showLabels ? (
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-3 py-2.5 text-sm font-medium text-text-h/80 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] dark:hover:bg-white/5"
          >
            <span aria-hidden="true">⏻</span>
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className="mt-2 flex w-full items-center justify-center rounded-2xl border border-border py-2.5 text-sm text-text-h/80 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] dark:hover:bg-white/5"
            aria-label="Logout"
          >
            <span aria-hidden="true">⏻</span>
          </button>
        )}
      </div>
    </div>
  )
}
