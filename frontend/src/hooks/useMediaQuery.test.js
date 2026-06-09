import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsLgUp, useMediaQuery } from './useMediaQuery.js'

function createMatchMedia(matches) {
  const listeners = new Set()
  return {
    matches,
    addEventListener: (_event, cb) => listeners.add(cb),
    removeEventListener: (_event, cb) => listeners.delete(cb),
    trigger(next) {
      this.matches = next
      listeners.forEach((cb) => cb())
    },
  }
}

describe('useMediaQuery', () => {
  let mq

  beforeEach(() => {
    mq = createMatchMedia(false)
    vi.stubGlobal('matchMedia', vi.fn(() => mq))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns initial match state', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.current).toBe(false)
  })

  it('updates when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'))
    act(() => mq.trigger(true))
    expect(result.current).toBe(true)
  })
})

describe('useIsLgUp', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => createMatchMedia(true)))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses lg breakpoint query', () => {
    const { result } = renderHook(() => useIsLgUp())
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
  })
})
