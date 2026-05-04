export default function Button({ as = 'button', variant = 'primary', size = 'md', className = '', ...props }) {
  const Comp = as
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium text-text-h transition-[background,transform,box-shadow,border-color,color,opacity] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-60'

  const variants = {
    primary:
      'bg-[color:var(--accent)] text-[#061018] shadow-card hover:brightness-110 active:brightness-95',
    secondary:
      'bg-[color:var(--accent-bg)] ring-1 ring-[color:var(--accent-border)] hover:bg-[color:var(--accent-bg)]/80',
    outline:
      'bg-transparent ring-1 ring-border hover:bg-white/5',
    ghost:
      'bg-transparent text-text-h hover:bg-white/5',
    danger:
      'bg-[color:var(--danger)] text-[#17040a] shadow-card hover:brightness-110 active:brightness-95',
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

