import { useEffect, useState, useRef } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { applyTranslation } from '../utils/transform'
import { useResize, ResizeHandle } from '../hooks/useResize'
import '../styles/SelectionOverlay.css'

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

function SelectionOverlay() {
  const { selectedElement, selectedElements } = useSelection()
  const [bbox, setBbox] = useState<BoundingBox | null>(null)
  const [multiSelectionBoxes, setMultiSelectionBoxes] = useState<BoundingBox[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  const { isResizing, handleResizeStart, handleResizeMove, handleResizeEnd } = useResize({
    onResize: (width, height, _left, _top) => {
      if (!selectedElement) return

      const element = selectedElement.element
      const tagName = element.tagName.toLowerCase()

      // Get viewport scale
      const viewerContainer = document.querySelector('.svg-content') as HTMLElement
      const transform = viewerContainer?.style.transform || ''
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

      // Update element dimensions based on type
      switch (tagName) {
        case 'rect':
        case 'image':
          element.setAttribute('width', (width / scale).toString())
          element.setAttribute('height', (height / scale).toString())
          break
        case 'circle':
          const radius = Math.min(width, height) / (2 * scale)
          element.setAttribute('r', radius.toString())
          break
        case 'ellipse':
          element.setAttribute('rx', (width / (2 * scale)).toString())
          element.setAttribute('ry', (height / (2 * scale)).toString())
          break
      }

      // Update bounding box
      updateBbox()
    },
  })

  // Calculate combined bounding box for all selected elements
  const getCombinedBoundingBox = (): BoundingBox | null => {
    if (selectedElements.length === 0) return null

    const viewerContainer = document.querySelector('.viewer-container')
    if (!viewerContainer) return null

    const containerRect = viewerContainer.getBoundingClientRect()

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    selectedElements.forEach(sel => {
      const rect = sel.element.getBoundingClientRect()
      minX = Math.min(minX, rect.left)
      minY = Math.min(minY, rect.top)
      maxX = Math.max(maxX, rect.right)
      maxY = Math.max(maxY, rect.bottom)
    })

    return {
      x: minX - containerRect.left,
      y: minY - containerRect.top,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  const updateBbox = () => {
    if (selectedElements.length === 0) {
      setBbox(null)
      setMultiSelectionBoxes([])
      return
    }

    const viewerContainer = document.querySelector('.viewer-container')
    if (!viewerContainer) return

    const containerRect = viewerContainer.getBoundingClientRect()

    // For single selection, show resize handles
    if (selectedElements.length === 1) {
      const rect = selectedElements[0].element.getBoundingClientRect()
      setBbox({
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      })
      setMultiSelectionBoxes([])
    } else {
      // For multi-selection, show combined bounding box and individual outlines
      const combined = getCombinedBoundingBox()
      setBbox(combined)

      // Calculate individual boxes for visual feedback
      const boxes = selectedElements.map(sel => {
        const rect = sel.element.getBoundingClientRect()
        return {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        }
      })
      setMultiSelectionBoxes(boxes)
    }
  }

  useEffect(() => {
    if (selectedElements.length === 0) {
      setBbox(null)
      setMultiSelectionBoxes([])
      return
    }

    updateBbox()

    // Update on window resize or scroll
    window.addEventListener('resize', updateBbox)
    window.addEventListener('scroll', updateBbox, true)

    return () => {
      window.removeEventListener('resize', updateBbox)
      window.removeEventListener('scroll', updateBbox, true)
    }
  }, [selectedElements])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedElements.length === 0 || isResizing) return

    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }

    document.body.style.cursor = 'grabbing'
  }

  const handleHandleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (!selectedElement || !bbox) return

    e.stopPropagation()

    const rect = selectedElement.element.getBoundingClientRect()
    handleResizeStart(e, handle, rect)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || selectedElements.length === 0) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    // Get viewport scale from the viewer container
    const viewerContainer = document.querySelector('.svg-content') as HTMLElement
    const transform = viewerContainer?.style.transform || ''
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

    // Apply translation to all selected elements
    selectedElements.forEach(sel => {
      applyTranslation(sel.element, deltaX, deltaY, scale)
    })

    // Update drag start position
    dragStartRef.current = { x: e.clientX, y: e.clientY }

    // Update bounding boxes
    updateBbox()
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
  }, [isDragging, selectedElements])

  useEffect(() => {
    if (isResizing) {
      const handleMove = (e: any) => handleResizeMove(e)
      const handleUp = (e: any) => handleResizeEnd(e)

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)

      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  if (!bbox) return null

  const isMultiSelection = selectedElements.length > 1

  return (
    <>
      {/* Show individual element outlines for multi-selection */}
      {isMultiSelection && multiSelectionBoxes.map((box, index) => (
        <div
          key={index}
          className="multi-selection-outline"
          style={{
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        />
      ))}

      {/* Main selection overlay */}
      <div
        ref={overlayRef}
        className={`selection-overlay ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isMultiSelection ? 'multi-selection' : ''}`}
        style={{
          left: `${bbox.x}px`,
          top: `${bbox.y}px`,
          width: `${bbox.width}px`,
          height: `${bbox.height}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Only show resize handles for single selection */}
        {!isMultiSelection && (
          <>
            <div
              className="selection-handle top-left"
              onMouseDown={(e) => handleHandleMouseDown(e, 'top-left')}
            />
            <div
              className="selection-handle top-right"
              onMouseDown={(e) => handleHandleMouseDown(e, 'top-right')}
            />
            <div
              className="selection-handle bottom-left"
              onMouseDown={(e) => handleHandleMouseDown(e, 'bottom-left')}
            />
            <div
              className="selection-handle bottom-right"
              onMouseDown={(e) => handleHandleMouseDown(e, 'bottom-right')}
            />
          </>
        )}
      </div>
    </>
  )
}

export default SelectionOverlay

