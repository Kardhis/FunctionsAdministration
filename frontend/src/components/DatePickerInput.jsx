import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { ca } from 'date-fns/locale'
import { format, isValid, parse } from 'date-fns'
import Button from './Button.jsx'

function isoToDate(iso) {
  if (!iso) return null
  const d = parse(String(iso), 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : null
}

function dateToIso(d) {
  if (!d || !isValid(d)) return ''
  return format(d, 'yyyy-MM-dd')
}

export default function DatePickerInput({ value, onChange, placeholder = 'dd/mm/aaaa', label, disabled }) {
  const selected = useMemo(() => isoToDate(value), [value])
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const display = selected ? format(selected, 'dd/MM/yyyy') : ''

  return (
    <div ref={rootRef} className="relative">
      <div className="relative mt-2">
        <input
          type="text"
          readOnly
          disabled={disabled}
          aria-label={label}
          placeholder={placeholder}
          className="ui-input cursor-pointer pr-11 disabled:cursor-not-allowed disabled:opacity-60"
          value={display}
          onClick={() => setOpen((v) => !v)}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-white/5"
          aria-label="Obrir calendari"
          onClick={() => setOpen((v) => !v)}
        >
          📅
        </Button>
      </div>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(340px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-[color:var(--surface-2)] p-3 shadow-float sm:left-0 sm:right-auto sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-h">Selecciona fecha</p>
              <p className="mt-0.5 text-xs text-muted">{selected ? format(selected, 'dd/MM/yyyy') : '—'}</p>
            </div>
            <Button type="button" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white/5" onClick={() => setOpen(false)} aria-label="Cerrar">
              ✕
            </Button>
          </div>

          <DayPicker
            mode="single"
            locale={ca}
            weekStartsOn={1}
            showOutsideDays
            fixedWeeks
            selected={selected ?? undefined}
            onSelect={(d) => {
              onChange?.(dateToIso(d))
              setOpen(false)
            }}
            classNames={{
              months: 'mt-3',
              month: 'space-y-3',
              caption: 'flex items-center justify-between',
              caption_label: 'text-sm font-semibold text-text-h',
              nav: 'flex items-center gap-2',
              nav_button:
                'h-9 w-9 rounded-xl border border-border bg-transparent text-text-h transition-[background,border-color] duration-200 ease-out hover:bg-white/5 hover:border-[color:var(--border-strong)]',
              table: 'w-full border-collapse',
              head_row: 'grid grid-cols-7 gap-1',
              head_cell: 'text-[11px] font-semibold uppercase tracking-wider text-muted text-center py-1',
              row: 'mt-1 grid grid-cols-7 gap-1',
              cell: 'grid place-items-center',
              day: 'h-10 w-10 rounded-xl text-sm font-medium text-text-h transition-[background,transform,box-shadow] duration-200 ease-out hover:bg-white/5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
              day_today: 'ring-1 ring-[color:var(--border-strong)]',
              day_outside: 'text-muted opacity-60',
              day_disabled: 'text-muted opacity-40 cursor-not-allowed',
              day_selected:
                'bg-[color:var(--accent)] text-[#061018] shadow-[0_0_0_1px_var(--accent-border),0_8px_24px_rgba(0,0,0,0.35)] hover:bg-[color:var(--accent)]',
            }}
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                onChange?.(dateToIso(today))
                setOpen(false)
              }}
            >
              Hoy
            </Button>
            <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.('')
                setOpen(false)
              }}
            >
              Esborrar
            </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

