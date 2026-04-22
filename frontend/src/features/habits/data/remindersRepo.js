import { openHabitsDB } from './habitsDb.js'

export async function listReminders() {
  const db = await openHabitsDB()
  return db.getAll('reminders')
}

export async function putReminder(reminder) {
  const db = await openHabitsDB()
  await db.put('reminders', reminder)
  return reminder
}
