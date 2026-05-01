import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import Badge from '../../components/Badge.jsx'
import { SectionHeader } from '../../components/Section.jsx'
import DashboardCard from '../../components/ui/DashboardCard.jsx'
import {
  dashboardMetrics,
  dashboardModules,
  dashboardQuickActions,
  dashboardRecentActivity,
} from '../../data/dashboardMock.js'
import { Link } from 'react-router-dom'

function formatRelative(iso) {
  const t = new Date(iso).getTime()
  const d = Date.now() - t
  const m = Math.round(d / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `Hace ${h} h`
  const days = Math.round(h / 24)
  return `Hace ${days} d`
}

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((m) => (
          <DashboardCard
            key={m.key}
            title={m.label}
            value={m.value}
            delta={m.delta ? `${m.delta.value >= 0 ? '+' : ''}${m.delta.value}% ${m.delta.period === 'week' ? 'sem' : 'mes'}` : null}
            tone="neutral"
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="p-5">
            <SectionHeader
              title="Módulos"
              subtitle="Accede a las áreas principales del producto."
              right={
                <Badge tone="accent" className="hidden sm:inline-flex">
                  SaaS-ready
                </Badge>
              }
            />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {dashboardModules.map((mod) => (
                <Link key={mod.key} to={mod.primaryCta.to} className="group">
                  <div className="ui-hover h-full rounded-2xl border border-border bg-[color:var(--surface-2)] p-5 shadow-soft hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] hover:shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-text-h">{mod.title}</p>
                        <p className="mt-1 text-sm text-text">{mod.description}</p>
                      </div>
                      {mod.statusBadge ? (
                        <Badge tone={mod.statusBadge === 'beta' ? 'warning' : 'accent'}>{mod.statusBadge}</Badge>
                      ) : null}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-h">
                      <span className="group-hover:underline">{mod.primaryCta.label}</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Acciones rápidas" subtitle="Atajos pensados para el uso diario." />
            <div className="mt-4 flex flex-wrap gap-3">
              {dashboardQuickActions.map((a) => (
                <Button
                  key={a.key}
                  as={Link}
                  to={a.to}
                  variant={a.variant === 'primary' ? 'primary' : 'secondary'}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeader title="Actividad reciente" subtitle="Últimos eventos de tu cuenta." />
            <div className="mt-4 space-y-3">
              {dashboardRecentActivity.map((evt) => (
                <div key={evt.id} className="flex gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-text-h ring-1 ring-border">
                    {evt.type === 'login' ? '⎆' : null}
                    {evt.type === 'habit_completed' ? '✓' : null}
                    {evt.type === 'habit_created' ? '+' : null}
                    {evt.type === 'note_added' ? '✎' : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-h">{evt.title}</p>
                    <p className="mt-0.5 text-xs text-text">{formatRelative(evt.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Siguiente paso" subtitle="Pequeña guía para hoy." />
            <div className="mt-4 rounded-2xl border border-border bg-[color:var(--surface-2)] p-4">
              <p className="text-sm text-text">
                Si quieres maximizar consistencia, empieza con un hábito pequeño y registrable en menos de 2 minutos.
              </p>
              <div className="mt-4">
                <Button as={Link} to="/dashboard/habits/manage" variant="primary">
                  Crear hábito
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

