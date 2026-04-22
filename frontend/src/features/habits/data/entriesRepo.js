import { openHabitsDB } from './habitsDb.js'

export async function listEntries() {
  const db = await openHabitsDB()
  return db.getAll('entries')
}

export async function listEntriesByDateRange({ fromDate, toDate }) {
  const db = await openHabitsDB()
  const idx = db.transaction('entries').store.index('by_date')
  const range = IDBKeyRange.bound(fromDate, toDate)
  return idx.getAll(range)
}

export async function putEntry(entry) {
  const db = await openHabitsDB()
  await db.put('entries', entry)
  return entry
}

export async function deleteEntry(id) {
  const db = await openHabitsDB()
  await db.delete('entries', id)
}

export async function clearEntries() {
  const db = await openHabitsDB()
  const tx = db.transaction('entries', 'readwrite')
  await tx.store.clear()
  await tx.done
}
