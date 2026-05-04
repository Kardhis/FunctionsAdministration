/**
 * V1 shapes (mock-friendly). Keep simple to swap to API later.
 */

/**
 * @typedef {{ id: string, name?: string, email?: string, avatarUrl?: string, plan?: 'free'|'pro' }} User
 */

/**
 * @typedef {{ key: string, label: string, value: number|string, delta?: { value: number, period: 'week'|'month' } }} Metric
 */

/**
 * @typedef {{ key: string, label: string, to: string }} NavChildItem
 */

/**
 * @typedef {{ key: string, label: string, to?: string, icon: string, requiresAdmin?: boolean, children?: NavChildItem[] }} NavItem
 */

/**
 * @typedef {{ key: 'overview'|'habits'|'daily'|'stats'|'calendar'|'profile', title: string, description: string, statusBadge?: 'new'|'beta'|'comingSoon', primaryCta: { label: string, to: string } }} Module
 */

/**
 * @typedef {{ key: string, label: string, to: string, variant?: 'primary'|'secondary' }} QuickAction
 */

/**
 * @typedef {{ id: string, type: 'habit_completed'|'habit_created'|'login'|'note_added', title: string, timestamp: string, meta?: Record<string, string|number> }} ActivityEvent
 */

export {}

