import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { FavoriteButton } from '@/components/features/FavoriteButton'
import { useAuth } from '@/hooks/useAuth'

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, Record<string, string>> = {
      listing: {
        favorite: 'Ajouter aux favoris',
        unfavorite: 'Retirer des favoris',
        favoriteError: 'Erreur lors de l\'ajout',
        unfavoriteError: 'Erreur lors de la suppression',
      },
      common: {
        error: 'Erreur',
        loading: 'Chargement...',
      },
    }
    
    return (key: string) => {
      if (namespace && translations[namespace]) {
        return translations[namespace][key] || key
      }
      return key
    }
  },
}))

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  EVENTS: {
    FAVORITE_ADDED: 'favorite_added',
  },
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: authenticated user
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'user-1', email: 'test@example.com' },
    })
    
    // Reset fetch mock
    global.fetch = jest.fn()
    
    // Default successful fetch response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ isFavorite: false }),
    })
  })

  it('renders favorite button when authenticated', async () => {
    render(<FavoriteButton listingId="listing-1" variant="button" />)
    
    await waitFor(() => {
      expect(screen.getByText('Ajouter aux favoris')).toBeInTheDocument()
    })
  })

  it('renders icon variant correctly', async () => {
    render(<FavoriteButton listingId="listing-1" variant="icon" />)
    
    await waitFor(() => {
      const button = screen.getByRole('button', { hidden: true })
      expect(button).toBeInTheDocument()
    })
  })

  it('shows unfavorite when already favorited', () => {
    render(<FavoriteButton listingId="listing-1" initialIsFavorite={true} variant="button" />)
    
    expect(screen.getByText('Retirer des favoris')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    })

    delete (window as any).location
    window.location = { ...window.location, href: '' }

    render(<FavoriteButton listingId="listing-1" variant="button" />)
    
    const button = await screen.findByText('Ajouter aux favoris')
    fireEvent.click(button)

    expect(window.location.href).toBe('/login')
  })

  it('adds favorite on click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<FavoriteButton listingId="listing-1" variant="button" />)
    
    const button = await screen.findByText('Ajouter aux favoris')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'listing-1' }),
      })
    })
  })

  it('removes favorite on click when already favorited', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<FavoriteButton listingId="listing-1" initialIsFavorite={true} variant="button" />)
    
    const button = screen.getByText('Retirer des favoris')
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/listing-1', {
        method: 'DELETE',
      })
    })
  })

  it('shows error when API call fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to add favorite' }),
    })

    window.alert = jest.fn()

    render(<FavoriteButton listingId="listing-1" variant="button" />)
    
    const button = await screen.findByText('Ajouter aux favoris')
    fireEvent.click(button)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled()
    })
  })

  it('handles loading state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    )

    render(<FavoriteButton listingId="listing-1" variant="button" />)
    
    const button = await screen.findByText('Ajouter aux favoris')
    fireEvent.click(button)

    // Button should be disabled during loading
    expect(button.closest('button')).toBeDisabled()
  })

  it('calls onToggle callback', async () => {
    const onToggle = jest.fn()
    // Override default fetch mock for this test
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<FavoriteButton listingId="listing-1" onToggle={onToggle} variant="button" />)
    
    const button = await screen.findByText('Ajouter aux favoris')
    fireEvent.click(button)

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(true)
    })
  })
})

