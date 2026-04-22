import { addDays, format } from 'date-fns'
import { clearHabits, listHabits, putHabit } from '../data/habitsRepo.js'
import { clearEntries, listEntries, putEntry } from '../data/entriesRepo.js'
import { toIsoNow, todayLocalDateString } from '../domain/time.js'

function id() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export async function seedHabitAppIfEmpty() {
  const [habits, entries] = await Promise.all([listHabits(), listEntries()])
  if (habits.length && entries.length) return { seeded: false, habits: habits.length, entries: entries.length }

  await clearHabits()
  await clearEntries()

  const now = new Date()
  const today = todayLocalDateString(now)

  const h1 = {
    id: id(),
    name: 'Leer',
    description: 'Lectura profunda o ligera, pero sin pantallas.',
    color: '#7c3aed',
    icon: '📚',
    category: 'estudio',
    active: true,
    targetType: 'minutes_per_day',
    targetValue: 30,
    targetPeriod: 'day',
    createdAt: toIsoNow(),
    updatedAt: toIsoNow(),
  }

  const h2 = {
    id: id(),
    name: 'Caminar',
    description: 'Movimiento suave, ideal para consistencia.',
    color: '#22c55e',
    icon: '🚶',
    category: 'salud',
    active: true,
    targetType: 'sessions_per_week',
    targetValue: 5,
    targetPeriod: 'week',
    createdAt: toIsoNow(),
    updatedAt: toIsoNow(),
  }

  const h3 = {
    id: id(),
    name: 'Deep work',
    description: 'Bloques enfocados sin interrupciones.',
    color: '#0ea5e9',
    icon: '🧠',
    category: 'trabajo',
    active: true,
    targetType: 'hours_per_month',
    targetValue: 10,
    targetPeriod: 'month',
    createdAt: toIsoNow(),
    updatedAt: toIsoNow(),
  }

  const h4 = {
    id: id(),
    name: 'Guitarra',
    description: 'Práctica deliberada (escalas + repertorio).',
    color: '#f97316',
    icon: '🎸',
    category: 'ocio',
    active: false,
    targetType: 'minutes_per_day',
    targetValue: 20,
    targetPeriod: 'day',
    createdAt: toIsoNow(),
    updatedAt: toIsoNow(),
  }

  await Promise.all([putHabit(h1), putHabit(h2), putHabit(h3), putHabit(h4)])

  // Deterministic-ish seed entries for last 21 days
  const seededLoopHabits = [h1, h2, h3]
  let slot = 8 * 60 // minutes from midnight
  for (let d = 20; d >= 0; d -= 1) {
    const day = format(addDays(now, -d), 'yyyy-MM-dd')
    for (const h of seededLoopHabits) {
      // skip some days randomly-ish but deterministic
      const skip = (d + h.name.length) % 5 === 0
      if (skip) continue

      const startH = Math.floor(slot / 60)
      const startM = slot % 60
      const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`
      const endSlot = slot + 35
      const endH = Math.floor(endSlot / 60)
      const endM = endSlot % 60
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

      const entry = {
        id: id(),
        habitId: h.id,
        date: day,
        startTime,
        endTime,
        durationMinutes: 35,
        notes: day === today ? 'Buen arranque del día.' : null,
        createdAt: toIsoNow(),
        updatedAt: toIsoNow(),
      }
      await putEntry(entry)

      slot += 40
      if (slot > 21 * 60) slot = 8 * 60
    }
  }

  const finalEntries = await listEntries()
  const finalHabits = await listHabits()
  return { seeded: true, habits: finalHabits.length, entries: finalEntries.length }
}
