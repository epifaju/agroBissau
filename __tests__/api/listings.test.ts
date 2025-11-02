/**
 * Integration tests for listings API routes
 */

import { GET, POST } from '@/app/api/listings/route'
import { listingSchema } from '@/lib/validations'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    listing: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  },
}))

const { getServerSession } = require('next-auth')
const { prisma } = require('@/lib/db')

describe('Listings API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/listings', () => {
    it('should return listings with pagination', async () => {
      const mockListings = [
        {
          id: 'listing-1',
          title: 'Test Product',
          price: 1000,
          status: 'ACTIVE',
        },
      ]

      prisma.listing.findMany.mockResolvedValue(mockListings)
      prisma.listing.count.mockResolvedValue(1)

      const request = new Request('http://localhost/api/listings?page=1&limit=20', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.listings).toBeDefined()
      expect(data.total).toBe(1)
      expect(data.page).toBe(1)
      expect(prisma.listing.findMany).toHaveBeenCalled()
    })

    it('should filter by category', async () => {
      prisma.listing.findMany.mockResolvedValue([])
      prisma.listing.count.mockResolvedValue(0)

      const request = new Request('http://localhost/api/listings?category=cat-1', {
        method: 'GET',
      })

      await GET(request)

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      )
    })

    it('should filter by search query', async () => {
      prisma.listing.findMany.mockResolvedValue([])
      prisma.listing.count.mockResolvedValue(0)

      const request = new Request('http://localhost/api/listings?q=mangues', {
        method: 'GET',
      })

      await GET(request)

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  expect.objectContaining({
                    title: expect.objectContaining({
                      contains: 'mangues',
                    }),
                  }),
                ]),
              }),
            ]),
          }),
        })
      )
    })

    it('should sort by newest by default', async () => {
      prisma.listing.findMany.mockResolvedValue([])
      prisma.listing.count.mockResolvedValue(0)

      const request = new Request('http://localhost/api/listings', {
        method: 'GET',
      })

      await GET(request)

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('POST /api/listings', () => {
    it('should validate listing schema', () => {
      const validListing = {
        title: 'Test Product Title',
        description: 'This is a test product description with enough characters',
        price: 1000,
        unit: 'kg',
        quantity: 10,
        categoryId: 'cat-1',
        type: 'SELL',
        images: ['image1.jpg'],
        location: {
          city: 'Bissau',
        },
      }

      const result = listingSchema.safeParse(validListing)
      expect(result.success).toBe(true)
    })

    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test',
          description: 'Test description with enough characters',
          price: 1000,
          unit: 'kg',
          quantity: 10,
          categoryId: 'cat-1',
          type: 'SELL',
          images: ['image1.jpg'],
          location: { city: 'Bissau' },
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non authentifié')
    })

    it('should create listing successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockListing = {
        id: 'listing-1',
        title: 'Test Product',
        price: 1000,
        userId: 'user-1',
      }

      prisma.listing.create.mockResolvedValue(mockListing)

      const request = new Request('http://localhost/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Product Title',
          description: 'This is a test product description with enough characters',
          price: 1000,
          unit: 'kg',
          quantity: 10,
          categoryId: 'cat-1',
          type: 'SELL',
          images: ['image1.jpg'],
          location: {
            city: 'Bissau',
          },
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('listing-1')
      expect(prisma.listing.create).toHaveBeenCalled()
    })

    it('should return validation errors', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const request = new Request('http://localhost/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Short', // Too short
          description: 'Short', // Too short
          price: -100, // Negative
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeTruthy()
      expect(prisma.listing.create).not.toHaveBeenCalled()
    })
  })
})

