import { formatPrice, formatRelativeTime, cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      // Use toMatch instead of toBe to handle whitespace variations
      expect(formatPrice(1000)).toMatch(/1\s*000\s*F\s*CFA/)
      expect(formatPrice(1000000)).toMatch(/1\s*000\s*000\s*F\s*CFA/)
      expect(formatPrice(0)).toMatch(/0\s*F\s*CFA/)
    })

    it('handles decimal prices', () => {
      expect(formatPrice(1234.56)).toMatch(/1\s*235\s*F\s*CFA/)
    })
  })

  describe('formatRelativeTime', () => {
    it('formats recent dates correctly', () => {
      const now = new Date()
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
      expect(formatRelativeTime(oneMinuteAgo)).toMatch(/[Ii]l y a.*min/i)

      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      expect(formatRelativeTime(oneHourAgo)).toMatch(/[Ii]l y a.*heur/i)
    })

    it('formats older dates correctly', () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(oneWeekAgo)
      expect(result).toBeTruthy()
    })
  })

  describe('cn (classNames)', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
      expect(cn('foo', false && 'bar')).toBe('foo')
      expect(cn('foo', true && 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      const isActive = true
      expect(cn('base', isActive && 'active')).toBe('base active')
    })
  })
})

