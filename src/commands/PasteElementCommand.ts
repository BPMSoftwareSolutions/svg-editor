import { Command } from '../types/command'
import {
  SerializedElement,
  deserializeElement,
  updateElementIds,
  calculatePasteOffset,
  applyPositionOffset,
} from '../utils/clipboard'

export class PasteElementCommand implements Command {
  public description: string
  private pastedElements: SVGElement[] = []
  private targetParent: SVGElement
  private copiedData: SerializedElement[]
  private pasteIndex: number

  constructor(
    targetParent: SVGElement,
    copiedData: SerializedElement[],
    pasteIndex: number = 0
  ) {
    this.targetParent = targetParent
    this.copiedData = copiedData
    this.pasteIndex = pasteIndex
    this.description = `Paste ${copiedData.length} element${copiedData.length > 1 ? 's' : ''}`
  }

  execute(): void {
    console.log('[PasteElementCommand] Executing paste:', {
      elementCount: this.copiedData.length,
      pasteIndex: this.pasteIndex,
    })

    // Clear any previously pasted elements
    this.pastedElements = []

    // Calculate offset for this paste operation
    const offset = calculatePasteOffset(this.pasteIndex)

    // Deserialize and paste each element
    this.copiedData.forEach(serialized => {
      try {
        // Deserialize the element
        const element = deserializeElement(serialized)

        // Update IDs to prevent conflicts
        updateElementIds(element)

        // Apply position offset
        applyPositionOffset(element, offset.x, offset.y)

        // Append to target parent
        this.targetParent.appendChild(element)

        // Store reference for undo
        this.pastedElements.push(element)

        console.log('[PasteElementCommand] Pasted element:', {
          tagName: element.tagName,
          id: element.id,
          offset,
        })
      } catch (error) {
        console.error('[PasteElementCommand] Failed to paste element:', error)
      }
    })
  }

  undo(): void {
    console.log('[PasteElementCommand] Undoing paste:', {
      elementCount: this.pastedElements.length,
    })

    // Remove all pasted elements
    this.pastedElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    // Clear the array
    this.pastedElements = []
  }
}

