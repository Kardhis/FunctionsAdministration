export default function Badge({ tone = 'neutral', className = '', children, ...props }) {
  const tones = {
    neutral: 'bg-white/5 text-text-h ring-1 ring-border',
    accent: 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]',
    warning: 'bg-[color:color-mix(in srgb, var(--warning) 18%, transparent)] text-[color:var(--warning)] ring-1 ring-[color:color-mix(in srgb, var(--warning) 35%, transparent)]',
    success: 'bg-[color:color-mix(in srgb, var(--success) 18%, transparent)] text-[color:var(--success)] ring-1 ring-[color:color-mix(in srgb, var(--success) 35%, transparent)]',
    danger: 'bg-[color:color-mix(in srgb, var(--danger) 18%, transparent)] text-[color:var(--danger)] ring-1 ring-[color:color-mix(in srgb, var(--danger) 35%, transparent)]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone] ?? tones.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

