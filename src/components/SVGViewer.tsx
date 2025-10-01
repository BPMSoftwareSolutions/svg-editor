import { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import SelectionOverlay from './SelectionOverlay'
import ElementInspector from './ElementInspector'
import Toolbar from './Toolbar'
import '../styles/SVGViewer.css'

interface SVGViewerProps {
  svgContent: string
}

interface ViewportState {
  scale: number
  translateX: number
  translateY: number
}

function SVGViewer({ svgContent }: SVGViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgContentRef = useRef<HTMLDivElement>(null)
  const { selectedElement, selectElement, clearSelection } = useSelection()
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Reset viewport when new SVG is loaded
  useEffect(() => {
    setViewport({ scale: 1, translateX: 0, translateY: 0 })
  }, [svgContent])

  // Add click handlers to SVG elements
  useEffect(() => {
    const svgElement = svgContentRef.current?.querySelector('svg')
    if (!svgElement) return

    const handleElementClick = (e: Event) => {
      const target = e.target as SVGElement

      // Don't select the root SVG element
      if (target.tagName.toLowerCase() === 'svg') {
        selectElement(null)
        return
      }

      // Select the clicked element
      e.stopPropagation()
      selectElement(target)
    }

    // Add click listeners to all SVG child elements
    const elements = svgElement.querySelectorAll('*')
    elements.forEach(el => {
      el.addEventListener('click', handleElementClick)
    })

    // Click on SVG background clears selection
    svgElement.addEventListener('click', handleElementClick)

    return () => {
      elements.forEach(el => {
        el.removeEventListener('click', handleElementClick)
      })
      svgElement.removeEventListener('click', handleElementClick)
    }
  }, [svgContent, selectElement])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key - remove selected element
      if (e.key === 'Delete' && selectedElement) {
        selectedElement.element.remove()
        clearSelection()
      }

      // Escape key - clear selection
      if (e.key === 'Escape') {
        clearSelection()
      }

      // Arrow keys - move selected element
      if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        let deltaX = 0
        let deltaY = 0

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -step
            break
          case 'ArrowDown':
            deltaY = step
            break
          case 'ArrowLeft':
            deltaX = -step
            break
          case 'ArrowRight':
            deltaX = step
            break
        }

        const element = selectedElement.element
        const tagName = element.tagName.toLowerCase()

        // Update position based on element type
        switch (tagName) {
          case 'circle':
          case 'ellipse':
            const cx = Number(element.getAttribute('cx')) || 0
            const cy = Number(element.getAttribute('cy')) || 0
            element.setAttribute('cx', (cx + deltaX).toString())
            element.setAttribute('cy', (cy + deltaY).toString())
            break
          case 'rect':
          case 'image':
          case 'use':
            const x = Number(element.getAttribute('x')) || 0
            const y = Number(element.getAttribute('y')) || 0
            element.setAttribute('x', (x + deltaX).toString())
            element.setAttribute('y', (y + deltaY).toString())
            break
          case 'line':
            const x1 = Number(element.getAttribute('x1')) || 0
            const y1 = Number(element.getAttribute('y1')) || 0
            const x2 = Number(element.getAttribute('x2')) || 0
            const y2 = Number(element.getAttribute('y2')) || 0
            element.setAttribute('x1', (x1 + deltaX).toString())
            element.setAttribute('y1', (y1 + deltaY).toString())
            element.setAttribute('x2', (x2 + deltaX).toString())
            element.setAttribute('y2', (y2 + deltaY).toString())
            break
          default:
            // For paths, groups, and other elements, use transform
            const currentTransform = element.getAttribute('transform') || ''
            const translateMatch = currentTransform.match(/translate\(([^)]+)\)/)
            let tx = 0
            let ty = 0

            if (translateMatch) {
              const values = translateMatch[1].split(/[\s,]+/).map(Number)
              tx = values[0] || 0
              ty = values[1] || 0
            }

            tx += deltaX
            ty += deltaY

            const newTransform = currentTransform.replace(
              /translate\([^)]+\)/,
              `translate(${tx}, ${ty})`
            )

            if (newTransform === currentTransform) {
              element.setAttribute('transform', `translate(${tx}, ${ty})`)
            } else {
              element.setAttribute('transform', newTransform)
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, clearSelection])

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(10, viewport.scale * delta))
    
    setViewport(prev => ({
      ...prev,
      scale: newScale,
    }))
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true)
      setPanStart({ x: e.clientX - viewport.translateX, y: e.clientY - viewport.translateY })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setViewport(prev => ({
        ...prev,
        translateX: e.clientX - panStart.x,
        translateY: e.clientY - panStart.y,
      }))
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleMouseLeave = () => {
    setIsPanning(false)
  }

  const handleReset = () => {
    setViewport({ scale: 1, translateX: 0, translateY: 0 })
  }

  const handleZoomIn = () => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(10, prev.scale * 1.2),
    }))
  }

  const handleZoomOut = () => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale / 1.2),
    }))
  }

  return (
    <div className="svg-viewer">
      <ElementInspector />
      <Toolbar />
      <div className="viewer-controls">
        <button onClick={handleZoomIn} title="Zoom In">+</button>
        <button onClick={handleZoomOut} title="Zoom Out">-</button>
        <button onClick={handleReset} title="Reset View">Reset</button>
        <span className="zoom-level">{Math.round(viewport.scale * 100)}%</span>
      </div>
      <div
        ref={containerRef}
        className={`viewer-container ${isPanning ? 'panning' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <SelectionOverlay />
        <div
          ref={svgContentRef}
          className="svg-content"
          style={{
            transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  )
}

export default SVGViewer

