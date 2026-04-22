import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import HabitCreateModal from '../ui/HabitCreateModal.jsx'
import HabitCreatedMessageModal from '../ui/HabitCreatedMessageModal.jsx'
import HabitEditModal from '../ui/HabitEditModal.jsx'

export default function HabitsManagePage() {
  const habits = useHabitAppStore((s) => s.habits)
  const createHabit = useHabitAppStore((s) => s.createHabit)
  const updateHabit = useHabitAppStore((s) => s.updateHabit)
  const setHabitActive = useHabitAppStore((s) => s.setHabitActive)
  const deleteHabit = useHabitAppStore((s) => s.deleteHabit)
  const refreshHabits = useHabitAppStore((s) => s.refreshHabits)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdHabit, setCreatedHabit] = useState(null)
  const [editingHabit, setEditingHabit] = useState(null)

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7682/ingest/642c7c98-6081-45de-bcbd-80eda9ca897a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1da3e3' },
      body: JSON.stringify({
        sessionId: '1da3e3',
        runId: 'route-check',
        hypothesisId: 'R2',
        location: 'features/habits/pages/HabitsManagePage.jsx:useEffect(mount)',
        message: 'HabitsManagePage mounted',
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log
  }, [])

  const sorted = useMemo(() => habits.slice().sort((a, b) => a.name.localeCompare(b.name)), [habits])

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7682/ingest/642c7c98-6081-45de-bcbd-80eda9ca897a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1da3e3' },
      keepalive: true,
      body: JSON.stringify({
        sessionId: '1da3e3',
        runId: 'ui-check',
        hypothesisId: 'B1',
        location: 'features/habits/pages/HabitsManagePage.jsx:useEffect(sorted)',
        message: 'HabitsManagePage rendered header actions',
        data: { sortedCount: sorted.length, isCreateOpen, hasCreatedHabit: Boolean(createdHabit) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion agent log
  }, [createdHabit, isCreateOpen, sorted.length])

  function startEdit(h) {
    setEditingHabit(h)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Listado</p>
            <p className="mt-1 text-sm text-text">Busca, ordena y gestiona el ciclo de vida.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuevo hábito
            </Button>
            <Badge tone="neutral">{sorted.length}</Badge>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[760px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Hábito</th>
                <th className="px-2">Cat.</th>
                <th className="px-2">Objetivo</th>
                <th className="px-2">Estado</th>
                <th className="px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((h) => (
                <tr key={h.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl text-lg" style={{ background: `${h.color}22`, color: h.color, border: `1px solid ${h.color}55` }}>
                        {h.icon || '•'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-h">{h.name}</p>
                        {h.description ? <p className="truncate text-xs text-text">{h.description}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-sm text-text">{h.category ?? '—'}</td>
                  <td className="px-2 py-3 text-sm text-text">
                    {h.targetValue} · {h.targetType} / {h.targetPeriod}
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={h.active ? 'accent' : 'neutral'}>{h.active ? 'activo' : 'inactivo'}</Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(h)}>
                        Editar
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => setHabitActive(h.id, !h.active)}>
                        {h.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[crimson]"
                        onClick={() => {
                          const ok = window.confirm(`Eliminar “${h.name}”?`)
                          if (!ok) return
                          deleteHabit(h.id)
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <HabitCreateModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async (values) => {
          const res = await createHabit(values)
          if (res?.ok) {
            setIsCreateOpen(false)
            setCreatedHabit(res.habit)
          }
          return res
        }}
      />

      <HabitCreatedMessageModal
        open={Boolean(createdHabit)}
        habit={createdHabit}
        onClose={async () => {
          setCreatedHabit(null)
          await refreshHabits()
        }}
      />

      <HabitEditModal
        open={Boolean(editingHabit)}
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onSaved={async (values) => {
          const res = await updateHabit({ id: editingHabit.id, ...values })
          if (res?.ok) {
            setEditingHabit(null)
          }
          return res
        }}
      />
    </div>
  )
}
