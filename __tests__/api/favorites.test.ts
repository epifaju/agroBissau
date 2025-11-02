/**
 * Integration tests for favorites API routes
 */

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    favorite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

const { getServerSession } = require('next-auth')
const { prisma } = require('@/lib/db')

describe('Favorites API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/favorites', () => {
    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      // Import dynamically to get fresh mocks
      const { POST } = await import('@/app/api/favorites/route')

      const request = new Request('http://localhost/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'listing-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
    })

    it('should add favorite successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)

      prisma.favorite.findUnique.mockResolvedValue(null) // Not already favorited
      prisma.favorite.create.mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        listingId: 'listing-1',
        createdAt: new Date(),
      })

      const { POST } = await import('@/app/api/favorites/route')

      const request = new Request('http://localhost/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'listing-1' }),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          listingId: 'listing-1',
        },
      })
    })

    it('should prevent duplicate favorites', async () => {
      getServerSession.mockResolvedValue(mockSession)

      prisma.favorite.findUnique.mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        listingId: 'listing-1',
      })

      const { POST } = await import('@/app/api/favorites/route')

      const request = new Request('http://localhost/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: 'listing-1' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
      expect(prisma.favorite.create).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/favorites/[listingId]', () => {
    it('should remove favorite successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)

      prisma.favorite.findUnique.mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        listingId: 'listing-1',
      })
      prisma.favorite.delete.mockResolvedValue({
        id: 'fav-1',
      })

      const { DELETE } = await import('@/app/api/favorites/[listingId]/route')

      const request = new Request('http://localhost/api/favorites/listing-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, {
        params: { listingId: 'listing-1' },
      })

      expect(response.status).toBe(200)
      expect(prisma.favorite.delete).toHaveBeenCalled()
    })

    it('should return 404 if favorite not found', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.favorite.findUnique.mockResolvedValue(null)

      const { DELETE } = await import('@/app/api/favorites/[listingId]/route')

      const request = new Request('http://localhost/api/favorites/listing-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, {
        params: { listingId: 'listing-1' },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/favorites', () => {
    it('should return user favorites', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockFavorites = [
        {
          id: 'fav-1',
          listingId: 'listing-1',
          listing: {
            id: 'listing-1',
            title: 'Test Product',
            price: 1000,
          },
        },
      ]

      prisma.favorite.findMany.mockResolvedValue(mockFavorites)

      const { GET } = await import('@/app/api/favorites/route')

      const request = new Request('http://localhost/api/favorites', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data.favorites)).toBe(true)
      expect(prisma.favorite.findMany).toHaveBeenCalled()
    })
  })
})

