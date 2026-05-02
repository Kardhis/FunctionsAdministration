import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { habitCreateResolver } from '../store/habitAppStore.js'

export default function HabitEditModal({ open, habit, categories = [], onClose, onSaved }) {
  const form = useForm({
    resolver: habitCreateResolver,
    defaultValues: {
      name: '',
      description: '',
      color: '#7c3aed',
      icon: '',
      categoryIds: [],
      active: true,
    },
    mode: 'onChange',
  })

  const color = form.watch('color')

  useEffect(() => {
    if (!open || !habit) return
    form.reset({
      name: habit.name ?? '',
      description: habit.description ?? '',
      color: habit.color ?? '#7c3aed',
      icon: habit.icon ?? '',
      categoryIds: Array.isArray(habit.categoryIds) ? habit.categoryIds : [],
      active: Boolean(habit.active),
    })
  }, [form, habit, open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !habit) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-2xl items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(92dvh,900px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-text">Editar</p>
              <p className="mt-1 truncate text-xl font-semibold text-text-h">{habit.name}</p>
              <p className="mt-1 text-sm text-text">Actualiza los datos del hábito y guarda los cambios.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">ID</Badge>
              <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Cerrar">
                ✕
              </Button>
            </div>
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
               const res = await onSaved?.(values)
              if (res?.ok) onClose?.()
            })}
          >
            <label className="block">
              <span className="text-sm font-medium text-text-h">Nombre</span>
              <input className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('name')} />
              {form.formState.errors.name ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.name.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Descripción (opcional)</span>
              <textarea rows={3} className="mt-2 w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('description')} />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-text-h">Color</span>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    className="h-12 w-14 rounded-xl border border-border bg-bg"
                    value={typeof color === 'string' ? color : '#7c3aed'}
                    onChange={(e) => form.setValue('color', e.target.value, { shouldValidate: true, shouldDirty: true })}
                  />
                  <input className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('color')} />
                </div>
                {form.formState.errors.color ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.color.message}</p> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-h">Icono (opcional)</span>
                <input className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" placeholder="Ej: 📚" {...form.register('icon')} />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-text-h">Categorías (opcional)</span>
                <div className="mt-2 space-y-2 rounded-2xl border border-border bg-bg/60 p-3">
                  {categories.filter((c) => c.active).length ? (
                    categories
                      .filter((c) => c.active)
                      .map((c) => {
                        const selected = (form.watch('categoryIds') ?? []).includes(c.id)
                        return (
                          <label key={c.id} className="flex items-center justify-between gap-3 text-sm text-text-h">
                            <span className="truncate">{c.name}</span>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selected}
                              onChange={(e) => {
                                const prev = form.getValues('categoryIds') ?? []
                                const next = e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)
                                form.setValue('categoryIds', next, { shouldValidate: true })
                              }}
                            />
                          </label>
                        )
                      })
                  ) : (
                    <p className="text-sm text-text">No hay categorías activas todavía.</p>
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 pt-7">
                <input type="checkbox" className="h-4 w-4" checked={Boolean(form.watch('active'))} onChange={(e) => form.setValue('active', e.target.checked, { shouldValidate: true })} />
                <span className="text-sm font-medium text-text-h">Activo</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={() => onClose?.()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="min-h-11 w-full sm:w-auto">
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

