import { useState } from 'react'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import { useTasksStore } from '../store/tasksStore.js'
import TaskTaxonomyModal from '../ui/TaskTaxonomyModal.jsx'
import ConfirmActionModal from '../ui/ConfirmActionModal.jsx'

function ColorDot({ color }) {
  return (
    <span
      className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export default function TasksManagePage() {
  const projects         = useTasksStore((s) => s.projects)
  const categories       = useTasksStore((s) => s.categories)
  const createProject    = useTasksStore((s) => s.createProject)
  const updateProject    = useTasksStore((s) => s.updateProject)
  const deleteProject    = useTasksStore((s) => s.deleteProject)
  const createCategory   = useTasksStore((s) => s.createCategory)
  const updateCategory   = useTasksStore((s) => s.updateCategory)
  const deleteCategory   = useTasksStore((s) => s.deleteCategory)
  const addToast         = useTasksStore((s) => s.addToast)

  // Projects modal state
  const [projectModal, setProjectModal] = useState({ open: false, initial: null })
  const [deletingProject, setDeletingProject] = useState(null)

  // Categories modal state
  const [categoryModal, setCategoryModal] = useState({ open: false, initial: null })
  const [deletingCategory, setDeletingCategory] = useState(null)

  // ── Projects ──────────────────────────────────────────────

  async function handleProjectSubmit(data) {
    const result = projectModal.initial
      ? await updateProject(projectModal.initial.id, data)
      : await createProject(data)
    if (result.ok) {
      addToast(projectModal.initial ? 'Projecte actualitzat' : 'Projecte creat')
    }
    return result
  }

  async function handleDeleteProject() {
    if (!deletingProject) return
    const result = await deleteProject(deletingProject.id)
    setDeletingProject(null)
    if (result.ok) addToast('Projecte eliminat')
    else addToast(result.error ?? 'Error eliminant el projecte', 'error')
  }

  // ── Categories ────────────────────────────────────────────

  async function handleCategorySubmit(data) {
    const result = categoryModal.initial
      ? await updateCategory(categoryModal.initial.id, data)
      : await createCategory(data)
    if (result.ok) {
      addToast(categoryModal.initial ? 'Categoria actualitzada' : 'Categoria creada')
    }
    return result
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return
    const result = await deleteCategory(deletingCategory.id)
    setDeletingCategory(null)
    if (result.ok) addToast('Categoria eliminada')
    else addToast(result.error ?? 'Error eliminant la categoria', 'error')
  }

  return (
    <div className="space-y-4">
      {/* ── Projects card ── */}
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Projectes</p>
            <p className="mt-1 text-sm text-text">
              {projects.length} projecte{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="shrink-0"
            onClick={() => setProjectModal({ open: true, initial: null })}
          >
            + Nou projecte
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="mt-4 space-y-3 lg:hidden">
          {projects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <ColorDot color={p.color} />
                <p className="text-sm font-medium text-text-h">{p.name}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11 flex-1"
                  onClick={() => setProjectModal({ open: true, initial: p })}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="min-h-11 flex-1"
                  onClick={() => setDeletingProject(p)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          {!projects.length && (
            <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
              Encara no hi ha projectes. Crea el primer!
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="mt-4 hidden lg:block">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Nom</th>
                <th className="px-2">Color</th>
                <th className="px-2 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                  <td className="max-w-[260px] px-2 py-3 text-sm font-medium text-text-h">
                    <div className="flex items-center gap-2">
                      <ColorDot color={p.color} />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className="inline-block rounded-lg px-2 py-0.5 text-xs font-medium"
                      style={{ background: `${p.color}22`, color: p.color }}
                    >
                      {p.color}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setProjectModal({ open: true, initial: p })}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingProject(p)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!projects.length && (
                <tr>
                  <td colSpan={3} className="px-2 py-3 text-sm text-text">
                    Encara no hi ha projectes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Categories card ── */}
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-h">Categories</p>
            <p className="mt-1 text-sm text-text">
              {categories.length} categoria{categories.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="shrink-0"
            onClick={() => setCategoryModal({ open: true, initial: null })}
          >
            + Nova categoria
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="mt-4 space-y-3 lg:hidden">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-bg/60 p-4 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <ColorDot color={c.color} />
                <p className="text-sm font-medium text-text-h">{c.name}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11 flex-1"
                  onClick={() => setCategoryModal({ open: true, initial: c })}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="min-h-11 flex-1"
                  onClick={() => setDeletingCategory(c)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <p className="rounded-2xl border border-border bg-bg/60 p-4 text-sm text-text">
              Encara no hi ha categories. Crea la primera!
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="mt-4 hidden lg:block">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text">
                <th className="px-2">Nom</th>
                <th className="px-2">Color</th>
                <th className="px-2 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="rounded-2xl bg-bg/60 ring-1 ring-border">
                  <td className="max-w-[260px] px-2 py-3 text-sm font-medium text-text-h">
                    <div className="flex items-center gap-2">
                      <ColorDot color={c.color} />
                      <span className="truncate">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className="inline-block rounded-lg px-2 py-0.5 text-xs font-medium"
                      style={{ background: `${c.color}22`, color: c.color }}
                    >
                      {c.color}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCategoryModal({ open: true, initial: c })}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setDeletingCategory(c)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={3} className="px-2 py-3 text-sm text-text">
                    Encara no hi ha categories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <TaskTaxonomyModal
        open={projectModal.open}
        type="project"
        initial={projectModal.initial}
        onClose={() => setProjectModal({ open: false, initial: null })}
        onSubmit={handleProjectSubmit}
      />

      <TaskTaxonomyModal
        open={categoryModal.open}
        type="category"
        initial={categoryModal.initial}
        onClose={() => setCategoryModal({ open: false, initial: null })}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmActionModal
        open={Boolean(deletingProject)}
        title="Eliminar projecte"
        message={deletingProject ? `Eliminar "${deletingProject.name}"? Les tasques associades perdran el projecte.` : ''}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        onCancel={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
      />

      <ConfirmActionModal
        open={Boolean(deletingCategory)}
        title="Eliminar categoria"
        message={deletingCategory ? `Eliminar "${deletingCategory.name}"? Les tasques associades perdran la categoria.` : ''}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
      />
    </div>
  )
}
