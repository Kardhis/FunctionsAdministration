/**
 * Consistent wrapper for desktop data tables.
 * Provides horizontal scroll, controlled scrollbar, border and rounding.
 *
 * Usage:
 *   <TableScrollWrapper>
 *     <table className="w-full min-w-[640px] ...">...</table>
 *   </TableScrollWrapper>
 *
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export default function TableScrollWrapper({ children, className = '' }) {
  return (
    <div
      className={[
        'mt-4 hidden overflow-x-auto rounded-2xl border border-border',
        '[-ms-overflow-style:none] [scrollbar-width:thin]',
        '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
        'lg:block',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
