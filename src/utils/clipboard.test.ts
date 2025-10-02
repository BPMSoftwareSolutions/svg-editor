import { describe, it, expect } from 'vitest'
import {
  serializeElement,
  deserializeElement,
  generateUniqueId,
  updateElementIds,
  calculatePasteOffset,
  applyPositionOffset,
} from './clipboard'

describe('Clipboard Utilities', () => {
  describe('serializeElement', () => {
    it('should serialize a simple rect element', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '10')
      rect.setAttribute('y', '20')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '50')
      rect.setAttribute('fill', 'red')
      rect.id = 'test-rect'

      const serialized = serializeElement(rect)

      expect(serialized.tagName).toBe('rect')
      expect(serialized.id).toBe('test-rect')
      expect(serialized.attributes.x).toBe('10')
      expect(serialized.attributes.y).toBe('20')
      expect(serialized.attributes.width).toBe('100')
      expect(serialized.attributes.height).toBe('50')
      expect(serialized.attributes.fill).toBe('red')
      expect(serialized.outerHTML).toContain('<rect')
    })

    it('should serialize a circle element', () => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', '50')
      circle.setAttribute('cy', '50')
      circle.setAttribute('r', '25')
      circle.setAttribute('fill', 'blue')

      const serialized = serializeElement(circle)

      expect(serialized.tagName).toBe('circle')
      expect(serialized.attributes.cx).toBe('50')
      expect(serialized.attributes.cy).toBe('50')
      expect(serialized.attributes.r).toBe('25')
    })

    it('should serialize a group with children', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(10, 20)')
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', '100')
      rect.setAttribute('height', '50')
      group.appendChild(rect)

      const serialized = serializeElement(group)

      expect(serialized.tagName).toBe('g')
      expect(serialized.attributes.transform).toBe('translate(10, 20)')
      expect(serialized.outerHTML).toContain('<rect')
    })
  })

  describe('deserializeElement', () => {
    it('should deserialize a rect element', () => {
      const serialized = {
        outerHTML: '<rect x="10" y="20" width="100" height="50" fill="red" id="test-rect"/>',
        tagName: 'rect',
        id: 'test-rect',
        attributes: { x: '10', y: '20', width: '100', height: '50', fill: 'red', id: 'test-rect' },
      }

      const element = deserializeElement(serialized)

      expect(element.tagName.toLowerCase()).toBe('rect')
      expect(element.getAttribute('x')).toBe('10')
      expect(element.getAttribute('y')).toBe('20')
      expect(element.getAttribute('width')).toBe('100')
      expect(element.getAttribute('height')).toBe('50')
      expect(element.getAttribute('fill')).toBe('red')
    })

    it('should deserialize a group with children', () => {
      const serialized = {
        outerHTML: '<g transform="translate(10, 20)"><rect width="100" height="50"/></g>',
        tagName: 'g',
        id: null,
        attributes: { transform: 'translate(10, 20)' },
      }

      const element = deserializeElement(serialized)

      expect(element.tagName.toLowerCase()).toBe('g')
      expect(element.getAttribute('transform')).toBe('translate(10, 20)')
      expect(element.children.length).toBe(1)
      expect(element.children[0].tagName.toLowerCase()).toBe('rect')
    })
  })

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^element-/)
      expect(id2).toMatch(/^element-/)
    })

    it('should use custom prefix', () => {
      const id = generateUniqueId('custom')

      expect(id).toMatch(/^custom-/)
    })
  })

  describe('updateElementIds', () => {
    it('should update element ID', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.id = 'original-id'

      updateElementIds(rect)

      expect(rect.id).not.toBe('original-id')
      expect(rect.id).toMatch(/^pasted-/)
    })

    it('should update IDs in children', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.id = 'group-id'
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.id = 'rect-id'
      group.appendChild(rect)

      updateElementIds(group)

      expect(group.id).not.toBe('group-id')
      expect(rect.id).not.toBe('rect-id')
      expect(group.id).toMatch(/^pasted-/)
      expect(rect.id).toMatch(/^pasted-/)
    })

    it('should update url() references', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.id = 'rect-id'
      rect.setAttribute('fill', 'url(#gradient-id)')

      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
      gradient.id = 'gradient-id'

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.appendChild(gradient)
      group.appendChild(rect)

      updateElementIds(group)

      const fillValue = rect.getAttribute('fill') || ''
      expect(fillValue).toMatch(/^url\(#pasted-/)
      expect(fillValue).not.toContain('gradient-id')
    })
  })

  describe('calculatePasteOffset', () => {
    it('should return base offset for first paste', () => {
      const offset = calculatePasteOffset(0)

      expect(offset.x).toBe(10)
      expect(offset.y).toBe(10)
    })

    it('should return incremental offset for multiple pastes', () => {
      const offset1 = calculatePasteOffset(0)
      const offset2 = calculatePasteOffset(1)
      const offset3 = calculatePasteOffset(2)

      expect(offset2.x).toBeGreaterThan(offset1.x)
      expect(offset2.y).toBeGreaterThan(offset1.y)
      expect(offset3.x).toBeGreaterThan(offset2.x)
      expect(offset3.y).toBeGreaterThan(offset2.y)
    })
  })

  describe('applyPositionOffset', () => {
    it('should offset rect position', () => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', '10')
      rect.setAttribute('y', '20')

      applyPositionOffset(rect, 5, 10)

      expect(rect.getAttribute('x')).toBe('15')
      expect(rect.getAttribute('y')).toBe('30')
    })

    it('should offset circle position', () => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', '50')
      circle.setAttribute('cy', '60')

      applyPositionOffset(circle, 10, 20)

      expect(circle.getAttribute('cx')).toBe('60')
      expect(circle.getAttribute('cy')).toBe('80')
    })

    it('should offset line position', () => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', '10')
      line.setAttribute('y1', '20')
      line.setAttribute('x2', '100')
      line.setAttribute('y2', '200')

      applyPositionOffset(line, 5, 10)

      expect(line.getAttribute('x1')).toBe('15')
      expect(line.getAttribute('y1')).toBe('30')
      expect(line.getAttribute('x2')).toBe('105')
      expect(line.getAttribute('y2')).toBe('210')
    })

    it('should offset group with transform', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('transform', 'translate(10, 20) scale(1.5)')

      applyPositionOffset(group, 5, 10)

      const transform = group.getAttribute('transform') || ''
      expect(transform).toContain('translate(15, 30)')
      expect(transform).toContain('scale(1.5)')
    })

    it('should add translate to group without transform', () => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')

      applyPositionOffset(group, 10, 20)

      expect(group.getAttribute('transform')).toBe('translate(10, 20)')
    })
  })
})

