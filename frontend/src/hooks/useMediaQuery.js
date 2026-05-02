import { useEffect, useState } from 'react'

/**
 * Subscribes to a CSS media query (e.g. `(min-width: 1024px)` for Tailwind `lg`).
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Desktop breakpoint aligned with Tailwind `lg` (1024px). */
export function useIsLgUp() {
  return useMediaQuery('(min-width: 1024px)')
}
