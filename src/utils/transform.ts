export interface Transform {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotate: number
}

/**
 * Parse transform attribute from SVG element
 * Handles multiple transforms of the same type by composing them
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

  // Parse all translate transforms and sum them
  const translateMatches = transformStr.matchAll(/translate\(([^)]+)\)/g)
  for (const match of translateMatches) {
    const values = match[1].split(/[\s,]+/).map(Number)
    transform.translateX += values[0] || 0
    transform.translateY += values[1] || 0
  }

  // Parse all scale transforms and multiply them
  const scaleMatches = transformStr.matchAll(/scale\(([^)]+)\)/g)
  for (const match of scaleMatches) {
    const values = match[1].split(/[\s,]+/).map(Number)
    const scaleX = values[0] || 1
    const scaleY = values[1] || scaleX
    transform.scaleX *= scaleX
    transform.scaleY *= scaleY
  }

  // Parse all rotate transforms and sum them
  const rotateMatches = transformStr.matchAll(/rotate\(([^)]+)\)/g)
  for (const match of rotateMatches) {
    transform.rotate += Number(match[1]) || 0
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

/**
 * Apply scale to an SVG element's transform
 * Properly composes with existing transforms by multiplying scale values
 */
export function applyScale(
  element: SVGElement,
  scaleX: number,
  scaleY: number
): void {
  const currentTransform = element.getAttribute('transform') || ''
  const transform = parseTransform(currentTransform)

  // Multiply the new scale with existing scale
  transform.scaleX *= scaleX
  transform.scaleY *= scaleY

  element.setAttribute('transform', serializeTransform(transform))
}

/**
 * Update the scale component of a transform while preserving other transforms
 * This replaces the existing scale rather than multiplying it
 */
export function updateScale(
  transformStr: string,
  newScaleX: number,
  newScaleY: number
): string {
  const transform = parseTransform(transformStr)

  // Replace scale values
  transform.scaleX = newScaleX
  transform.scaleY = newScaleY

  return serializeTransform(transform)
}

