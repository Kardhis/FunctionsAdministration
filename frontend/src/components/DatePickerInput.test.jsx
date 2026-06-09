import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePickerInput from './DatePickerInput.jsx'

describe('DatePickerInput', () => {
  it('renders formatted date value', () => {
    render(<DatePickerInput label="Fecha" value="2026-06-08" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Fecha')).toHaveValue('08/06/2026')
  })

  it('opens calendar popover', async () => {
    const user = userEvent.setup()
    render(<DatePickerInput label="Fecha" value="" onChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Obrir calendari' }))
    expect(screen.getByText('Selecciona una fecha')).toBeInTheDocument()
  })

  it('calls onChange when selecting today', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DatePickerInput label="Fecha" value="" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Obrir calendari' }))
    await user.click(screen.getByRole('button', { name: 'Hoy' }))
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
  })
})
