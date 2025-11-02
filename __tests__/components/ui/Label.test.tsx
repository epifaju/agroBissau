import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders label with text', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('associates with input using htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    )
    const label = screen.getByText('Email')
    const input = screen.getByLabelText('Email')
    expect(label).toHaveAttribute('for', 'email')
    expect(input).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Label className="custom-label">Label</Label>)
    const label = screen.getByText('Label')
    expect(label).toHaveClass('custom-label')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Test</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('handles required indicator', () => {
    render(<Label>Email <span aria-label="required">*</span></Label>)
    const required = screen.getByLabelText('required')
    expect(required).toBeInTheDocument()
  })
})

