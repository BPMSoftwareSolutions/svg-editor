import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteElementCommand } from './DeleteElementCommand'

describe('DeleteElementCommand', () => {
  let svg: SVGSVGElement
  let rect: SVGRectElement
  let circle: SVGCircleElement

  beforeEach(() => {
    // Create a test SVG with elements
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    
    rect.setAttribute('id', 'test-rect')
    circle.setAttribute('id', 'test-circle')
    
    svg.appendChild(rect)
    svg.appendChild(circle)
    document.body.appendChild(svg)
  })

  it('should delete a single element', () => {
    const command = new DeleteElementCommand(rect)
    
    expect(svg.contains(rect)).toBe(true)
    
    command.execute()
    
    expect(svg.contains(rect)).toBe(false)
    expect(svg.children.length).toBe(1)
  })

  it('should restore a deleted element on undo', () => {
    const command = new DeleteElementCommand(rect)
    
    command.execute()
    expect(svg.contains(rect)).toBe(false)
    
    command.undo()
    expect(svg.contains(rect)).toBe(true)
    expect(svg.children.length).toBe(2)
  })

  it('should delete multiple elements', () => {
    const command = new DeleteElementCommand([rect, circle])
    
    expect(svg.children.length).toBe(2)
    
    command.execute()
    
    expect(svg.children.length).toBe(0)
    expect(svg.contains(rect)).toBe(false)
    expect(svg.contains(circle)).toBe(false)
  })

  it('should restore multiple deleted elements on undo', () => {
    const command = new DeleteElementCommand([rect, circle])
    
    command.execute()
    expect(svg.children.length).toBe(0)
    
    command.undo()
    expect(svg.children.length).toBe(2)
    expect(svg.contains(rect)).toBe(true)
    expect(svg.contains(circle)).toBe(true)
  })

  it('should restore elements in correct order', () => {
    const command = new DeleteElementCommand([rect, circle])
    
    command.execute()
    command.undo()
    
    expect(svg.children[0]).toBe(rect)
    expect(svg.children[1]).toBe(circle)
  })

  it('should have correct description for single element', () => {
    const command = new DeleteElementCommand(rect)
    expect(command.description).toBe('Delete rect')
  })

  it('should have correct description for multiple elements', () => {
    const command = new DeleteElementCommand([rect, circle])
    expect(command.description).toBe('Delete 2 elements')
  })

  it('should handle redo after undo', () => {
    const command = new DeleteElementCommand(rect)
    
    command.execute()
    expect(svg.contains(rect)).toBe(false)
    
    command.undo()
    expect(svg.contains(rect)).toBe(true)
    
    command.execute()
    expect(svg.contains(rect)).toBe(false)
  })
})

