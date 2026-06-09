import { describe, expect, it } from 'vitest'
import { dashboardNav, filterDashboardNavByRole } from './dashboardMock.js'

describe('filterDashboardNavByRole', () => {
  it('shows admin-only items for admin users', () => {
    const items = filterDashboardNavByRole(dashboardNav, true)
    expect(items.some((i) => i.key === 'overview')).toBe(true)
    expect(items.some((i) => i.key === 'admin')).toBe(true)
  })

  it('hides admin-only items for regular users', () => {
    const items = filterDashboardNavByRole(dashboardNav, false)
    expect(items.some((i) => i.key === 'overview')).toBe(false)
    expect(items.some((i) => i.key === 'admin')).toBe(false)
    const habits = items.find((i) => i.key === 'habits')
    expect(habits?.children?.some((c) => c.key === 'habits-week')).toBe(false)
  })

  it('keeps habits and tasks navigation for all users', () => {
    const items = filterDashboardNavByRole(dashboardNav, false)
    expect(items.some((i) => i.key === 'habits')).toBe(true)
    expect(items.some((i) => i.key === 'tasks')).toBe(true)
  })
})
