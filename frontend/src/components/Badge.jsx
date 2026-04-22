export default function Badge({ tone = 'neutral', className = '', children, ...props }) {
  const tones = {
    neutral: 'bg-black/5 text-text-h ring-1 ring-border dark:bg-white/5',
    accent: 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]',
    warning: 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-200',
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

