import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { habitEntryCreateResolver } from '../store/habitAppStore.js'
import { computeDurationMinutes, formatDurationHuman } from '../domain/time.js'
import { formatDateEs } from '../../../data/dateFormat.js'
import DatePickerInput from '../../../components/DatePickerInput.jsx'

export default function HabitEntryEditModal({ open, habits, entry, onClose, onSaved }) {
  const allHabits = useMemo(() => (Array.isArray(habits) ? habits : []), [habits])

  const form = useForm({
    resolver: habitEntryCreateResolver,
    defaultValues: {
      habitId: '',
      date: '',
      startTime: '09:00',
      endTime: '09:30',
      notes: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!open || !entry) return
    form.reset({
      habitId: entry.habitId ?? '',
      date: entry.date ?? '',
      startTime: entry.startTime ?? '09:00',
      endTime: entry.endTime ?? '09:30',
      notes: entry.notes ?? '',
    })
  }, [entry, form, open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const watchStart = form.watch('startTime')
  const watchEnd = form.watch('endTime')
  const watchDate = form.watch('date')

  const previewMinutes = useMemo(() => {
    try {
      return computeDurationMinutes({ date: watchDate, startTime: watchStart, endTime: watchEnd })
    } catch {
      return 0
    }
  }, [watchDate, watchEnd, watchStart])

  if (!open || !entry) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-2xl items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(92dvh,900px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">Editar</p>
              <p className="mt-1 text-xl font-semibold text-text-h">Registro</p>
              <p className="mt-1 text-sm text-text">Actualiza hábito, fecha y ventana de tiempo.</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              const res = await onSaved?.({ ...values, notes: values.notes ?? '' })
              if (res?.ok) onClose?.()
            })}
          >
            <label className="block">
              <span className="text-sm font-medium text-text-h">Hábito</span>
              <select className="ui-input mt-2" {...form.register('habitId')}>
                <option value="" disabled>
                  Selecciona…
                </option>
                {allHabits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.icon ? `${h.icon} ` : ''}
                    {h.name}
                    {h.active ? '' : ' (inactivo)'}
                  </option>
                ))}
              </select>
              {form.formState.errors.habitId ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.habitId.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Fecha</span>
              <DatePickerInput value={watchDate} onChange={(v) => form.setValue('date', v, { shouldDirty: true, shouldValidate: true })} label="Fecha" />
              {form.formState.errors.date ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.date.message}</p> : null}
              {watchDate ? <p className="mt-1 text-xs text-text">Vista previa: {formatDateEs(watchDate)}</p> : null}
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-text-h">Inicio (24h)</span>
                <input type="time" className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('startTime')} />
                {form.formState.errors.startTime ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.startTime.message}</p> : null}
              </label>
              <label className="block">
                <span className="text-sm font-medium text-text-h">Fin (24h)</span>
                <input type="time" className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('endTime')} />
                {form.formState.errors.endTime ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.endTime.message}</p> : null}
              </label>
            </div>

            <div className="rounded-2xl border border-border bg-bg/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-h">Duración</p>
                <Badge tone="neutral">auto</Badge>
              </div>
              <p className="mt-2 text-2xl font-semibold text-text-h">{formatDurationHuman(previewMinutes)}</p>
              <p className="mt-1 text-xs text-text">{previewMinutes} minutos</p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Nota (opcional)</span>
              <textarea rows={3} className="mt-2 w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40" {...form.register('notes')} />
            </label>

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

