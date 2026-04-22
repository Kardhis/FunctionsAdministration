import { openHabitsDB } from './habitsDb.js'

export async function listHabits() {
  const db = await openHabitsDB()
  return db.getAll('habits')
}

export async function getHabit(id) {
  const db = await openHabitsDB()
  return db.get('habits', id)
}

export async function putHabit(habit) {
  const db = await openHabitsDB()
  await db.put('habits', habit)
  return habit
}

export async function deleteHabit(id) {
  const db = await openHabitsDB()
  await db.delete('habits', id)
}

export async function clearHabits() {
  const db = await openHabitsDB()
  const tx = db.transaction('habits', 'readwrite')
  await tx.store.clear()
  await tx.done
}
