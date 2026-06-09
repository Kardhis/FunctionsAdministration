import { describe, expect, it } from 'vitest'
import { isAdmin } from './roles.js'

describe('isAdmin', () => {
  it('returns true when roles include ADMIN', () => {
    expect(isAdmin(['USER', 'ADMIN'])).toBe(true)
  })

  it('returns false when roles omit ADMIN', () => {
    expect(isAdmin(['USER'])).toBe(false)
  })

  it('returns false for non-array input', () => {
    expect(isAdmin(null)).toBe(false)
    expect(isAdmin('ADMIN')).toBe(false)
    expect(isAdmin(undefined)).toBe(false)
  })
})
