import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListingCard } from '@/components/features/ListingCard'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock FavoriteButton
jest.mock('@/components/features/FavoriteButton', () => ({
  FavoriteButton: () => <div data-testid="favorite-button">Favorite</div>,
}))

const mockListing = {
  id: 'listing-1',
  title: 'Mangues fraîches de qualité',
  price: 5000,
  unit: 'kg',
  location: { city: 'Bissau', region: 'Bissau' },
  images: ['https://example.com/image.jpg'],
  createdAt: new Date().toISOString(),
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  },
  isFeatured: false,
  originalPrice: null,
  discountPercent: null,
  promotionUntil: null,
}

describe('ListingCard Component', () => {
  beforeEach(() => {
    // Mock window.location
    delete (window as any).location
    window.location = { ...window.location, href: '' }
  })

  it('renders listing information correctly', () => {
    render(<ListingCard listing={mockListing} />)
    
    expect(screen.getByText('Mangues fraîches de qualité')).toBeInTheDocument()
    expect(screen.getByText(/Bissau/)).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('displays price correctly', () => {
    render(<ListingCard listing={mockListing} />)
    
    // Price should be formatted and displayed (formatPrice uses spaces)
    expect(screen.getByText(/5\s*000.*F\s*CFA.*\/.*kg/)).toBeInTheDocument()
  })

  it('handles card click and navigates to listing detail', () => {
    render(<ListingCard listing={mockListing} />)
    
    const card = screen.getByText('Mangues fraîches de qualité').closest('[class*="cursor-pointer"]')
    expect(card).toBeInTheDocument()
    
    fireEvent.click(card!)
    expect(window.location.href).toBe(`/listings/${mockListing.id}`)
  })

  it('displays featured badge when listing is featured', () => {
    const featuredListing = { ...mockListing, isFeatured: true }
    render(<ListingCard listing={featuredListing} />)
    
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('displays promotion badge when listing has promotion', () => {
    const promoListing = {
      ...mockListing,
      originalPrice: 7500,
      discountPercent: 33,
      promotionUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    render(<ListingCard listing={promoListing} />)
    
    // Should show discounted price (7500 * 0.67 = 5025)
    expect(screen.getByText(/5\s*025.*F\s*CFA.*\/.*kg/)).toBeInTheDocument()
    // Should also show original price
    expect(screen.getByText(/7\s*500.*F\s*CFA.*\/.*kg/)).toBeInTheDocument()
  })

  it('displays placeholder image when no images provided', () => {
    const noImageListing = { ...mockListing, images: [] }
    render(<ListingCard listing={noImageListing} />)
    
    expect(screen.getByText('🌾')).toBeInTheDocument()
  })

  it('displays user avatar correctly', () => {
    render(<ListingCard listing={mockListing} />)
    
    const avatar = screen.getByText('JD')
    expect(avatar).toBeInTheDocument()
  })

  it('handles user click and navigates to profile', () => {
    render(<ListingCard listing={mockListing} />)
    
    const userLink = screen.getByText('John Doe')
    fireEvent.click(userLink)
    
    expect(window.location.href).toBe(`/profile/${mockListing.user.id}`)
  })

  it('shows favorite button', () => {
    render(<ListingCard listing={mockListing} />)
    
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument()
  })

  it('displays relative time correctly', () => {
    const recentListing = {
      ...mockListing,
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    }
    render(<ListingCard listing={recentListing} />)
    
    // Should show relative time (formatRelativeTime returns "Il y a 1 h" for 1 hour)
    const timeElement = screen.getByText(/il y a.*1\s*h/i)
    expect(timeElement).toBeInTheDocument()
  })
})

