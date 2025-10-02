import { Command } from '../types/command'
import { parseTransform, serializeTransform } from '../utils/transform'

interface ElementPosition {
  element: SVGElement
  originalTransform: string
  newTransform: string
}

/**
 * Command to move one or more SVG elements
 * Stores the original and new positions for undo/redo
 */
export class MoveElementCommand implements Command {
  private positions: ElementPosition[]
  public description: string

  constructor(
    elements: SVGElement | SVGElement[],
    deltaX: number,
    deltaY: number,
    scale: number = 1,
    originalTransforms?: string[]
  ) {
    const elementArray = Array.isArray(elements) ? elements : [elements]

    this.positions = elementArray.map((element, index) => {
      // Use provided original transform if available, otherwise read from element
      const originalTransform = originalTransforms
        ? (originalTransforms[index] || '')
        : (element.getAttribute('transform') || '')

      const transform = parseTransform(originalTransform)

      // Apply movement with scale adjustment
      transform.translateX += deltaX / scale
      transform.translateY += deltaY / scale

      const newTransform = serializeTransform(transform)

      return {
        element,
        originalTransform,
        newTransform,
      }
    })

    const count = elementArray.length
    this.description = count === 1
      ? `Move ${elementArray[0].tagName.toLowerCase()}`
      : `Move ${count} elements`
  }

  execute(): void {
    console.log('[MoveElementCommand] Executing move')
    this.positions.forEach(({ element, newTransform }, index) => {
      const before = element.getAttribute('transform')
      console.log(`  Element ${index} before:`, before)
      element.setAttribute('transform', newTransform)
      console.log(`  Element ${index} after:`, newTransform)
    })
  }

  undo(): void {
    console.log('[MoveElementCommand] Undoing move')
    this.positions.forEach(({ element, originalTransform }, index) => {
      const before = element.getAttribute('transform')
      console.log(`  Element ${index} before undo:`, before)
      if (originalTransform) {
        element.setAttribute('transform', originalTransform)
      } else {
        element.removeAttribute('transform')
      }
      console.log(`  Element ${index} after undo:`, originalTransform || '(removed)')
    })
  }
}

