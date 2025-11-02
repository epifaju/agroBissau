import { z } from 'zod'
import {
  registerSchema,
  loginSchema,
  listingSchema,
  reviewSchema,
  messageSchema,
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+245123456789',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 caractères')
      }
    })

    it('rejects short firstName', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'J',
        lastName: 'Doe',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('allows optional phone', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('listingSchema', () => {
    const validListing = {
      title: 'Test Product Title',
      description: 'This is a test product description with enough characters',
      price: 1000,
      unit: 'kg',
      quantity: 10,
      categoryId: 'cat-123',
      type: 'SELL' as const,
      images: ['image1.jpg'],
      location: {
        city: 'Bissau',
      },
    }

    it('validates correct listing data', () => {
      const result = listingSchema.safeParse(validListing)
      expect(result.success).toBe(true)
    })

    it('rejects short title', () => {
      const invalidData = {
        ...validListing,
        title: 'Short',
      }

      const result = listingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short description', () => {
      const invalidData = {
        ...validListing,
        description: 'Too short',
      }

      const result = listingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects negative price', () => {
      const invalidData = {
        ...validListing,
        price: -100,
      }

      const result = listingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects zero quantity', () => {
      const invalidData = {
        ...validListing,
        quantity: 0,
      }

      const result = listingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects empty images array', () => {
      const invalidData = {
        ...validListing,
        images: [],
      }

      const result = listingSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('validates promotion fields', () => {
      const listingWithPromo = {
        ...validListing,
        originalPrice: 1500,
        discountPercent: 33,
        price: 1000,
      }

      const result = listingSchema.safeParse(listingWithPromo)
      expect(result.success).toBe(true)
    })

    it('rejects invalid promotion (originalPrice < price)', () => {
      const invalidPromo = {
        ...validListing,
        originalPrice: 500, // Less than price
        discountPercent: 50,
        price: 1000,
      }

      const result = listingSchema.safeParse(invalidPromo)
      expect(result.success).toBe(false)
    })

    it('rejects invalid discount percent', () => {
      const invalidPromo = {
        ...validListing,
        originalPrice: 1500,
        discountPercent: 150, // > 100
        price: 1000,
      }

      const result = listingSchema.safeParse(invalidPromo)
      expect(result.success).toBe(false)
    })
  })

  describe('reviewSchema', () => {
    it('validates correct review data', () => {
      const validData = {
        rating: 5,
        comment: 'This is a great product with enough characters',
        reviewedId: 'user-123',
        listingId: 'listing-123',
      }

      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects rating below 1', () => {
      const invalidData = {
        rating: 0,
        reviewedId: 'user-123',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects rating above 5', () => {
      const invalidData = {
        rating: 6,
        reviewedId: 'user-123',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects short comment', () => {
      const invalidData = {
        rating: 5,
        comment: 'Short',
        reviewedId: 'user-123',
      }

      const result = reviewSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('allows comment to be optional', () => {
      const validData = {
        rating: 5,
        reviewedId: 'user-123',
      }

      const result = reviewSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('messageSchema', () => {
    it('validates correct message data', () => {
      const validData = {
        content: 'Hello, I am interested in your product',
        receiverId: 'user-123',
        listingId: 'listing-123',
      }

      const result = messageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty content', () => {
      const invalidData = {
        content: '',
        receiverId: 'user-123',
      }

      const result = messageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('allows listingId to be optional', () => {
      const validData = {
        content: 'Hello',
        receiverId: 'user-123',
      }

      const result = messageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

