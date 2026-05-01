import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'

export default function HabitCategoryEditModal({ open, category, onClose, onSaved }) {
  const form = useForm({ defaultValues: { name: '', active: true }, mode: 'onChange' })

  useEffect(() => {
    if (!open || !category) return
    form.reset({ name: category.name ?? '', active: Boolean(category.active) })
  }, [category, form, open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !category) return null

  const nameErr = form.formState.errors.name?.message

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] max-w-lg items-center justify-center px-4 py-10">
        <Card className="w-full p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-text">Editar</p>
              <p className="mt-1 truncate text-xl font-semibold text-text-h">{category.name}</p>
              <p className="mt-1 text-sm text-text">Actualiza nombre o estado.</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              const name = String(values.name ?? '').trim()
              if (!name) {
                form.setError('name', { type: 'required', message: 'El nombre es obligatorio' })
                return
              }
              const res = await onSaved?.({ id: category.id, name, active: Boolean(values.active) })
              if (res?.ok) onClose?.()
            })}
          >
            <label className="block">
              <span className="text-sm font-medium text-text-h">Nombre</span>
              <input
                className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                {...form.register('name')}
              />
              {nameErr ? <p className="mt-1 text-xs text-[crimson]">{nameErr}</p> : null}
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(form.watch('active'))}
                onChange={(e) => form.setValue('active', e.target.checked)}
              />
              <span className="text-sm font-medium text-text-h">Activa</span>
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onClose?.()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

