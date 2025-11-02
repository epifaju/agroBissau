/**
 * Integration tests for users API routes
 */

import { GET } from '@/app/api/users/me/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const { getServerSession } = require('next-auth')
const { prisma } = require('@/lib/db')

describe('Users API - /api/users/me', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users/me', () => {
    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost/api/users/me', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non authentifié')
    })

    it('should return user profile', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '+245123456789',
        role: 'MEMBER',
        subscriptionTier: 'FREE',
        verificationLevel: 0,
        location: null,
        createdAt: new Date(),
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/users/me', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('user-1')
      expect(data.email).toBe('test@example.com')
      expect(data.firstName).toBe('John')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.objectContaining({
          id: true,
          email: true,
          firstName: true,
        }),
      })
    })

    it('should return 404 if user not found', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost/api/users/me', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Utilisateur non trouvé')
    })

    it('should handle database errors', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost/api/users/me', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeTruthy()
    })
  })
})

