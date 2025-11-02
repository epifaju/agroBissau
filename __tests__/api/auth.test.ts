/**
 * Integration tests for authentication API routes
 */

import { POST as registerPOST } from '@/app/api/auth/register/route'
import { registerSchema } from '@/lib/validations'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn(),
}))

const { prisma } = require('@/lib/db')

describe('Auth API - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate registration schema', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    const result = registerSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should create user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }

    prisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
    prisma.user.create.mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await registerPOST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Compte créé avec succès')
    expect(data.userId).toBe('user-1')
    expect(prisma.user.create).toHaveBeenCalled()
  })

  it('should reject duplicate email', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
    }

    prisma.user.findUnique.mockResolvedValue(existingUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    const response = await registerPOST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('existe déjà')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should hash password before storing', async () => {
    const bcrypt = require('bcryptjs')
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
    }

    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue(mockUser)

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    await registerPOST(request)

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'hashed_password123',
        }),
      })
    )
  })

  it('should return validation errors', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'short', // Too short
        firstName: 'J', // Too short
        lastName: 'D', // Too short
      }),
    })

    const response = await registerPOST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })
})

