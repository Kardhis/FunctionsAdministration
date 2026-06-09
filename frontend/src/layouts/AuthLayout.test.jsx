import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthLayout from './AuthLayout.jsx'

describe('AuthLayout', () => {
  it('renders accessible shell with children', () => {
    render(
      <AuthLayout sectionLabel="Login" cardLabel="Panel de acceso">
        <h2>Acceso</h2>
        <p>Contenido del formulario</p>
      </AuthLayout>,
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByLabelText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText('Panel de acceso')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Acceso' })).toBeInTheDocument()
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument()
  })
})
