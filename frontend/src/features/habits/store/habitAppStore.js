import { create } from 'zustand'
import { zodResolver } from '@hookform/resolvers/zod'
import { listEntries, putEntry, deleteEntry as deleteEntryDb } from '../data/entriesRepo.js'
import { deleteHabit as deleteHabitDb, listHabits, putHabit } from '../data/habitsRepo.js'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../data/categoriesRepo.js'
import { getSetting, setSetting } from '../data/settingsRepo.js'
import { applyThemeToRoot, saveThemeSetting } from '../../../theme/theme.js'
import { computeDurationMinutes, toIsoNow } from '../domain/time.js'
import { habitCreateSchema, habitEntryCreateSchema, habitEntrySchema, habitEntryUpdateSchema, habitSchema, habitUpdateSchema } from '../domain/schemas.js'
import { findOverlappingEntries } from '../domain/overlap.js'

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function withToastMeta(toast) {
  return {
    id: newId(),
    createdAt: Date.now(),
    ...toast,
  }
}

function pushLimited(toasts, toast) {
  const next = [...toasts, withToastMeta(toast)]
  return next.slice(-3)
}

export const useHabitAppStore = create((set, get) => ({
  bootstrapped: false,
  loading: false,
  error: '',
  toasts: [],

  habits: [],
  entries: [],
  categories: [],

  settings: {
    enforceNoOverlap: false,
    theme: 'system', // system|light|dark
  },

  async bootstrap() {
    if (get().bootstrapped) return
    set({ loading: true, error: '' })
    try {
      const [habits, entries, categories, enforceNoOverlap, theme] = await Promise.all([
        listHabits(),
        listEntries(),
        listCategories(),
        getSetting('enforceNoOverlap', false),
        getSetting('theme', 'system'),
      ])
      set({
        habits,
        entries,
        categories,
        settings: { enforceNoOverlap: Boolean(enforceNoOverlap), theme: String(theme) },
        bootstrapped: true,
        loading: false,
      })
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : String(e),
        toasts: pushLimited(get().toasts, { kind: 'error', message: 'No se pudo inicializar el módulo de hábitos.' }),
      })
    }
  },

  dismissToast(index) {
    set({ toasts: get().toasts.filter((_, i) => i !== index) })
  },

  async setEnforceNoOverlap(value) {
    await setSetting('enforceNoOverlap', Boolean(value))
    set({ settings: { ...get().settings, enforceNoOverlap: Boolean(value) } })
  },

  async setTheme(theme) {
    applyThemeToRoot(theme)
    await saveThemeSetting(theme)
    set({ settings: { ...get().settings, theme } })
  },

  async createHabit(input) {
    const parsed = habitCreateSchema.safeParse({
      ...input,
      active: input.active ?? true,
    })
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Datos inválidos'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    const now = toIsoNow()
    const habit = habitSchema.parse({
      id: newId(),
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    })

    await putHabit(habit)
    set({ habits: await listHabits(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Hábito creado.' }) })
    return { ok: true, habit }
  },

  async refreshHabits() {
    set({ habits: await listHabits() })
  },

  async refreshCategories() {
    set({ categories: await listCategories() })
  },

  async createCategory(input) {
    const id = newId()
    const now = toIsoNow()
    const payload = {
      id,
      name: String(input?.name ?? '').trim(),
      active: Boolean(input?.active ?? true),
      createdAt: now,
      updatedAt: now,
    }
    await createCategory(payload)
    set({ categories: await listCategories(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Categoría creada.' }) })
    return { ok: true, category: payload }
  },

  async updateCategory(patch) {
    if (!patch?.id) return { ok: false, error: 'ID requerido' }
    const payload = { name: patch.name, active: patch.active }
    await updateCategory(patch.id, payload)
    set({ categories: await listCategories(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Categoría actualizada.' }) })
    return { ok: true }
  },

  async toggleCategoryActive(id) {
    const prev = get().categories.find((c) => c.id === id)
    if (!prev) return { ok: false, error: 'Categoría no encontrada' }
    return get().updateCategory({ id, active: !prev.active })
  },

  async deleteCategory(id) {
    await deleteCategory(id)
    set({ categories: await listCategories(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Categoría eliminada.' }) })
    return { ok: true }
  },

  async updateHabit(patch) {
    const parsed = habitUpdateSchema.safeParse(patch)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Datos inválidos'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    const prev = (await listHabits()).find((h) => h.id === parsed.data.id)
    if (!prev) {
      const msg = 'Hábito no encontrado'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    const next = habitSchema.parse({
      ...prev,
      ...parsed.data,
      updatedAt: toIsoNow(),
    })

    await putHabit(next)
    set({ habits: await listHabits(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Hábito actualizado.' }) })
    return { ok: true, habit: next }
  },

  async setHabitActive(id, active) {
    return get().updateHabit({ id, active })
  },

  async deleteHabit(id) {
    await deleteHabitDb(id)
    // entries remain; product decision: keep history OR cascade delete. For MVP keep history but hide in UI by habit filter.
    set({ habits: await listHabits(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Hábito eliminado.' }) })
    return { ok: true }
  },

  async createEntry(input) {
    const durationMinutes = computeDurationMinutes({
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
    })

    const parsed = habitEntryCreateSchema.safeParse({
      ...input,
      notes: input.notes ?? null,
    })
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Datos inválidos'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    if (get().settings.enforceNoOverlap) {
      const overlaps = findOverlappingEntries({
        candidate: parsed.data,
        entries: get().entries,
        ignoreId: undefined,
      })
      if (overlaps.length) {
        const msg = 'Solape detectado con otro registro el mismo día.'
        set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
        return { ok: false, error: msg }
      }
    }

    const now = toIsoNow()
    const entry = habitEntrySchema.parse({
      id: newId(),
      ...parsed.data,
      durationMinutes,
      notes: parsed.data.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })

    await putEntry(entry)
    set({ entries: await listEntries(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Registro creado.' }) })
    return { ok: true, entry }
  },

  async updateEntry(patch) {
    const parsed = habitEntryUpdateSchema.safeParse(patch)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Datos inválidos'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    const prev = (await listEntries()).find((e) => e.id === parsed.data.id)
    if (!prev) {
      const msg = 'Registro no encontrado'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    const merged = { ...prev, ...parsed.data }
    const durationMinutes = computeDurationMinutes({
      date: merged.date,
      startTime: merged.startTime,
      endTime: merged.endTime,
    })

    const candidate = { date: merged.date, startTime: merged.startTime, endTime: merged.endTime, habitId: merged.habitId }
    const parsedFull = habitEntryCreateSchema.safeParse({
      habitId: candidate.habitId,
      date: candidate.date,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      notes: merged.notes ?? null,
    })
    if (!parsedFull.success) {
      const msg = parsedFull.error.issues[0]?.message ?? 'Datos inválidos'
      set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
      return { ok: false, error: msg }
    }

    if (get().settings.enforceNoOverlap) {
      const overlaps = findOverlappingEntries({
        candidate: parsedFull.data,
        entries: get().entries,
        ignoreId: merged.id,
      })
      if (overlaps.length) {
        const msg = 'Solape detectado con otro registro el mismo día.'
        set({ toasts: pushLimited(get().toasts, { kind: 'error', message: msg }) })
        return { ok: false, error: msg }
      }
    }

    const next = habitEntrySchema.parse({
      ...merged,
      durationMinutes,
      updatedAt: toIsoNow(),
    })

    await putEntry(next)
    set({ entries: await listEntries(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Registro actualizado.' }) })
    return { ok: true, entry: next }
  },

  async deleteEntry(id) {
    await deleteEntryDb(id)
    set({ entries: await listEntries(), toasts: pushLimited(get().toasts, { kind: 'success', message: 'Registro eliminado.' }) })
    return { ok: true }
  },
}))

// Useful for RHF integration in components
export const habitCreateResolver = zodResolver(habitCreateSchema)
export const habitEntryCreateResolver = zodResolver(habitEntryCreateSchema)
