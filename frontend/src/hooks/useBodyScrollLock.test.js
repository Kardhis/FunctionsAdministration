import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBodyScrollLock } from './useBodyScrollLock.js'

describe('useBodyScrollLock', () => {
  let originalOverflow

  beforeEach(() => {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.style.overflow = originalOverflow
  })

  it('locks body scroll when locked is true', () => {
    renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not lock when locked is false', () => {
    renderHook(() => useBodyScrollLock(false))
    expect(document.body.style.overflow).toBe('')
  })

  it('restores previous overflow on unmount', () => {
    document.body.style.overflow = 'auto'
    const { unmount } = renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })
})
