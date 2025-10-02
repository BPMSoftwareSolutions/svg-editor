import { describe, it, expect, beforeEach } from 'vitest'
import { PasteElementCommand } from './PasteElementCommand'
import { serializeElement } from '../utils/clipboard'

describe('PasteElementCommand', () => {
  let svg: SVGSVGElement
  let rect: SVGRectElement
  let circle: SVGCircleElement

  beforeEach(() => {
    // Create a test SVG
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.appendChild(svg)

    // Create test elements
    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('id', 'test-rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '20')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '50')
    rect.setAttribute('fill', 'red')

    circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('id', 'test-circle')
    circle.setAttribute('cx', '50')
    circle.setAttribute('cy', '50')
    circle.setAttribute('r', '25')
    circle.setAttribute('fill', 'blue')
  })

  it('should paste a single element', () => {
    const serialized = [serializeElement(rect)]
    const command = new PasteElementCommand(svg, serialized, 0)

    expect(svg.children.length).toBe(0)

    command.execute()

    expect(svg.children.length).toBe(1)
    const pastedElement = svg.children[0] as SVGRectElement
    expect(pastedElement.tagName.toLowerCase()).toBe('rect')
    expect(pastedElement.getAttribute('width')).toBe('100')
    expect(pastedElement.getAttribute('height')).toBe('50')
    expect(pastedElement.getAttribute('fill')).toBe('red')
  })

  it('should paste multiple elements', () => {
    const serialized = [serializeElement(rect), serializeElement(circle)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()

    expect(svg.children.length).toBe(2)
    expect(svg.children[0].tagName.toLowerCase()).toBe('rect')
    expect(svg.children[1].tagName.toLowerCase()).toBe('circle')
  })

  it('should apply position offset to pasted elements', () => {
    const serialized = [serializeElement(rect)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()

    const pastedElement = svg.children[0] as SVGRectElement
    const x = parseFloat(pastedElement.getAttribute('x') || '0')
    const y = parseFloat(pastedElement.getAttribute('y') || '0')

    // Should have offset applied (original was 10, 20)
    expect(x).toBeGreaterThan(10)
    expect(y).toBeGreaterThan(20)
  })

  it('should generate unique IDs for pasted elements', () => {
    const serialized = [serializeElement(rect)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()

    const pastedElement = svg.children[0] as SVGRectElement
    expect(pastedElement.id).not.toBe('test-rect')
    expect(pastedElement.id).toMatch(/^pasted-/)
  })

  it('should undo paste operation', () => {
    const serialized = [serializeElement(rect), serializeElement(circle)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()
    expect(svg.children.length).toBe(2)

    command.undo()
    expect(svg.children.length).toBe(0)
  })

  it('should be able to redo after undo', () => {
    const serialized = [serializeElement(rect)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()
    expect(svg.children.length).toBe(1)

    command.undo()
    expect(svg.children.length).toBe(0)

    command.execute()
    expect(svg.children.length).toBe(1)
  })

  it('should apply incremental offset for multiple paste operations', () => {
    const serialized = [serializeElement(rect)]
    
    const command1 = new PasteElementCommand(svg, serialized, 0)
    const command2 = new PasteElementCommand(svg, serialized, 1)
    const command3 = new PasteElementCommand(svg, serialized, 2)

    command1.execute()
    command2.execute()
    command3.execute()

    expect(svg.children.length).toBe(3)

    const el1 = svg.children[0] as SVGRectElement
    const el2 = svg.children[1] as SVGRectElement
    const el3 = svg.children[2] as SVGRectElement

    const x1 = parseFloat(el1.getAttribute('x') || '0')
    const x2 = parseFloat(el2.getAttribute('x') || '0')
    const x3 = parseFloat(el3.getAttribute('x') || '0')

    // Each paste should have a larger offset
    expect(x2).toBeGreaterThan(x1)
    expect(x3).toBeGreaterThan(x2)
  })

  it('should paste group elements with children', () => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute('id', 'test-group')
    group.setAttribute('transform', 'translate(10, 20)')
    group.appendChild(rect)
    group.appendChild(circle)

    const serialized = [serializeElement(group)]
    const command = new PasteElementCommand(svg, serialized, 0)

    command.execute()

    expect(svg.children.length).toBe(1)
    const pastedGroup = svg.children[0] as SVGGElement
    expect(pastedGroup.tagName.toLowerCase()).toBe('g')
    expect(pastedGroup.children.length).toBe(2)
    expect(pastedGroup.children[0].tagName.toLowerCase()).toBe('rect')
    expect(pastedGroup.children[1].tagName.toLowerCase()).toBe('circle')
  })

  it('should have correct description', () => {
    const serialized1 = [serializeElement(rect)]
    const command1 = new PasteElementCommand(svg, serialized1, 0)
    expect(command1.description).toBe('Paste 1 element')

    const serialized2 = [serializeElement(rect), serializeElement(circle)]
    const command2 = new PasteElementCommand(svg, serialized2, 0)
    expect(command2.description).toBe('Paste 2 elements')
  })
})

