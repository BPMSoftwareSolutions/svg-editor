import { describe, it, expect } from 'vitest'
import { parseTransform, serializeTransform, applyScale, updateScale } from './transform'

describe('Transform Utilities', () => {
  describe('parseTransform', () => {
    it('should parse empty transform string', () => {
      const result = parseTransform('')
      expect(result).toEqual({
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
      })
    })

    it('should parse single translate', () => {
      const result = parseTransform('translate(100, 50)')
      expect(result.translateX).toBe(100)
      expect(result.translateY).toBe(50)
    })

    it('should parse single scale', () => {
      const result = parseTransform('scale(1.5)')
      expect(result.scaleX).toBe(1.5)
      expect(result.scaleY).toBe(1.5)
    })

    it('should parse scale with different x and y', () => {
      const result = parseTransform('scale(1.5, 2)')
      expect(result.scaleX).toBe(1.5)
      expect(result.scaleY).toBe(2)
    })

    it('should parse single rotate', () => {
      const result = parseTransform('rotate(45)')
      expect(result.rotate).toBe(45)
    })

    it('should parse combined transforms', () => {
      const result = parseTransform('translate(100, 50) scale(1.5) rotate(45)')
      expect(result.translateX).toBe(100)
      expect(result.translateY).toBe(50)
      expect(result.scaleX).toBe(1.5)
      expect(result.scaleY).toBe(1.5)
      expect(result.rotate).toBe(45)
    })

    it('should compose multiple translate transforms by summing', () => {
      const result = parseTransform('translate(100, 50) translate(20, 30)')
      expect(result.translateX).toBe(120)
      expect(result.translateY).toBe(80)
    })

    it('should compose multiple scale transforms by multiplying', () => {
      const result = parseTransform('scale(1.5) scale(2)')
      expect(result.scaleX).toBe(3)
      expect(result.scaleY).toBe(3)
    })

    it('should compose multiple scale transforms with different x and y', () => {
      const result = parseTransform('scale(1.5, 2) scale(2, 1.5)')
      expect(result.scaleX).toBe(3)
      expect(result.scaleY).toBe(3)
    })

    it('should compose multiple rotate transforms by summing', () => {
      const result = parseTransform('rotate(45) rotate(30)')
      expect(result.rotate).toBe(75)
    })

    it('should handle complex multi-transform composition', () => {
      const result = parseTransform('translate(100, 50) scale(1.5) rotate(10) scale(1.2, 1.2)')
      expect(result.translateX).toBe(100)
      expect(result.translateY).toBe(50)
      expect(result.scaleX).toBeCloseTo(1.8, 5) // 1.5 * 1.2
      expect(result.scaleY).toBeCloseTo(1.8, 5) // 1.5 * 1.2
      expect(result.rotate).toBe(10)
    })

    it('should handle asset group transforms', () => {
      const result = parseTransform('translate(100, 50) scale(1.5) rotate(10)')
      expect(result.translateX).toBe(100)
      expect(result.translateY).toBe(50)
      expect(result.scaleX).toBe(1.5)
      expect(result.scaleY).toBe(1.5)
      expect(result.rotate).toBe(10)
    })
  })

  describe('serializeTransform', () => {
    it('should serialize identity transform to empty string', () => {
      const result = serializeTransform({
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
      })
      expect(result).toBe('')
    })

    it('should serialize translate only', () => {
      const result = serializeTransform({
        translateX: 100,
        translateY: 50,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
      })
      expect(result).toBe('translate(100, 50)')
    })

    it('should serialize scale only', () => {
      const result = serializeTransform({
        translateX: 0,
        translateY: 0,
        scaleX: 1.5,
        scaleY: 2,
        rotate: 0,
      })
      expect(result).toBe('scale(1.5, 2)')
    })

    it('should serialize rotate only', () => {
      const result = serializeTransform({
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 45,
      })
      expect(result).toBe('rotate(45)')
    })

    it('should serialize combined transforms in correct order', () => {
      const result = serializeTransform({
        translateX: 100,
        translateY: 50,
        scaleX: 1.5,
        scaleY: 1.5,
        rotate: 45,
      })
      expect(result).toBe('translate(100, 50) scale(1.5, 1.5) rotate(45)')
    })
  })

  describe('parseTransform and serializeTransform round-trip', () => {
    it('should maintain transform values through parse and serialize', () => {
      const original = 'translate(100, 50) scale(1.5, 2) rotate(45)'
      const parsed = parseTransform(original)
      const serialized = serializeTransform(parsed)
      const reparsed = parseTransform(serialized)
      
      expect(reparsed).toEqual(parsed)
    })

    it('should compose multiple scales correctly through round-trip', () => {
      const original = 'translate(100, 50) scale(1.5) rotate(10) scale(1.2)'
      const parsed = parseTransform(original)

      // Should have composed scales: 1.5 * 1.2 = 1.8
      expect(parsed.scaleX).toBeCloseTo(1.8, 5)
      expect(parsed.scaleY).toBeCloseTo(1.8, 5)

      const serialized = serializeTransform(parsed)
      const reparsed = parseTransform(serialized)

      expect(reparsed.scaleX).toBeCloseTo(1.8, 5)
      expect(reparsed.scaleY).toBeCloseTo(1.8, 5)
    })
  })

  describe('updateScale', () => {
    it('should replace scale in transform string', () => {
      const original = 'translate(100, 50) scale(1.5) rotate(10)'
      const result = updateScale(original, 2, 2)
      const parsed = parseTransform(result)
      
      expect(parsed.translateX).toBe(100)
      expect(parsed.translateY).toBe(50)
      expect(parsed.scaleX).toBe(2)
      expect(parsed.scaleY).toBe(2)
      expect(parsed.rotate).toBe(10)
    })

    it('should replace composed scales with new scale', () => {
      const original = 'translate(100, 50) scale(1.5) rotate(10) scale(1.2)'
      const result = updateScale(original, 3, 3)
      const parsed = parseTransform(result)
      
      // Should replace the composed scale (1.8) with new scale (3)
      expect(parsed.scaleX).toBe(3)
      expect(parsed.scaleY).toBe(3)
    })

    it('should add scale to transform without scale', () => {
      const original = 'translate(100, 50) rotate(10)'
      const result = updateScale(original, 2, 2.5)
      const parsed = parseTransform(result)
      
      expect(parsed.translateX).toBe(100)
      expect(parsed.translateY).toBe(50)
      expect(parsed.scaleX).toBe(2)
      expect(parsed.scaleY).toBe(2.5)
      expect(parsed.rotate).toBe(10)
    })
  })

  describe('Group Element Resizing Scenarios', () => {
    it('should handle resizing a group with existing transforms', () => {
      // Simulate a group element with initial transform
      const initialTransform = 'translate(100, 50) scale(1.5) rotate(10)'
      const parsed = parseTransform(initialTransform)

      // Simulate resize operation: scale by 1.2
      parsed.scaleX *= 1.2
      parsed.scaleY *= 1.2

      const newTransform = serializeTransform(parsed)
      const reparsed = parseTransform(newTransform)

      // Should have composed scale: 1.5 * 1.2 = 1.8
      expect(reparsed.scaleX).toBeCloseTo(1.8, 5)
      expect(reparsed.scaleY).toBeCloseTo(1.8, 5)
      expect(reparsed.translateX).toBe(100)
      expect(reparsed.translateY).toBe(50)
      expect(reparsed.rotate).toBe(10)
    })

    it('should handle multiple resize operations on same group', () => {
      let transform = 'translate(100, 50) scale(1.5) rotate(10)'
      
      // First resize: scale by 1.2
      let parsed = parseTransform(transform)
      parsed.scaleX *= 1.2
      parsed.scaleY *= 1.2
      transform = serializeTransform(parsed)
      
      // Second resize: scale by 0.8
      parsed = parseTransform(transform)
      parsed.scaleX *= 0.8
      parsed.scaleY *= 0.8
      transform = serializeTransform(parsed)
      
      const final = parseTransform(transform)
      
      // Should have composed scale: 1.5 * 1.2 * 0.8 = 1.44
      expect(final.scaleX).toBeCloseTo(1.44, 5)
      expect(final.scaleY).toBeCloseTo(1.44, 5)
    })
  })
})

