import { openDB } from 'idb'

export const HABITS_DB_NAME = 'neon_access_habits'
export const HABITS_DB_VERSION = 1

export async function openHabitsDB() {
  return openDB(HABITS_DB_NAME, HABITS_DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('entries')) {
        const store = db.createObjectStore('entries', { keyPath: 'id' })
        store.createIndex('by_date', 'date')
        store.createIndex('by_habit', 'habitId')
        store.createIndex('by_habit_date', ['habitId', 'date'])
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders', { keyPath: 'id' })
      }
    },
  })
}
