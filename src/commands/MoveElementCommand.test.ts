import { describe, it, expect, beforeEach } from 'vitest'
import { MoveElementCommand } from './MoveElementCommand'

describe('MoveElementCommand', () => {
  let svg: SVGSVGElement
  let rect: SVGRectElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('id', 'test-rect')
    svg.appendChild(rect)
    document.body.appendChild(svg)
  })

  it('should move element by delta', () => {
    const command = new MoveElementCommand(rect, 10, 20, 1)
    
    command.execute()
    
    const transform = rect.getAttribute('transform')
    expect(transform).toContain('translate(10, 20)')
  })

  it('should undo move operation', () => {
    const command = new MoveElementCommand(rect, 10, 20, 1)

    command.execute()
    expect(rect.getAttribute('transform')).toContain('translate(10, 20)')

    command.undo()
    const transform = rect.getAttribute('transform')
    expect(transform).toBe(null)
  })

  it('should handle existing transform', () => {
    rect.setAttribute('transform', 'translate(5, 5)')
    
    const command = new MoveElementCommand(rect, 10, 20, 1)
    command.execute()
    
    const transform = rect.getAttribute('transform')
    expect(transform).toContain('translate(15, 25)')
  })

  it('should move multiple elements', () => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    svg.appendChild(circle)
    
    const command = new MoveElementCommand([rect, circle], 10, 20, 1)
    command.execute()
    
    expect(rect.getAttribute('transform')).toContain('translate(10, 20)')
    expect(circle.getAttribute('transform')).toContain('translate(10, 20)')
  })

  it('should undo multiple element moves', () => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    svg.appendChild(circle)

    const command = new MoveElementCommand([rect, circle], 10, 20, 1)
    command.execute()
    command.undo()

    expect(rect.getAttribute('transform')).toBe(null)
    expect(circle.getAttribute('transform')).toBe(null)
  })

  it('should have correct description for single element', () => {
    const command = new MoveElementCommand(rect, 10, 20, 1)
    expect(command.description).toBe('Move rect')
  })

  it('should have correct description for multiple elements', () => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    const command = new MoveElementCommand([rect, circle], 10, 20, 1)
    expect(command.description).toBe('Move 2 elements')
  })

  it('should handle scale factor', () => {
    const command = new MoveElementCommand(rect, 20, 40, 2)
    command.execute()
    
    const transform = rect.getAttribute('transform')
    // Delta should be divided by scale: 20/2 = 10, 40/2 = 20
    expect(transform).toContain('translate(10, 20)')
  })

  it('should handle redo after undo', () => {
    const command = new MoveElementCommand(rect, 10, 20, 1)

    command.execute()
    const afterExecute = rect.getAttribute('transform')

    command.undo()
    expect(rect.getAttribute('transform')).toBe(null)

    command.execute()
    expect(rect.getAttribute('transform')).toBe(afterExecute)
  })
})

