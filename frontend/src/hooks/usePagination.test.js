import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from './usePagination.js'

const items = Array.from({ length: 25 }, (_, i) => `item-${i + 1}`)

describe('usePagination', () => {
  it('returns first page items with default page size', () => {
    const { result } = renderHook(() => usePagination(items))
    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.pageItems).toHaveLength(10)
    expect(result.current.pageItems[0]).toBe('item-1')
  })

  it('navigates to next and previous pages', () => {
    const { result } = renderHook(() => usePagination(items, 10))
    act(() => result.current.next())
    expect(result.current.page).toBe(2)
    expect(result.current.hasPrev).toBe(true)
    act(() => result.current.prev())
    expect(result.current.page).toBe(1)
    expect(result.current.hasNext).toBe(true)
  })

  it('clamps page when items shrink', () => {
    const { result, rerender } = renderHook(({ data }) => usePagination(data, 10), {
      initialProps: { data: items },
    })
    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)
    rerender({ data: items.slice(0, 5) })
    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(1)
  })
})
