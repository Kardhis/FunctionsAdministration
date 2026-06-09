import { describe, expect, it, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server.js'
import {
  applyThemeToRoot,
  loadThemeSetting,
  readThemeFromStorage,
  resolveEffectiveTheme,
  saveThemeSetting,
  writeThemeToStorage,
} from './theme.js'

const API = 'http://localhost:8080'

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('resolveEffectiveTheme returns light or dark', () => {
    expect(resolveEffectiveTheme('light')).toBe('light')
    expect(resolveEffectiveTheme('dark')).toBe('dark')
    expect(['light', 'dark']).toContain(resolveEffectiveTheme('system'))
  })

  it('readThemeFromStorage and writeThemeToStorage round-trip', () => {
    writeThemeToStorage('dark')
    expect(readThemeFromStorage()).toBe('dark')
  })

  it('applyThemeToRoot sets dataset and colorScheme', () => {
    const effective = applyThemeToRoot('dark')
    expect(effective).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('loadThemeSetting prefers local storage', async () => {
    writeThemeToStorage('light')
    const theme = await loadThemeSetting()
    expect(theme).toBe('light')
  })

  it('loadThemeSetting falls back to API setting', async () => {
    server.use(
      http.get(`${API}/api/settings/theme`, () => HttpResponse.json({ value: 'dark' })),
    )
    const theme = await loadThemeSetting()
    expect(theme).toBe('dark')
  })

  it('saveThemeSetting persists locally and calls API', async () => {
    const result = await saveThemeSetting('light')
    expect(result).toBe('light')
    expect(readThemeFromStorage()).toBe('light')
  })

  it('readThemeFromStorage returns null when storage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readThemeFromStorage()).toBeNull()
    spy.mockRestore()
  })

  it('writeThemeToStorage ignores storage errors', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => writeThemeToStorage('light')).not.toThrow()
    spy.mockRestore()
  })
})
