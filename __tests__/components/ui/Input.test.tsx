import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Test input" />)
    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement
    
    await user.type(input, 'Hello World')
    expect(input.value).toBe('Hello World')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled" />)
    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()
  })

  it('accepts different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    let input = screen.getByPlaceholderText('Email') as HTMLInputElement
    expect(input.type).toBe('email')

    rerender(<Input type="password" placeholder="Password" />)
    input = screen.getByPlaceholderText('Password') as HTMLInputElement
    expect(input.type).toBe('password')

    rerender(<Input type="number" placeholder="Number" />)
    input = screen.getByPlaceholderText('Number') as HTMLInputElement
    expect(input.type).toBe('number')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="Test" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    expect(input).toHaveClass('custom-class')
  })

  it('handles onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Input onChange={handleChange} placeholder="Test" />)
    const input = screen.getByPlaceholderText('Test')
    
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports required attribute', () => {
    render(<Input required placeholder="Required" />)
    const input = screen.getByPlaceholderText('Required')
    expect(input).toBeRequired()
  })
})

