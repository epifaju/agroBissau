import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ContactSellerButton } from '@/components/features/ContactSellerButton'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'listing.contactSeller': 'Contacter le vendeur',
      'listing.contacting': 'Contact en cours...',
      'listing.contactError': 'Erreur lors du contact',
      'listing.contactErrorRetry': 'Erreur, veuillez réessayer',
      'common.loading': 'Chargement...',
    }
    return translations[key] || key
  },
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('ContactSellerButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    global.fetch = jest.fn()
  })

  it('renders button with correct text', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    expect(screen.getByText('Contacter le vendeur')).toBeInTheDocument()
  })

  it('shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
    })

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    })

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    const button = screen.getByText('Contacter le vendeur')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/listings/listing-1')
  })

  it('contacts seller successfully', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        redirectUrl: '/dashboard/messages?userId=seller-1',
      }),
    })

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    const button = screen.getByText('Contacter le vendeur')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/listings/listing-1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/messages?userId=seller-1')
    })
  })

  it('shows error when API call fails', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })

    window.alert = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to contact seller' }),
    })

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    const button = screen.getByText('Contacter le vendeur')
    fireEvent.click(button)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled()
    })
  })

  it('shows contacting state during API call', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })

    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({}),
      }), 100))
    )

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    const button = screen.getByText('Contacter le vendeur')
    fireEvent.click(button)

    // Should show contacting state
    await waitFor(() => {
      expect(screen.getByText('Contact en cours...')).toBeInTheDocument()
    })
  })

  it('handles network errors', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })

    window.alert = jest.fn()
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(
      <ContactSellerButton listingId="listing-1" sellerId="seller-1" />
    )

    const button = screen.getByText('Contacter le vendeur')
    fireEvent.click(button)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled()
    })
  })
})

