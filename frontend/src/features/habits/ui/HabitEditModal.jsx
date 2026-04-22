import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { habitCreateResolver } from '../store/habitAppStore.js'

export default function HabitEditModal({ open, habit, onClose, onSaved }) {
  const form = useForm({
    resolver: habitCreateResolver,
    defaultValues: {
      name: '',
      description: '',
      color: '#7c3aed',
      icon: '',
      category: 'otro',
      active: true,
      targetType: 'minutes_per_day',
      targetValue: 30,
      targetPeriod: 'day',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open || !habit) return
    form.reset({
      name: habit.name ?? '',
      description: habit.description ?? '',
      color: habit.color ?? '#7c3aed',
      icon: habit.icon ?? '',
      category: habit.category ?? 'otro',
      active: Boolean(habit.active),
      targetType: habit.targetType ?? 'minutes_per_day',
      targetValue: habit.targetValue ?? 30,
      targetPeriod: habit.targetPeriod ?? 'day',
    })
  }, [form, habit, open])

  const targetType = form.watch('targetType')
  useEffect(() => {
    if (!open) return
    if (targetType === 'minutes_per_day') form.setValue('targetPeriod', 'day', { shouldValidate: true })
    if (targetType === 'sessions_per_week') form.setValue('targetPeriod', 'week', { shouldValidate: true })
    if (targetType === 'hours_per_month') form.setValue('targetPeriod', 'month', { shouldValidate: true })
  }, [form, open, targetType])

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
      <div className="relative mx-auto flex min-h-[100svh] max-w-2xl items-center justify-center px-4 py-10">
        <Card className="w-full p-6">
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
                  <input type="color" className="h-12 w-14 rounded-xl border border-border bg-bg" {...form.register('color')} />
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
                <span className="text-sm font-medium text-text-h">Categoría</span>
                <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('category')}>
                  <option value="salud">Salud</option>
                  <option value="estudio">Estudio</option>
                  <option value="trabajo">Trabajo</option>
                  <option value="ejercicio">Ejercicio</option>
                  <option value="ocio">Ocio</option>
                  <option value="otro">Otro</option>
                </select>
              </label>

              <label className="flex items-center gap-3 pt-7">
                <input type="checkbox" className="h-4 w-4" checked={Boolean(form.watch('active'))} onChange={(e) => form.setValue('active', e.target.checked, { shouldValidate: true })} />
                <span className="text-sm font-medium text-text-h">Activo</span>
              </label>
            </div>

            <div className="rounded-2xl border border-border bg-bg/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-h">Objetivo</p>
                <Badge tone="neutral">MVP</Badge>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-text">Tipo</span>
                  <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('targetType')}>
                    <option value="minutes_per_day">Minutos / día</option>
                    <option value="sessions_per_week">Sesiones / semana</option>
                    <option value="hours_per_month">Horas / mes</option>
                  </select>
                </label>
                <label className="block sm:col-span-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-text">Valor</span>
                  <input type="number" className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('targetValue', { valueAsNumber: true })} />
                  {form.formState.errors.targetValue ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.targetValue.message}</p> : null}
                </label>
                <label className="block sm:col-span-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-text">Periodo</span>
                  <select className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('targetPeriod')}>
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onClose?.()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

