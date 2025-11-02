import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchBar } from '@/components/features/SearchBar'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock next/navigation
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams('?category=test')

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, Record<string, string>> = {
      search: {
        placeholder: 'Rechercher...',
        searchButton: 'Rechercher',
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
  trackSearch: jest.fn(),
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockSearchParams.delete('q')
    mockSearchParams.delete('category')
    mockSearchParams.delete('city')
    mockSearchParams.delete('type')
  })

  it('renders search input with placeholder', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument()
  })

  it('renders custom placeholder when provided', () => {
    render(<SearchBar placeholder="Search products..." />)
    
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('handles user input', async () => {
    const user = { type: jest.fn() }
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input.value).toBe('test query')
  })

  it('submits search on form submit', async () => {
    const { trackSearch } = require('@/lib/analytics')
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'mangues' } })
    
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })

    expect(trackSearch).toHaveBeenCalledWith('mangues', expect.any(Object))
  })

  it('tracks search with filters', async () => {
    const { trackSearch } = require('@/lib/analytics')
    mockSearchParams.set('category', 'fruits')
    mockSearchParams.set('city', 'Bissau')

    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(trackSearch).toHaveBeenCalledWith('test', {
        category: 'fruits',
        city: 'Bissau',
        type: undefined,
      })
    })
  })

  it('calls onSearch callback when provided', () => {
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const form = input.closest('form')
    fireEvent.submit(form!)

    expect(onSearch).toHaveBeenCalledWith('test')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows clear button when input has value', () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByRole('button', { name: '' })
    expect(clearButton).toBeInTheDocument()
  })

  it('clears input when clear button is clicked', () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByRole('button', { name: '' })
    fireEvent.click(clearButton)
    
    expect(input.value).toBe('')
  })

  it('navigates to search page with query', async () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'mangues' } })
    
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=mangues')
    })
  })

  it('preserves existing filters when navigating', async () => {
    mockSearchParams.set('category', 'fruits')
    mockSearchParams.set('type', 'SELL')

    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Rechercher...')
    fireEvent.change(input, { target: { value: 'test' } })
    
    const form = input.closest('form')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('category=fruits')
      )
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('type=SELL')
      )
    })
  })
})

