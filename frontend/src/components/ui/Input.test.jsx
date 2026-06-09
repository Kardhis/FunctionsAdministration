import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input.jsx'

describe('Input', () => {
  it('renders label and forwards props to input', async () => {
    const user = userEvent.setup()
    render(<Input label="Email" placeholder="you@example.com" />)
    const field = screen.getByLabelText('Email')
    expect(field).toHaveAttribute('placeholder', 'you@example.com')
    await user.type(field, 'a@b.com')
    expect(field).toHaveValue('a@b.com')
  })

  it('shows error message and aria-invalid', () => {
    render(<Input label="Name" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows hint when no error', () => {
    render(<Input label="Bio" hint="Max 200 chars" />)
    expect(screen.getByText('Max 200 chars')).toBeInTheDocument()
  })
})
