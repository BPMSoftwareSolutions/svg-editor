import { useState, useEffect, useRef } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { getElementsInRect, Point } from '../utils/selectionUtils'
import '../styles/MarqueeSelection.css'

interface MarqueeSelectionProps {
  containerRef: React.RefObject<HTMLDivElement>
  isEnabled: boolean
}

function MarqueeSelection({ containerRef, isEnabled }: MarqueeSelectionProps) {
  const { selectMultiple, selectElement } = useSelection()
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 })
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 })
  const [isAdditive, setIsAdditive] = useState(false)
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEnabled || !containerRef.current) return

    const container = containerRef.current
    let dragThreshold = 5 // Minimum pixels to move before starting marquee
    let mouseDownPos: Point | null = null

    const handleMouseDown = (e: MouseEvent) => {
      // Only start marquee selection if clicking on the container itself (not on SVG elements)
      const target = e.target as HTMLElement

      // Check if we're clicking on the viewer container or svg-content div or SVG background
      if (
        !target.classList.contains('viewer-container') &&
        !target.classList.contains('svg-content') &&
        target.tagName.toLowerCase() !== 'svg'
      ) {
        return
      }

      // Store mouse down position to check for drag threshold
      mouseDownPos = { x: e.clientX, y: e.clientY }

      // Check if Ctrl/Cmd is pressed for additive selection
      setIsAdditive(e.ctrlKey || e.metaKey)
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Check if we should start marquee selection
      if (!isSelecting && mouseDownPos) {
        const deltaX = Math.abs(e.clientX - mouseDownPos.x)
        const deltaY = Math.abs(e.clientY - mouseDownPos.y)

        if (deltaX > dragThreshold || deltaY > dragThreshold) {
          // Start marquee selection
          setIsSelecting(true)
          setStartPoint(mouseDownPos)
          setCurrentPoint({ x: e.clientX, y: e.clientY })
        }
        return
      }

      if (!isSelecting) return

      setCurrentPoint({ x: e.clientX, y: e.clientY })

      // Find elements within the selection rectangle
      const elements = getElementsInRect(startPoint, { x: e.clientX, y: e.clientY })

      if (elements.length > 0) {
        if (isAdditive) {
          // For additive selection, we'll apply it on mouse up
          // Just show the marquee for now
        } else {
          // For replace selection, update selection in real-time
          selectMultiple(elements)
        }
      } else if (!isAdditive) {
        // Clear selection if no elements in rectangle and not additive
        selectElement(null)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      mouseDownPos = null

      if (!isSelecting) {
        setIsAdditive(false)
        return
      }

      // Find final elements within the selection rectangle
      const elements = getElementsInRect(startPoint, { x: e.clientX, y: e.clientY })

      if (elements.length > 0) {
        if (isAdditive) {
          // For additive selection, add to existing selection
          // This is handled by the context - we just select all elements
          selectMultiple(elements)
        } else {
          // For replace selection, already updated in real-time
          selectMultiple(elements)
        }
      } else if (!isAdditive) {
        // Clear selection if no elements selected and not additive
        selectElement(null)
      }

      setIsSelecting(false)
      setIsAdditive(false)
    }

    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isEnabled, isSelecting, startPoint, containerRef, selectMultiple, selectElement, isAdditive])

  if (!isSelecting) return null

  // Calculate marquee rectangle dimensions
  const left = Math.min(startPoint.x, currentPoint.x)
  const top = Math.min(startPoint.y, currentPoint.y)
  const width = Math.abs(currentPoint.x - startPoint.x)
  const height = Math.abs(currentPoint.y - startPoint.y)

  return (
    <div
      ref={marqueeRef}
      className={`marquee-selection ${isAdditive ? 'additive' : ''}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  )
}

export default MarqueeSelection

