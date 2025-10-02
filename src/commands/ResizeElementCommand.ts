import { Command } from '../types/command'
import { parseTransform, serializeTransform } from '../utils/transform'

interface ElementSize {
  element: SVGElement
  originalAttributes: Map<string, string>
  newAttributes: Map<string, string>
}

/**
 * Command to resize an SVG element
 * Stores the original and new dimensions for undo/redo
 */
export class ResizeElementCommand implements Command {
  private sizes: ElementSize[]
  public description: string

  constructor(
    element: SVGElement,
    originalWidth: number,
    originalHeight: number,
    newWidth: number,
    newHeight: number,
    scale: number = 1,
    originalTransform?: string
  ) {
    const tagName = element.tagName.toLowerCase()
    
    // Adjust dimensions for scale
    const adjustedOriginalWidth = originalWidth / scale
    const adjustedOriginalHeight = originalHeight / scale
    const adjustedNewWidth = newWidth / scale
    const adjustedNewHeight = newHeight / scale

    const originalAttributes = new Map<string, string>()
    const newAttributes = new Map<string, string>()

    // Store attributes based on element type
    switch (tagName) {
      case 'rect':
      case 'image':
      case 'use':
        originalAttributes.set('width', element.getAttribute('width') || adjustedOriginalWidth.toString())
        originalAttributes.set('height', element.getAttribute('height') || adjustedOriginalHeight.toString())
        newAttributes.set('width', adjustedNewWidth.toString())
        newAttributes.set('height', adjustedNewHeight.toString())
        break

      case 'circle':
        originalAttributes.set('r', element.getAttribute('r') || (adjustedOriginalWidth / 2).toString())
        newAttributes.set('r', (adjustedNewWidth / 2).toString())
        break

      case 'ellipse':
        originalAttributes.set('rx', element.getAttribute('rx') || (adjustedOriginalWidth / 2).toString())
        originalAttributes.set('ry', element.getAttribute('ry') || (adjustedOriginalHeight / 2).toString())
        newAttributes.set('rx', (adjustedNewWidth / 2).toString())
        newAttributes.set('ry', (adjustedNewHeight / 2).toString())
        break

      case 'line': {
        const x1 = Number(element.getAttribute('x1')) || 0
        const y1 = Number(element.getAttribute('y1')) || 0
        const x2 = Number(element.getAttribute('x2')) || 0
        const y2 = Number(element.getAttribute('y2')) || 0

        originalAttributes.set('x1', x1.toString())
        originalAttributes.set('y1', y1.toString())
        originalAttributes.set('x2', x2.toString())
        originalAttributes.set('y2', y2.toString())

        // Scale the line proportionally
        const scaleX = adjustedNewWidth / adjustedOriginalWidth
        const scaleY = adjustedNewHeight / adjustedOriginalHeight

        newAttributes.set('x1', x1.toString())
        newAttributes.set('y1', y1.toString())
        newAttributes.set('x2', (x1 + (x2 - x1) * scaleX).toString())
        newAttributes.set('y2', (y1 + (y2 - y1) * scaleY).toString())
        break
      }

      default: {
        // For other elements (path, polygon, groups, etc.), use transform scale
        if (originalTransform !== undefined) {
          // When called from SelectionOverlay with originalTransform:
          // Store the original transform (before resize started)
          originalAttributes.set('transform', originalTransform)

          // Store the current transform (after resize completed with position correction)
          const currentTransform = element.getAttribute('transform') || ''
          newAttributes.set('transform', currentTransform)
        } else {
          // When called directly (e.g., from tests):
          // Calculate and apply the scale transform
          const currentTransform = element.getAttribute('transform') || ''
          originalAttributes.set('transform', currentTransform)

          const parsed = parseTransform(currentTransform)
          const scaleX = newWidth / originalWidth
          const scaleY = newHeight / originalHeight

          // Compose the new scale with existing scale
          parsed.scaleX *= scaleX
          parsed.scaleY *= scaleY

          const newTransform = serializeTransform(parsed)
          newAttributes.set('transform', newTransform)
          element.setAttribute('transform', newTransform)
        }
        break
      }
    }

    this.sizes = [{
      element,
      originalAttributes,
      newAttributes,
    }]

    this.description = `Resize ${tagName}`
  }

  execute(): void {
    this.sizes.forEach(({ element, newAttributes }) => {
      newAttributes.forEach((value, key) => {
        element.setAttribute(key, value)
      })
    })
  }

  undo(): void {
    this.sizes.forEach(({ element, originalAttributes }) => {
      originalAttributes.forEach((value, key) => {
        if (value) {
          element.setAttribute(key, value)
        } else {
          element.removeAttribute(key)
        }
      })
    })
  }
}

