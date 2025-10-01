import { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import SelectionOverlay from './SelectionOverlay'
import ElementInspector from './ElementInspector'
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
  const { selectElement } = useSelection()
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

