import { useEffect } from 'react'

/**
 * Locks body scroll while `locked` is true and restores the previous
 * overflow value on cleanup. Safe to nest — restores independently.
 *
 * @param {boolean} locked
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}
