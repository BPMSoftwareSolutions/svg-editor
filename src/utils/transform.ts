export interface Transform {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotate: number
}

/**
 * Parse transform attribute from SVG element
 */
export function parseTransform(transformStr: string): Transform {
  const transform: Transform = {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
  }

  if (!transformStr) return transform

  // Parse translate
  const translateMatch = transformStr.match(/translate\(([^)]+)\)/)
  if (translateMatch) {
    const values = translateMatch[1].split(/[\s,]+/).map(Number)
    transform.translateX = values[0] || 0
    transform.translateY = values[1] || 0
  }

  // Parse scale
  const scaleMatch = transformStr.match(/scale\(([^)]+)\)/)
  if (scaleMatch) {
    const values = scaleMatch[1].split(/[\s,]+/).map(Number)
    transform.scaleX = values[0] || 1
    transform.scaleY = values[1] || values[0] || 1
  }

  // Parse rotate
  const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/)
  if (rotateMatch) {
    transform.rotate = Number(rotateMatch[1]) || 0
  }

  return transform
}

/**
 * Convert transform object to SVG transform string
 */
export function serializeTransform(transform: Transform): string {
  const parts: string[] = []

  if (transform.translateX !== 0 || transform.translateY !== 0) {
    parts.push(`translate(${transform.translateX}, ${transform.translateY})`)
  }

  if (transform.scaleX !== 1 || transform.scaleY !== 1) {
    parts.push(`scale(${transform.scaleX}, ${transform.scaleY})`)
  }

  if (transform.rotate !== 0) {
    parts.push(`rotate(${transform.rotate})`)
  }

  return parts.join(' ')
}

/**
 * Apply translation to an SVG element
 */
export function applyTranslation(
  element: SVGElement,
  deltaX: number,
  deltaY: number,
  scale: number = 1
): void {
  const currentTransform = element.getAttribute('transform') || ''
  const transform = parseTransform(currentTransform)

  // Adjust for viewport scale
  transform.translateX += deltaX / scale
  transform.translateY += deltaY / scale

  element.setAttribute('transform', serializeTransform(transform))
}

/**
 * Get element position (works for different element types)
 */
export function getElementPosition(element: SVGElement): { x: number; y: number } {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'circle':
    case 'ellipse':
      return {
        x: Number(element.getAttribute('cx')) || 0,
        y: Number(element.getAttribute('cy')) || 0,
      }
    case 'rect':
    case 'image':
    case 'use':
      return {
        x: Number(element.getAttribute('x')) || 0,
        y: Number(element.getAttribute('y')) || 0,
      }
    case 'line':
      return {
        x: Number(element.getAttribute('x1')) || 0,
        y: Number(element.getAttribute('y1')) || 0,
      }
    case 'text':
      return {
        x: Number(element.getAttribute('x')) || 0,
        y: Number(element.getAttribute('y')) || 0,
      }
    default: {
      // For paths, groups, and other elements, use transform
      const transform = parseTransform(element.getAttribute('transform') || '')
      return {
        x: transform.translateX,
        y: transform.translateY,
      }
    }
  }
}

/**
 * Set element position (works for different element types)
 */
export function setElementPosition(
  element: SVGElement,
  x: number,
  y: number,
  scale: number = 1
): void {
  const tagName = element.tagName.toLowerCase()

  // Adjust for viewport scale
  const adjustedX = x / scale
  const adjustedY = y / scale

  switch (tagName) {
    case 'circle':
    case 'ellipse':
      element.setAttribute('cx', adjustedX.toString())
      element.setAttribute('cy', adjustedY.toString())
      break
    case 'rect':
    case 'image':
    case 'use':
      element.setAttribute('x', adjustedX.toString())
      element.setAttribute('y', adjustedY.toString())
      break
    case 'line': {
      const x1 = Number(element.getAttribute('x1')) || 0
      const y1 = Number(element.getAttribute('y1')) || 0
      const x2 = Number(element.getAttribute('x2')) || 0
      const y2 = Number(element.getAttribute('y2')) || 0
      const deltaX = adjustedX - x1
      const deltaY = adjustedY - y1
      element.setAttribute('x1', adjustedX.toString())
      element.setAttribute('y1', adjustedY.toString())
      element.setAttribute('x2', (x2 + deltaX).toString())
      element.setAttribute('y2', (y2 + deltaY).toString())
      break
    }
    case 'text':
      element.setAttribute('x', adjustedX.toString())
      element.setAttribute('y', adjustedY.toString())
      break
    default:
      // For paths, groups, and other elements, use transform
      applyTranslation(element, adjustedX, adjustedY, 1)
      break
  }
}

