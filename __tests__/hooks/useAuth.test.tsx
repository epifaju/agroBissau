import React from 'react'
import { renderHook } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns authenticated state when user is logged in', () => {
    const mockSession = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual(mockSession.user)
  })

  it('returns unauthenticated state when user is logged out', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('returns loading state while session is loading', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })
})

