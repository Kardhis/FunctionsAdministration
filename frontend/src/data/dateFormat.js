export function formatDateEs(dateLike) {
  if (!dateLike) return '—'
  try {
    const raw = String(dateLike)
    const d = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function parseDateEsToIso(input) {
  if (!input) return ''
  const raw = String(input).trim()
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return ''
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  if (!yyyy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return ''
  const iso = `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  // Guard against JS date overflow (e.g. 31/02)
  const back = d.toISOString().slice(0, 10)
  return back === iso ? iso : ''
}

