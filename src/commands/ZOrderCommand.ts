import { Command } from '../types/command'

export type ZOrderAction = 'toFront' | 'toBack' | 'forward' | 'backward'

interface ElementOrder {
  element: SVGElement
  parent: Node | null
  nextSibling: Node | null
}

/**
 * Command to change the z-order (stacking order) of SVG elements
 * Stores the original position for undo
 */
export class ZOrderCommand implements Command {
  private element: SVGElement
  private action: ZOrderAction
  private originalOrder: ElementOrder
  public description: string

  constructor(element: SVGElement, action: ZOrderAction) {
    this.element = element
    this.action = action
    
    // Store original position
    this.originalOrder = {
      element,
      parent: element.parentNode,
      nextSibling: element.nextSibling,
    }

    const actionNames: Record<ZOrderAction, string> = {
      toFront: 'Bring to Front',
      toBack: 'Send to Back',
      forward: 'Bring Forward',
      backward: 'Send Backward',
    }
    
    this.description = `${actionNames[action]} ${element.tagName.toLowerCase()}`
  }

  execute(): void {
    const parent = this.element.parentNode
    if (!parent) return

    switch (this.action) {
      case 'toFront':
        parent.appendChild(this.element)
        break

      case 'toBack':
        if (parent.firstChild) {
          parent.insertBefore(this.element, parent.firstChild)
        }
        break

      case 'forward': {
        const nextSibling = this.element.nextSibling
        if (nextSibling && nextSibling.nextSibling) {
          parent.insertBefore(this.element, nextSibling.nextSibling)
        } else if (nextSibling) {
          parent.appendChild(this.element)
        }
        break
      }

      case 'backward': {
        const previousSibling = this.element.previousSibling
        if (previousSibling) {
          parent.insertBefore(this.element, previousSibling)
        }
        break
      }
    }
  }

  undo(): void {
    const { parent, nextSibling } = this.originalOrder
    
    if (parent) {
      if (nextSibling) {
        parent.insertBefore(this.element, nextSibling)
      } else {
        parent.appendChild(this.element)
      }
    }
  }
}

