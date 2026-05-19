import { useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 10

/**
 * Client-side pagination for a sorted/filtered array.
 * Resets to page 1 when `items` identity changes.
 *
 * @template T
 * @param {T[]} items   - Full sorted/filtered array to paginate.
 * @param {number} [pageSize=10]
 * @returns {{
 *   page: number,
 *   totalPages: number,
 *   pageItems: T[],
 *   setPage: (n: number) => void,
 *   hasPrev: boolean,
 *   hasNext: boolean,
 *   prev: () => void,
 *   next: () => void,
 *   totalItems: number,
 * }}
 */
export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPageRaw] = useState(1)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  function setPage(n) {
    setPageRaw(Math.max(1, Math.min(n, totalPages)))
  }

  return {
    page: safePage,
    totalPages,
    totalItems,
    pageItems,
    setPage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    prev: () => setPage(safePage - 1),
    next: () => setPage(safePage + 1),
  }
}
