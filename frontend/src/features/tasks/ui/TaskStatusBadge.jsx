import { getStatusMeta } from '../domain/taskStatus.js'

const TONE_CLASSES = {
  neutral: 'bg-bg/80 text-text ring-border',
  info:    'bg-[color:var(--accent-bg)] text-[color:var(--accent)] ring-[color:var(--accent-border)]',
  warning: 'bg-[color:var(--warning-bg,oklch(0.95_0.05_80))] text-[color:var(--warning)] ring-[color:var(--warning)]',
  danger:  'bg-[color:var(--danger-bg,oklch(0.95_0.04_25))] text-danger ring-danger/30',
  success: 'bg-[color:var(--success-bg,oklch(0.95_0.05_150))] text-[color:var(--success,oklch(0.55_0.15_150))] ring-[color:var(--success,oklch(0.55_0.15_150))]/30',
}

/**
 * @param {{ status: string, className?: string }} props
 */
export default function TaskStatusBadge({ status, className = '' }) {
  const meta = getStatusMeta(status)
  const toneClass = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.neutral
  return (
    <span
      className={[
        'inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-medium ring-1',
        toneClass,
        className,
      ].join(' ')}
    >
      {meta.label}
    </span>
  )
}
