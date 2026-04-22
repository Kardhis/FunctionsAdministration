import { openHabitsDB } from './habitsDb.js'

export async function getSetting(key, fallback = null) {
  const db = await openHabitsDB()
  const row = await db.get('settings', key)
  return row?.value ?? fallback
}

export async function setSetting(key, value) {
  const db = await openHabitsDB()
  await db.put('settings', { key, value })
  return value
}
