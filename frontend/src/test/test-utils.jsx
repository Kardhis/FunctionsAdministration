import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthContext.jsx'

export function renderWithProviders(ui, { route = '/', withAuth = false } = {}) {
  const tree = withAuth ? (
    <AuthProvider>{ui}</AuthProvider>
  ) : (
    ui
  )

  return render(<MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>)
}
