import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/test-utils.jsx'
import ProfilePage from './ProfilePage.jsx'

describe('ProfilePage', () => {
  it('renders profile sections', () => {
    renderWithProviders(<ProfilePage />, { withAuth: true })
    expect(screen.getByRole('heading', { name: 'Perfil de usuario' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })
})
