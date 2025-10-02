/**
 * Utility functions for selection operations
 */

export interface Point {
  x: number
  y: number
}

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Check if two rectangles intersect
 */
export function rectsIntersect(rect1: Rect, rect2: DOMRect | Rect): boolean {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
}

/**
 * Create a Rect from two points (start and end of drag)
 */
export function createRectFromPoints(start: Point, end: Point): Rect {
  return {
    left: Math.min(start.x, end.x),
    top: Math.min(start.y, end.y),
    right: Math.max(start.x, end.x),
    bottom: Math.max(start.y, end.y),
  }
}

/**
 * Get all SVG elements that intersect with a selection rectangle
 */
export function getElementsInRect(
  rectStart: Point,
  rectEnd: Point,
  containerSelector: string = '.svg-content svg'
): SVGElement[] {
  const rect = createRectFromPoints(rectStart, rectEnd)
  const svgContainer = document.querySelector(containerSelector)
  
  if (!svgContainer) return []

  // Get all direct children of SVG (excluding nested elements for now)
  const svgElements = svgContainer.querySelectorAll(':scope > *')
  const selected: SVGElement[] = []

  svgElements.forEach((element) => {
    if (!(element instanceof SVGElement)) return
    
    // Skip the root SVG element
    if (element.tagName.toLowerCase() === 'svg') return

    const bbox = element.getBoundingClientRect()

    // Check if element intersects with selection rectangle
    if (rectsIntersect(rect, bbox)) {
      selected.push(element)
    }
  })

  return selected
}

/**
 * Get all SVG elements recursively (including nested elements)
 */
export function getAllElementsInRect(
  rectStart: Point,
  rectEnd: Point,
  containerSelector: string = '.svg-content svg'
): SVGElement[] {
  const rect = createRectFromPoints(rectStart, rectEnd)
  const svgContainer = document.querySelector(containerSelector)
  
  if (!svgContainer) return []

  const selected: SVGElement[] = []

  const checkElement = (element: Element) => {
    if (!(element instanceof SVGElement)) return
    
    // Skip the root SVG element
    if (element.tagName.toLowerCase() === 'svg') {
      // Check children
      Array.from(element.children).forEach(checkElement)
      return
    }

    const bbox = element.getBoundingClientRect()

    // Check if element intersects with selection rectangle
    if (rectsIntersect(rect, bbox)) {
      selected.push(element)
    }

    // Check children
    Array.from(element.children).forEach(checkElement)
  }

  checkElement(svgContainer)

  return selected
}

/**
 * Calculate the combined bounding box for multiple elements
 */
export function getCombinedBoundingBox(elements: SVGElement[]): DOMRect | null {
  if (elements.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  elements.forEach(element => {
    const rect = element.getBoundingClientRect()
    minX = Math.min(minX, rect.left)
    minY = Math.min(minY, rect.top)
    maxX = Math.max(maxX, rect.right)
    maxY = Math.max(maxY, rect.bottom)
  })

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    toJSON: () => ({}),
  } as DOMRect
}

