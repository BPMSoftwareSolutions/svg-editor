import { describe, it, expect, beforeEach } from 'vitest'
import { ResizeElementCommand } from './ResizeElementCommand'
import { parseTransform } from '../utils/transform'

describe('ResizeElementCommand', () => {
  let svgElement: SVGElement

  beforeEach(() => {
    // Create a fresh SVG element for each test
    const parser = new DOMParser()
    const doc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'image/svg+xml')
    svgElement = doc.documentElement as unknown as SVGElement
  })

  describe('Basic Element Resizing', () => {
    it('should resize a rect element', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '50')

      const command = new ResizeElementCommand(rect, 100, 50, 200, 100)
      command.execute()

      expect(rect.getAttribute('width')).toBe('200')
      expect(rect.getAttribute('height')).toBe('100')
    })

    it('should undo rect resize', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '50')

      const command = new ResizeElementCommand(rect, 100, 50, 200, 100)
      command.execute()
      command.undo()

      expect(rect.getAttribute('width')).toBe('100')
      expect(rect.getAttribute('height')).toBe('50')
    })

    it('should resize a circle element', () => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('r', '50')

      const command = new ResizeElementCommand(circle, 100, 100, 200, 200)
      command.execute()

      expect(circle.getAttribute('r')).toBe('100')
    })

    it('should resize an ellipse element', () => {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      ellipse.setAttribute('rx', '50')
      ellipse.setAttribute('ry', '25')

      const command = new ResizeElementCommand(ellipse, 100, 50, 200, 100)
      command.execute()

      expect(ellipse.getAttribute('rx')).toBe('100')
      expect(ellipse.getAttribute('ry')).toBe('50')
    })
  })

  describe('Group Element Resizing', () => {
    it('should resize a group element with no existing transform', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      const command = new ResizeElementCommand(group, 100, 100, 150, 150)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(1.5)
      expect(transform.scaleY).toBe(1.5)
    })

    it('should resize a group element with existing transform', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(100, 50) scale(1.5) rotate(10)')

      const command = new ResizeElementCommand(group, 100, 100, 120, 120)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      
      // Should compose scales: 1.5 * 1.2 = 1.8
      expect(transform.scaleX).toBeCloseTo(1.8, 5)
      expect(transform.scaleY).toBeCloseTo(1.8, 5)
      
      // Should preserve other transforms
      expect(transform.translateX).toBe(100)
      expect(transform.translateY).toBe(50)
      expect(transform.rotate).toBe(10)
    })

    it('should undo group resize and restore original transform', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const originalTransform = 'translate(100, 50) scale(1.5) rotate(10)'
      group.setAttribute('transform', originalTransform)

      const command = new ResizeElementCommand(group, 100, 100, 120, 120)
      command.execute()
      command.undo()

      expect(group.getAttribute('transform')).toBe(originalTransform)
    })

    it('should handle multiple resize operations on same group', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(100, 50) scale(1.5) rotate(10)')

      // First resize: scale by 1.2
      const command1 = new ResizeElementCommand(group, 100, 100, 120, 120)
      command1.execute()

      let transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBeCloseTo(1.8, 5) // 1.5 * 1.2

      // Second resize: scale by 0.8
      const command2 = new ResizeElementCommand(group, 120, 120, 96, 96)
      command2.execute()

      transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBeCloseTo(1.44, 5) // 1.8 * 0.8
    })

    it('should handle asset group with data attributes', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('data-asset-id', 'asset-123')
      group.setAttribute('data-asset-name', 'test-asset.svg')
      group.setAttribute('transform', 'translate(100, 50) scale(1) rotate(0)')

      const command = new ResizeElementCommand(group, 100, 100, 150, 150)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(1.5)
      expect(transform.scaleY).toBe(1.5)
      
      // Data attributes should be preserved
      expect(group.getAttribute('data-asset-id')).toBe('asset-123')
      expect(group.getAttribute('data-asset-name')).toBe('test-asset.svg')
    })

    it('should handle non-uniform scaling', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(100, 50) scale(1.5, 2) rotate(10)')

      const command = new ResizeElementCommand(group, 100, 100, 120, 150)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      
      // Should compose scales: 1.5 * 1.2 = 1.8, 2 * 1.5 = 3
      expect(transform.scaleX).toBeCloseTo(1.8, 5)
      expect(transform.scaleY).toBeCloseTo(3, 5)
    })
  })

  describe('Path Element Resizing', () => {
    it('should resize a path element using transform', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M 10 10 L 90 90')

      const command = new ResizeElementCommand(path, 100, 100, 150, 150)
      command.execute()

      const transform = parseTransform(path.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(1.5)
      expect(transform.scaleY).toBe(1.5)
    })

    it('should resize a path with existing transform', () => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M 10 10 L 90 90')
      path.setAttribute('transform', 'translate(50, 50) scale(2)')

      const command = new ResizeElementCommand(path, 100, 100, 150, 150)
      command.execute()

      const transform = parseTransform(path.getAttribute('transform') || '')
      expect(transform.scaleX).toBeCloseTo(3, 5) // 2 * 1.5
      expect(transform.scaleY).toBeCloseTo(3, 5)
      expect(transform.translateX).toBe(50)
      expect(transform.translateY).toBe(50)
    })
  })

  describe('Viewport Scale Handling', () => {
    it('should adjust dimensions for viewport scale', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '50')

      // Viewport scale of 2 means dimensions should be halved
      const command = new ResizeElementCommand(rect, 200, 100, 400, 200, 2)
      command.execute()

      expect(rect.getAttribute('width')).toBe('200')
      expect(rect.getAttribute('height')).toBe('100')
    })

    it('should handle viewport scale for group transforms', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'scale(1)')

      // With viewport scale of 2, the resize ratio should still be calculated correctly
      const command = new ResizeElementCommand(group, 200, 200, 300, 300, 2)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(1.5) // (300/2) / (200/2) = 150/100 = 1.5
      expect(transform.scaleY).toBe(1.5)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small scale factors', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'scale(1)')

      const command = new ResizeElementCommand(group, 100, 100, 10, 10)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(0.1)
      expect(transform.scaleY).toBe(0.1)
    })

    it('should handle very large scale factors', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'scale(1)')

      const command = new ResizeElementCommand(group, 100, 100, 1000, 1000)
      command.execute()

      const transform = parseTransform(group.getAttribute('transform') || '')
      expect(transform.scaleX).toBe(10)
      expect(transform.scaleY).toBe(10)
    })

    it('should have correct description', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      const command = new ResizeElementCommand(group, 100, 100, 150, 150)
      
      expect(command.description).toBe('Resize g')
    })
  })
})

