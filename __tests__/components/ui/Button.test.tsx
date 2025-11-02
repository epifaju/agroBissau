import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    let button = screen.getByRole('button')
    // Check for destructive variant classes instead of exact class name
    expect(button).toHaveClass('bg-red-500')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    // Check for outline variant classes
    expect(button.className).toMatch(/border/)
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(<Button size="lg">Large</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-11')

    rerender(<Button size="sm">Small</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-9')
  })
})

