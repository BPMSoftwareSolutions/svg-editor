import { Command } from '../types/command'

/**
 * Command to delete one or more SVG elements
 * Stores the deleted elements and their positions for undo
 */
export class DeleteElementCommand implements Command {
  private elements: SVGElement[]
  private parents: (Node | null)[]
  private nextSiblings: (Node | null)[]
  public description: string

  constructor(elements: SVGElement | SVGElement[]) {
    this.elements = Array.isArray(elements) ? elements : [elements]
    this.parents = []
    this.nextSiblings = []
    
    const count = this.elements.length
    this.description = count === 1 
      ? `Delete ${this.elements[0].tagName.toLowerCase()}` 
      : `Delete ${count} elements`
  }

  execute(): void {
    // Store parent and position information before removing (only first time)
    if (this.parents.length === 0) {
      this.elements.forEach(element => {
        this.parents.push(element.parentNode)
        this.nextSiblings.push(element.nextSibling)
      })
    }

    // Remove elements (check if they're still in the DOM first)
    this.elements.forEach(element => {
      if (element.parentNode) {
        element.remove()
      }
    })
  }

  undo(): void {
    // Restore elements to their original positions
    this.elements.forEach((element, index) => {
      const parent = this.parents[index]
      const nextSibling = this.nextSiblings[index]

      if (parent) {
        // Check if element is already in the DOM
        if (element.parentNode) {
          element.remove()
        }

        if (nextSibling && nextSibling.parentNode === parent) {
          parent.insertBefore(element, nextSibling)
        } else {
          parent.appendChild(element)
        }
      }
    })
  }
}

