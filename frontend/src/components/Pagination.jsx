/**
 * Accessible pagination bar.
 * Works at any viewport width: buttons wrap on small screens.
 *
 * @param {{
 *   page: number,
 *   totalPages: number,
 *   totalItems: number,
 *   pageSize: number,
 *   hasPrev: boolean,
 *   hasNext: boolean,
 *   onPrev: () => void,
 *   onNext: () => void,
 *   onPage: (n: number) => void,
 *   className?: string,
 * }} props
 */
export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onPage,
  className = '',
}) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  const pages = buildPageRange(page, totalPages)

  return (
    <nav
      aria-label="Paginació"
      className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-sm ${className}`}
    >
      <p className="text-text" aria-live="polite">
        {from}–{to} de {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <PaginationButton onClick={onPrev} disabled={!hasPrev} aria-label="Pàgina anterior">
          ‹
        </PaginationButton>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-text" aria-hidden>
              …
            </span>
          ) : (
            <PaginationButton
              key={p}
              onClick={() => onPage(p)}
              active={p === page}
              aria-label={`Pàgina ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </PaginationButton>
          ),
        )}

        <PaginationButton onClick={onNext} disabled={!hasNext} aria-label="Pàgina següent">
          ›
        </PaginationButton>
      </div>
    </nav>
  )
}

function PaginationButton({ onClick, disabled = false, active = false, children, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl px-2 text-sm font-medium transition-[background,opacity] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'bg-[color:var(--accent-bg)] text-text-h ring-1 ring-[color:var(--accent-border)]'
          : 'text-text-h hover:bg-black/5 dark:hover:bg-white/5',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * Build a compact page range with ellipsis.
 * Always shows first, last, current ±1 and neighbours.
 *
 * @param {number} current
 * @param {number} total
 * @returns {(number|'…')[]}
 */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const show = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...show].sort((a, b) => a - b)

  const result = []
  let prev = null
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}
