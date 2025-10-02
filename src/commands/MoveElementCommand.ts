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
    scale: number = 1
  ) {
    const elementArray = Array.isArray(elements) ? elements : [elements]
    
    this.positions = elementArray.map(element => {
      const originalTransform = element.getAttribute('transform') || ''
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
    this.positions.forEach(({ element, newTransform }) => {
      element.setAttribute('transform', newTransform)
    })
  }

  undo(): void {
    this.positions.forEach(({ element, originalTransform }) => {
      if (originalTransform) {
        element.setAttribute('transform', originalTransform)
      } else {
        element.removeAttribute('transform')
      }
    })
  }
}

