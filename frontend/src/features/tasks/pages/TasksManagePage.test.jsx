import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils.jsx'
import { resetTasksStore, seedTasksStore } from '../../../test/pageTestHelpers.js'
import TasksManagePage from './TasksManagePage.jsx'

describe('TasksManagePage', () => {
  beforeEach(() => {
    resetTasksStore()
    seedTasksStore({
      projects: [{ id: 1, name: 'Proyecto Alpha', color: '#ff0000' }],
      categories: [{ id: 2, name: 'Categoría Beta', color: '#00ff00' }],
    })
  })

  it('renders projects and categories sections', () => {
    renderWithProviders(<TasksManagePage />)
    expect(screen.getByText('Projectes')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getAllByText('Proyecto Alpha').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Categoría Beta').length).toBeGreaterThan(0)
  })

  it('opens new project modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksManagePage />)
    await user.click(screen.getByRole('button', { name: '+ Nou projecte' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens new category modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TasksManagePage />)
    await user.click(screen.getByRole('button', { name: '+ Nova categoria' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
