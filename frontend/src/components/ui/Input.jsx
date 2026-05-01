export default function Input({
  as = 'input',
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  ...props
}) {
  const Comp = as

  return (
    <label className={`block ${containerClassName}`}>
      {label ? <span className="text-sm font-medium text-text-h">{label}</span> : null}
      <Comp className={`ui-input mt-2 ${className}`} aria-invalid={Boolean(error) || undefined} {...props} />
      {error ? <p className="mt-1 text-xs text-[color:var(--danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </label>
  )
}

