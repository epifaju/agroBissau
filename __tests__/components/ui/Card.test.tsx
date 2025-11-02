import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      )
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <Card className="custom-card" data-testid="card">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref} data-testid="card">Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders header with title and description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
    })

    it('applies custom className to header', () => {
      render(
        <Card>
          <CardHeader className="custom-header" data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardContent', () => {
    it('renders content', () => {
      render(
        <Card>
          <CardContent>
            <p>Card body content</p>
          </CardContent>
        </Card>
      )
      expect(screen.getByText('Card body content')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders footer', () => {
      render(
        <Card>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })
})

