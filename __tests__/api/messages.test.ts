/**
 * Integration tests for messages API routes
 */

import { POST } from '@/app/api/messages/route'
import { GET } from '@/app/api/messages/route'
import { messageSchema } from '@/lib/validations'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    message: {
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

describe('Messages API', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'sender@example.com',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/messages', () => {
    it('should validate message schema', () => {
      const validData = {
        content: 'Hello, I am interested in your product',
        receiverId: 'user-2',
      }

      const result = messageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
        receiverId: 'user-2',
      }

      const result = messageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Hello',
          receiverId: 'user-2',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non authentifié')
    })

    it('should create message successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockMessage = {
        id: 'msg-1',
        content: 'Hello',
        senderId: 'user-1',
        receiverId: 'user-2',
        listingId: null,
        createdAt: new Date(),
        sender: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
        receiver: {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      }

      prisma.message.create.mockResolvedValue(mockMessage)

      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Hello',
          receiverId: 'user-2',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.content).toBe('Hello')
      expect(data.senderId).toBe('user-1')
      expect(prisma.message.create).toHaveBeenCalled()
    })

    it('should include listingId when provided', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockMessage = {
        id: 'msg-1',
        content: 'Hello',
        senderId: 'user-1',
        receiverId: 'user-2',
        listingId: 'listing-1',
      }

      prisma.message.create.mockResolvedValue(mockMessage)

      const request = new Request('http://localhost/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'Hello',
          receiverId: 'user-2',
          listingId: 'listing-1',
        }),
      })

      await POST(request)

      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            listingId: 'listing-1',
          }),
        })
      )
    })
  })

  describe('GET /api/messages', () => {
    it('should require authentication', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost/api/messages', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Non authentifié')
    })

    it('should return user conversations', async () => {
      getServerSession.mockResolvedValue(mockSession)

      const mockConversations = [
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          lastMessage: {
            content: 'Hello',
            createdAt: new Date(),
          },
          unreadCount: 2,
        },
      ]

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        messages: [],
        receivedMessages: [],
      })

      prisma.message.findMany.mockResolvedValue([])

      const request = new Request('http://localhost/api/messages', {
        method: 'GET',
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(prisma.message.findMany).toHaveBeenCalled()
    })
  })
})

