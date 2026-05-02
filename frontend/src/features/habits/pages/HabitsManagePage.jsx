import { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/Button.jsx'
import Card from '../../../components/Card.jsx'
import Badge from '../../../components/Badge.jsx'
import { useHabitAppStore } from '../store/habitAppStore.js'
import HabitCreateModal from '../ui/HabitCreateModal.jsx'
import HabitCreatedMessageModal from '../ui/HabitCreatedMessageModal.jsx'
import HabitEditModal from '../ui/HabitEditModal.jsx'
import HabitCategoryCreateModal from '../ui/HabitCategoryCreateModal.jsx'
import HabitCategoryEditModal from '../ui/HabitCategoryEditModal.jsx'
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal.jsx'

export default function HabitsManagePage() {
  const habits = useHabitAppStore((s) => s.habits)
  const createHabit = useHabitAppStore((s) => s.createHabit)
  const updateHabit = useHabitAppStore((s) => s.updateHabit)
  const setHabitActive = useHabitAppStore((s) => s.setHabitActive)
  const deleteHabit = useHabitAppStore((s) => s.deleteHabit)
  const refreshHabits = useHabitAppStore((s) => s.refreshHabits)
  const categories = useHabitAppStore((s) => s.categories)
  const createCategory = useHabitAppStore((s) => s.createCategory)
  const updateCategory = useHabitAppStore((s) => s.updateCategory)
  const toggleCategoryActive = useHabitAppStore((s) => s.toggleCategoryActive)
  const deleteCategory = useHabitAppStore((s) => s.deleteCategory)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdHabit, setCreatedHabit] = useState(null)
  const [editingHabit, setEditingHabit] = useState(null)

  const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)

  const sorted = useMemo(() => habits.slice().sort((a, b) => a.name.localeCompare(b.name)), [habits])
  const sortedCategories = useMemo(
    () => (Array.isArray(categories) ? categories.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))) : []),
    [categories],
  )

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
              id="btnNewHabit"
              className="w-full sm:w-auto"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuevo hábito
            </Button>
            <Badge tone="neutral">{sorted.length}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-3 lg:hidden">
          {sorted.map((h) => (
            <div key={h.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg" style={{ background: `${h.color}22`, color: h.color, border: `1px solid ${h.color}55` }}>
                  {h.icon || '•'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-text-h">{h.name}</p>
                  {h.description ? <p className="mt-1 text-sm text-text">{h.description}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-text">{Array.isArray(h.categoryIds) && h.categoryIds.length ? `${h.categoryIds.length} categoría(s)` : 'Sin categorías'}</span>
                    <Badge tone={h.active ? 'accent' : 'neutral'}>{h.active ? 'activo' : 'inactivo'}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button type="button" variant="secondary" className="min-h-11 w-full" onClick={() => startEdit(h)}>
                  Editar
                </Button>
                <Button type="button" variant="secondary" className="min-h-11 w-full" onClick={() => setHabitActive(h.id, !h.active)}>
                  {h.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 w-full text-[crimson]"
                  onClick={() => {
                    const ok = window.confirm(`Eliminar “${h.name}”?`)
                    if (!ok) return
                    deleteHabit(h.id)
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          {!sorted.length ? <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">No hay hábitos todavía.</p> : null}
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="min-w-[760px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Hábito</th>
                <th className="px-2">Cat.</th>
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
                  <td className="px-2 py-3 text-sm text-text">{Array.isArray(h.categoryIds) && h.categoryIds.length ? `${h.categoryIds.length} categoría(s)` : '—'}</td>
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
              {!sorted.length ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-text" colSpan={4}>
                    No hay hábitos todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <HabitCreateModal
        open={isCreateOpen}
        categories={sortedCategories}
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
        categories={sortedCategories}
        onClose={() => setEditingHabit(null)}
        onSaved={async (values) => {
          const res = await updateHabit({ id: editingHabit.id, ...values })
          if (res?.ok) {
            setEditingHabit(null)
          }
          return res
        }}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Categorías</p>
            <p className="mt-1 text-sm text-text">Gestiona tipos de hábito y asignación múltiple.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              id="btnNewCategory"
              className="w-full sm:w-auto ring-1 ring-border bg-bg/80 hover:bg-bg"
              onClick={() => setIsCategoryCreateOpen(true)}
            >
              Nueva categoría
            </Button>
            <Badge tone="neutral">{sortedCategories.length}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-3 lg:hidden">
          {sortedCategories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-text-h">{c.name}</p>
                <Badge tone={c.active ? 'accent' : 'neutral'}>{c.active ? 'activo' : 'inactivo'}</Badge>
              </div>
              <p className="mt-2 text-sm text-text">Hábitos: {c.habitCount ?? 0}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button type="button" variant="secondary" className="min-h-11 w-full" onClick={() => setEditingCategory(c)}>
                  Editar
                </Button>
                <Button type="button" variant="secondary" className="min-h-11 w-full" onClick={() => toggleCategoryActive(c.id)}>
                  {c.active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button type="button" variant="ghost" className="min-h-11 w-full text-[crimson]" onClick={() => setDeletingCategory(c)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          {!sortedCategories.length ? <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">Sin categorías todavía.</p> : null}
        </div>

        <div className="mt-4 hidden overflow-x-auto lg:block">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Categoría</th>
                <th className="px-2">#Hábitos</th>
                <th className="px-2">Estado</th>
                <th className="px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((c) => (
                <tr key={c.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                  <td className="px-2 py-3 text-sm font-medium text-text-h">{c.name}</td>
                  <td className="px-2 py-3 text-sm text-text">{c.habitCount ?? 0}</td>
                  <td className="px-2 py-3">
                    <Badge tone={c.active ? 'accent' : 'neutral'}>{c.active ? 'activo' : 'inactivo'}</Badge>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setEditingCategory(c)}>
                        Editar
                      </Button>
                      <Button type="button" variant="secondary" size="sm" onClick={() => toggleCategoryActive(c.id)}>
                        {c.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-[crimson]" onClick={() => setDeletingCategory(c)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sortedCategories.length ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-text" colSpan={4}>
                    Sin categorías todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <HabitCategoryCreateModal
        open={isCategoryCreateOpen}
        onClose={() => setIsCategoryCreateOpen(false)}
        onCreated={async (values) => {
          const res = await createCategory(values)
          if (res?.ok) setIsCategoryCreateOpen(false)
          return res
        }}
      />

      <HabitCategoryEditModal
        open={Boolean(editingCategory)}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={async (values) => {
          const res = await updateCategory(values)
          if (res?.ok) setEditingCategory(null)
          return res
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingCategory)}
        title="Eliminar categoría"
        message={deletingCategory ? `¿Eliminar “${deletingCategory.name}”? Se borrarán también sus asignaciones.` : ''}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={async () => {
          if (!deletingCategory) return
          await deleteCategory(deletingCategory.id)
          setDeletingCategory(null)
        }}
      />
    </div>
  )
}
