import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination.jsx'

const baseProps = {
  page: 2,
  totalPages: 5,
  totalItems: 42,
  pageSize: 10,
  hasPrev: true,
  hasNext: true,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onPage: vi.fn(),
}

describe('Pagination', () => {
  it('returns null when only one page', () => {
    const { container } = render(<Pagination {...baseProps} totalPages={1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows item range and page controls', () => {
    render(<Pagination {...baseProps} />)
    expect(screen.getByRole('navigation', { name: 'Paginació' })).toBeInTheDocument()
    expect(screen.getByText('11–20 de 42')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pàgina 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('calls navigation handlers', async () => {
    const user = userEvent.setup()
    const onPrev = vi.fn()
    const onNext = vi.fn()
    const onPage = vi.fn()

    render(
      <Pagination
        {...baseProps}
        onPrev={onPrev}
        onNext={onNext}
        onPage={onPage}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pàgina anterior' }))
    await user.click(screen.getByRole('button', { name: 'Pàgina següent' }))
    await user.click(screen.getByRole('button', { name: 'Pàgina 3' }))

    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPage).toHaveBeenCalledWith(3)
  })
})
