export default function Button({ as = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  const Comp = as
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-accent text-white shadow-soft hover:brightness-110',
    secondary: 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)] hover:bg-[color:var(--accent-bg)]/80',
    ghost: 'text-text-h hover:bg-black/5 dark:hover:bg-white/5',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }

  return (
    <Comp className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`} {...props} />
  )
}

