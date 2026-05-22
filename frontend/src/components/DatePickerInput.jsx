import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker, useDayPicker } from 'react-day-picker'
import { ca } from 'date-fns/locale'
import { format, isValid, parse } from 'date-fns'
import Button from './Button.jsx'

const NAV_BTN_CLASS =
  'flex h-7 w-7 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-lg font-bold text-[color:var(--accent)] transition-opacity duration-150 hover:opacity-70 active:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-30'

function CalendarCaption({ calendarMonth }) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()
  return (
    <div className="flex h-8 items-center justify-center gap-2">
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={NAV_BTN_CLASS}
        aria-label="Mes anterior"
      >
        ‹
      </button>
      <span className="min-w-[6rem] text-center text-sm font-semibold text-text-h">
        {format(calendarMonth.date, 'LLLL yyyy', { locale: ca })}
      </span>
      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={NAV_BTN_CLASS}
        aria-label="Mes siguiente"
      >
        ›
      </button>
    </div>
  )
}

function CalendarNav() {
  return null
}

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
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
          aria-haspopup="dialog"
          aria-expanded={open}
          placeholder={placeholder}
          className="ui-input cursor-pointer pr-11 disabled:cursor-not-allowed disabled:opacity-60"
          value={display}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((v) => !v)
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl hover:bg-white/5"
          aria-label="Obrir calendari"
          onClick={() => setOpen((v) => !v)}
        >
          📅
        </Button>
      </div>

      {open ? (
        <div className="absolute left-1/2 z-50 mt-2 w-[min(300px,calc(100dvw-1.5rem))] -translate-x-1/2 rounded-2xl border border-border bg-[color:var(--surface-2)] p-3 shadow-float sm:w-[280px]">
          <div className="flex items-center">
            <div className="w-9 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-center text-sm font-semibold text-text-h">Selecciona una fecha</p>
            <Button type="button" variant="ghost" className="h-9 w-9 shrink-0 rounded-xl hover:bg-white/5" onClick={() => setOpen(false)} aria-label="Cerrar">
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
            components={{ MonthCaption: CalendarCaption, Nav: CalendarNav }}
            classNames={{
              months: 'mt-2',
              month: 'space-y-1',
              month_grid: 'w-full border-collapse',
              weekdays: 'grid grid-cols-7 gap-0.5',
              weekday: 'text-xs font-semibold uppercase tracking-wider text-muted text-center py-0.5',
              week: 'mt-0.5 grid grid-cols-7 gap-0.5',
              day: 'grid place-items-center',
              day_button:
                'h-8 w-8 rounded-lg text-xs font-medium text-text-h transition-[background,transform,box-shadow] duration-200 ease-out hover:bg-[color:var(--accent)] hover:text-[#061018] hover:brightness-110 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
              today: 'ring-1 ring-[color:var(--border-strong)]',
              outside: 'text-muted opacity-50',
              disabled: 'text-muted opacity-40 cursor-not-allowed',
              selected:
                'bg-[color:var(--accent)] text-[#061018] shadow-[0_0_0_1px_var(--accent-border),0_4px_12px_rgba(0,0,0,0.25)] hover:bg-[color:var(--accent)] hover:brightness-110',
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-2">
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
      ) : null}
    </div>
  )
}

