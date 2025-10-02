/**
 * Clipboard utilities for copying and pasting SVG elements
 */

export interface SerializedElement {
  outerHTML: string
  tagName: string
  id: string | null
  attributes: Record<string, string>
}

/**
 * Serialize an SVG element to a format suitable for clipboard storage
 */
export function serializeElement(element: SVGElement): SerializedElement {
  const attributes: Record<string, string> = {}
  
  // Store all attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    attributes[attr.name] = attr.value
  }

  return {
    outerHTML: element.outerHTML,
    tagName: element.tagName.toLowerCase(),
    id: element.id || null,
    attributes,
  }
}

/**
 * Deserialize a serialized element back to an SVG element
 */
export function deserializeElement(serialized: SerializedElement): SVGElement {
  // Create a temporary SVG container
  const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  tempSvg.innerHTML = serialized.outerHTML

  // Get the first child element
  const element = tempSvg.firstElementChild as SVGElement

  if (!element) {
    throw new Error('Failed to deserialize element')
  }

  // Remove from temp container so it can be appended elsewhere
  element.remove()

  return element
}

/**
 * Generate a unique ID for an element
 * Uses crypto.randomUUID() if available, otherwise falls back to timestamp-based ID
 */
export function generateUniqueId(prefix: string = 'element'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  
  // Fallback for environments without crypto.randomUUID
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Update all IDs in an element and its children to be unique
 * This prevents ID conflicts when pasting elements
 */
export function updateElementIds(element: SVGElement, idMap: Map<string, string> = new Map()): void {
  // Update the element's own ID if it has one
  if (element.id) {
    const oldId = element.id
    const newId = generateUniqueId('pasted')
    element.id = newId
    idMap.set(oldId, newId)
  }

  // Update any references to IDs in attributes (e.g., href, fill="url(#id)")
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    let value = attr.value

    // Check for url(#id) references
    const urlMatch = value.match(/url\(#([^)]+)\)/)
    if (urlMatch) {
      const oldId = urlMatch[1]
      if (idMap.has(oldId)) {
        value = value.replace(`#${oldId}`, `#${idMap.get(oldId)}`)
        element.setAttribute(attr.name, value)
      }
    }

    // Check for direct ID references (e.g., href="#id")
    if (value.startsWith('#')) {
      const oldId = value.substring(1)
      if (idMap.has(oldId)) {
        element.setAttribute(attr.name, `#${idMap.get(oldId)}`)
      }
    }
  }

  // Recursively update children
  const children = Array.from(element.children) as SVGElement[]
  children.forEach(child => updateElementIds(child, idMap))
}

/**
 * Calculate offset position for pasted elements
 * Returns a slight offset to make it clear that a new element was created
 */
export function calculatePasteOffset(index: number = 0): { x: number; y: number } {
  const baseOffset = 10
  return {
    x: baseOffset + (index * 5),
    y: baseOffset + (index * 5),
  }
}

/**
 * Apply position offset to an element
 * Works with different element types (rect, circle, groups with transforms, etc.)
 */
export function applyPositionOffset(element: SVGElement, offsetX: number, offsetY: number): void {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'rect':
    case 'image':
    case 'use': {
      const x = parseFloat(element.getAttribute('x') || '0')
      const y = parseFloat(element.getAttribute('y') || '0')
      element.setAttribute('x', (x + offsetX).toString())
      element.setAttribute('y', (y + offsetY).toString())
      break
    }
    case 'circle':
    case 'ellipse': {
      const cx = parseFloat(element.getAttribute('cx') || '0')
      const cy = parseFloat(element.getAttribute('cy') || '0')
      element.setAttribute('cx', (cx + offsetX).toString())
      element.setAttribute('cy', (cy + offsetY).toString())
      break
    }
    case 'line': {
      const x1 = parseFloat(element.getAttribute('x1') || '0')
      const y1 = parseFloat(element.getAttribute('y1') || '0')
      const x2 = parseFloat(element.getAttribute('x2') || '0')
      const y2 = parseFloat(element.getAttribute('y2') || '0')
      element.setAttribute('x1', (x1 + offsetX).toString())
      element.setAttribute('y1', (y1 + offsetY).toString())
      element.setAttribute('x2', (x2 + offsetX).toString())
      element.setAttribute('y2', (y2 + offsetY).toString())
      break
    }
    case 'text': {
      const x = parseFloat(element.getAttribute('x') || '0')
      const y = parseFloat(element.getAttribute('y') || '0')
      element.setAttribute('x', (x + offsetX).toString())
      element.setAttribute('y', (y + offsetY).toString())
      break
    }
    case 'g':
    case 'path':
    case 'polygon':
    case 'polyline':
    default: {
      // For groups and other elements, modify the transform
      const currentTransform = element.getAttribute('transform') || ''
      
      // Parse existing translate values
      const translateMatch = currentTransform.match(/translate\(([^)]+)\)/)
      let currentX = 0
      let currentY = 0
      
      if (translateMatch) {
        const values = translateMatch[1].split(/[\s,]+/).map(Number)
        currentX = values[0] || 0
        currentY = values[1] || 0
      }
      
      const newX = currentX + offsetX
      const newY = currentY + offsetY
      
      // Replace or add translate
      let newTransform: string
      if (translateMatch) {
        newTransform = currentTransform.replace(
          /translate\([^)]+\)/,
          `translate(${newX}, ${newY})`
        )
      } else {
        newTransform = `translate(${newX}, ${newY}) ${currentTransform}`.trim()
      }
      
      element.setAttribute('transform', newTransform)
      break
    }
  }
}

