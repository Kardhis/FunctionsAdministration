import Badge from '../Badge.jsx'

export default function DashboardCard({ title, value, subtitle, delta, icon, tone = 'neutral', className = '', children }) {
  return (
    <section className={`ui-card ui-hover p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-text">{title}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold leading-none text-text-h tabular-nums">{value}</p>
            {delta ? (
              <Badge tone={tone}>
                {typeof delta === 'number' ? (
                  <>
                    {delta >= 0 ? '+' : ''}
                    {delta}%
                  </>
                ) : (
                  delta
                )}
              </Badge>
            ) : null}
          </div>
          {subtitle ? <p className="mt-2 text-xs text-muted">{subtitle}</p> : null}
        </div>
        {icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]">
            <span className="text-lg">{icon}</span>
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}

