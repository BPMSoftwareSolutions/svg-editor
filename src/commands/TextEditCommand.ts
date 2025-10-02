import { Command } from '../types/command'

/**
 * Command to edit text content of an SVG text element
 * Stores the original and new text for undo/redo
 */
export class TextEditCommand implements Command {
  private element: SVGElement
  private originalText: string
  private newText: string
  public description: string

  constructor(element: SVGElement, originalText: string, newText: string) {
    this.element = element
    this.originalText = originalText
    this.newText = newText
    this.description = `Edit text`
  }

  execute(): void {
    this.element.textContent = this.newText
  }

  undo(): void {
    this.element.textContent = this.originalText
  }
}

