import { useEffect, useRef, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { todayLocalDateString } from '../domain/time.js'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`
}

export default function LiveTimer({ habits, onComplete }) {
  const [habitId, setHabitId] = useState(habits[0]?.id ?? '')
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)

  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running || !startedAt) {
      return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const tick = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    intervalRef.current = window.setInterval(tick, 500)
    return () => {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [running, startedAt])

  const selectedHabitId = habitId || habits[0]?.id || ''

  async function stopAndSave() {
    if (!running || !startedAt) return
    const end = new Date()
    const start = new Date(startedAt)
    const date = todayLocalDateString(end)
    const startTime = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`
    const endTime = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`
    setRunning(false)
    setStartedAt(null)
    setElapsedSec(0)
    await onComplete?.({ habitId: selectedHabitId, date, startTime, endTime, notes: 'Sesión con temporizador' })
  }

  return (
    <div className="rounded-2xl border border-border bg-bg/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-h">Temporizador en vivo</p>
          <p className="mt-1 text-sm text-text">Inicia/para y guarda un registro automáticamente.</p>
        </div>
        <Badge tone={running ? 'accent' : 'neutral'}>{running ? 'en curso' : 'parado'}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-text">Hábito</span>
            <select
              className="ui-input mt-2"
              value={selectedHabitId}
              onChange={(e) => setHabitId(e.target.value)}
              disabled={running}
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.icon ? `${h.icon} ` : ''}
                  {h.name}
                </option>
              ))}
            </select>
          </label>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text">Tiempo</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-text-h">{formatClock(elapsedSec)}</p>
          </div>
          <div className="flex gap-2">
            {!running ? (
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  setStartedAt(Date.now())
                  setRunning(true)
                  setElapsedSec(0)
                }}
                disabled={!selectedHabitId}
              >
                Iniciar
              </Button>
            ) : (
              <Button variant="secondary" type="button" onClick={stopAndSave}>
                Parar y guardar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
