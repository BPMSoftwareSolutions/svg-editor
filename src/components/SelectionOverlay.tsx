import { useEffect, useState, useRef } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { applyTranslation } from '../utils/transform'
import '../styles/SelectionOverlay.css'

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

function SelectionOverlay() {
  const { selectedElement } = useSelection()
  const [bbox, setBbox] = useState<BoundingBox | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedElement) {
      setBbox(null)
      return
    }

    const updateBbox = () => {
      const rect = selectedElement.element.getBoundingClientRect()
      const viewerContainer = document.querySelector('.viewer-container')
      
      if (viewerContainer) {
        const containerRect = viewerContainer.getBoundingClientRect()
        setBbox({
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateBbox()

    // Update on window resize or scroll
    window.addEventListener('resize', updateBbox)
    window.addEventListener('scroll', updateBbox, true)

    return () => {
      window.removeEventListener('resize', updateBbox)
      window.removeEventListener('scroll', updateBbox, true)
    }
  }, [selectedElement])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedElement) return

    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }

    document.body.style.cursor = 'grabbing'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !selectedElement) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    // Get viewport scale from the viewer container
    const viewerContainer = document.querySelector('.svg-content') as HTMLElement
    const transform = viewerContainer?.style.transform || ''
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

    // Apply translation to the element
    applyTranslation(selectedElement.element, deltaX, deltaY, scale)

    // Update drag start position
    dragStartRef.current = { x: e.clientX, y: e.clientY }

    // Update bounding box
    const rect = selectedElement.element.getBoundingClientRect()
    const containerRect = document.querySelector('.viewer-container')?.getBoundingClientRect()

    if (containerRect) {
      setBbox({
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, selectedElement])

  if (!bbox) return null

  return (
    <div
      ref={overlayRef}
      className={`selection-overlay ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${bbox.x}px`,
        top: `${bbox.y}px`,
        width: `${bbox.width}px`,
        height: `${bbox.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="selection-handle top-left" />
      <div className="selection-handle top-right" />
      <div className="selection-handle bottom-left" />
      <div className="selection-handle bottom-right" />
    </div>
  )
}

export default SelectionOverlay

