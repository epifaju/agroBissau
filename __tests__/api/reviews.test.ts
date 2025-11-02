/**
 * Integration tests for reviews API routes
 */

import { POST } from '@/app/api/reviews/route'
import { GET } from '@/app/api/reviews/route'
import { reviewSchema } from '@/lib/validations'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    review: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const { getServerSession } = require('next-auth')
const { prisma } = require('@/lib/db')

describe('Reviews API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'reviewer@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/reviews', () => {
    it('should validate review schema', () => {
      const validData = {
        rating: 5,
        comment: 'Great product! Highly recommended.',
        reviewedId: 'user-2',
        listingId: 'listing-1',
      }

      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject rating out of range', () => {
      const invalidData = {
        rating: 6, // Should be 1-5
        reviewedId: 'user-2',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          reviewedId: 'user-2',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non authentifié')
    })

    it('should prevent self-review', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const request = new Request('http://localhost/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          reviewedId: 'user-1', // Same as reviewer
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('vous-même')
    })

    it('should prevent duplicate reviews', async () => {
      getServerSession.mockResolvedValue(mockSession)

      prisma.review.findFirst.mockResolvedValue({
        id: 'review-1',
        reviewerId: 'user-1',
        reviewedId: 'user-2',
      })

      const request = new Request('http://localhost/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          reviewedId: 'user-2',
          listingId: 'listing-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('déjà évalué')
    })

    it('should create review successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)

      prisma.review.findFirst.mockResolvedValue(null) // No existing review
      const mockReview = {
        id: 'review-1',
        rating: 5,
        comment: 'Great!',
        reviewerId: 'user-1',
        reviewedId: 'user-2',
        listingId: 'listing-1',
        createdAt: new Date(),
        reviewer: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      }

      prisma.review.create.mockResolvedValue(mockReview)

      const request = new Request('http://localhost/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          comment: 'Great!',
          reviewedId: 'user-2',
          listingId: 'listing-1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.rating).toBe(5)
      expect(prisma.review.create).toHaveBeenCalled()
    })
  })

  describe('GET /api/reviews', () => {
    it('should return reviews for a user', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great!',
          reviewer: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
          },
          listing: {
            id: 'listing-1',
            title: 'Test Product',
          },
        },
      ]

      prisma.review.findMany.mockResolvedValue(mockReviews)

      const request = new Request('http://localhost/api/reviews?userId=user-2', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(prisma.review.findMany).toHaveBeenCalled()
    })

    it('should filter reviews by listingId', async () => {
      const request = new Request(
        'http://localhost/api/reviews?userId=user-2&listingId=listing-1',
        {
          method: 'GET',
        }
      )

      await GET(request)

      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            listingId: 'listing-1',
          }),
        })
      )
    })
  })
})

