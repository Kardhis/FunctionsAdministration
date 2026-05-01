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
          className="w-full cursor-pointer rounded-2xl border border-border bg-bg px-4 py-3 pr-11 text-sm text-text-h shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          value={display}
          onClick={() => setOpen((v) => !v)}
        />
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          aria-label="Obrir calendari"
          onClick={() => setOpen((v) => !v)}
        >
          📅
        </Button>
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 w-[320px] rounded-2xl border border-border bg-bg p-3 shadow-soft">
          <DayPicker
            mode="single"
            locale={ca}
            weekStartsOn={1}
            selected={selected ?? undefined}
            onSelect={(d) => {
              onChange?.(dateToIso(d))
              setOpen(false)
            }}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
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

