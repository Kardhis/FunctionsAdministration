import { getSetting, setSetting } from '../features/habits/data/settingsRepo.js'

const THEME_STORAGE_KEY = 'app_theme'

export function resolveEffectiveTheme(theme) {
  const t = String(theme || '').toLowerCase()
  if (t === 'light' || t === 'dark') return t
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  return prefersDark ? 'dark' : 'light'
}

export function readThemeFromStorage() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function writeThemeToStorage(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, String(theme))
  } catch {
    // ignore
  }
}

export function applyThemeToRoot(theme) {
  const effective = resolveEffectiveTheme(theme)
  const root = document.documentElement
  root.dataset.theme = effective
  root.style.colorScheme = effective
  return effective
}

export async function loadThemeSetting() {
  const stored = readThemeFromStorage()
  if (stored) return stored
  return await getSetting('theme', 'system')
}

export async function saveThemeSetting(theme) {
  writeThemeToStorage(theme)
  try {
    return await setSetting('theme', theme)
  } catch {
    // If API is not available (e.g., pre-login), storage still persists.
    return theme
  }
}

