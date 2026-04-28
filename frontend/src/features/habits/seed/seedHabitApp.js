// Seed deshabilitado: el módulo debe cargar datos solo desde la BD (API).
export async function seedHabitAppIfEmpty() {
  return { seeded: false, habits: 0, entries: 0 }
}
