import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../../../components/Card.jsx'
import Button from '../../../components/Button.jsx'
import Badge from '../../../components/Badge.jsx'
import { objectiveCreateSchema } from '../domain/schemas.js'
import { formatDateEs } from '../../../data/dateFormat.js'
import DatePickerInput from '../../../components/DatePickerInput.jsx'

export default function ObjectiveUpsertModal({ mode, open, habits, initial, onClose, onSubmit }) {
  const allHabits = useMemo(() => (Array.isArray(habits) ? habits : []), [habits])

  const form = useForm({
    resolver: zodResolver(objectiveCreateSchema),
    defaultValues: {
      habitId: '',
      notes: '',
      startDate: '',
      endDate: '',
      metricType: 'MINUTES',
      targetValue: 30,
    },
    mode: 'onChange',
  })

  const watchStartDate = form.watch('startDate')
  const watchEndDate = form.watch('endDate')

  useEffect(() => {
    if (!open) return
    form.reset({
      habitId: initial?.habitId ?? '',
      notes: initial?.notes ?? '',
      startDate: initial?.startDate ?? '',
      endDate: initial?.endDate ?? '',
      metricType: initial?.metricType ?? 'MINUTES',
      targetValue: typeof initial?.targetValue === 'number' ? initial.targetValue : 30,
    })
  }, [form, initial, open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const title = mode === 'edit' ? 'Editar objetivo' : 'Nuevo objetivo'

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => onClose?.()} />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-2xl items-center justify-center px-3 py-4 sm:px-4 sm:py-10">
        <Card className="max-h-[min(92dvh,900px)] w-full overflow-y-auto overscroll-y-contain p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text">{mode === 'edit' ? 'Editar' : 'Crear'}</p>
              <p className="mt-1 text-xl font-semibold text-text-h">{title}</p>
              <p className="mt-1 text-sm text-text">Define un hábito, una fecha fin y el objetivo (repeticiones o minutos).</p>
            </div>
            <Button variant="ghost" type="button" onClick={() => onClose?.()} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <form
            className="mt-5 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              const res = await onSubmit?.(values)
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
              <span className="text-sm font-medium text-text-h">Notas (opcional)</span>
              <textarea
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                {...form.register('notes')}
              />
              {form.formState.errors.notes ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.notes.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Fecha de inicio</span>
              <DatePickerInput value={watchStartDate} onChange={(v) => form.setValue('startDate', v, { shouldDirty: true, shouldValidate: true })} label="Fecha de inicio" />
              {form.formState.errors.startDate ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.startDate.message}</p> : null}
              {watchStartDate ? <p className="mt-1 text-xs text-text">Vista previa: {formatDateEs(watchStartDate)}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Fecha de finalización</span>
              <DatePickerInput value={watchEndDate} onChange={(v) => form.setValue('endDate', v, { shouldDirty: true, shouldValidate: true })} label="Fecha de finalización" />
              {form.formState.errors.endDate ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.endDate.message}</p> : null}
              {watchEndDate ? <p className="mt-1 text-xs text-text">Vista prèvia: {formatDateEs(watchEndDate)}</p> : null}
            </label>

            <div className="rounded-2xl border border-border bg-bg/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-h">Objetivo</p>
                <Badge tone="neutral">auto estado</Badge>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block sm:col-span-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-text">Tipo</span>
                  <select className="ui-input mt-2" {...form.register('metricType')}>
                    <option value="MINUTES">Minutos</option>
                    <option value="REPETITIONS">Repeticiones</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-text">Valor</span>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40"
                    {...form.register('targetValue', { valueAsNumber: true })}
                  />
                  {form.formState.errors.targetValue ? <p className="mt-1 text-xs text-[crimson]">{form.formState.errors.targetValue.message}</p> : null}
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={() => onClose?.()}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="min-h-11 w-full sm:w-auto" disabled={!allHabits.length}>
                {mode === 'edit' ? 'Guardar cambios' : 'Crear objetivo'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

