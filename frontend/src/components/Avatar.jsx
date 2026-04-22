function initialsFrom(nameOrEmail) {
  const s = (nameOrEmail ?? '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function Avatar({ src, name, size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-2xl bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)] ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={name ?? 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold">{initialsFrom(name)}</span>
      )}
    </div>
  )
}

