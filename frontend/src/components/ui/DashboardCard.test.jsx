import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardCard from './DashboardCard.jsx'

describe('DashboardCard', () => {
  it('renders title, value and subtitle', () => {
    render(<DashboardCard title="Tiempo hoy" value="45 min" subtitle="3 registros" icon="⏱" />)
    expect(screen.getByText('Tiempo hoy')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('3 registros')).toBeInTheDocument()
    expect(screen.getByText('⏱')).toBeInTheDocument()
  })

  it('renders numeric delta badge', () => {
    render(<DashboardCard title="Progreso" value="80%" delta={12} tone="success" />)
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <DashboardCard title="Card" value="1">
        <p>Detalle extra</p>
      </DashboardCard>,
    )
    expect(screen.getByText('Detalle extra')).toBeInTheDocument()
  })
})
