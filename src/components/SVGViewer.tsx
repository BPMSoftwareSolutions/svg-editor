import { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react'
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
        <div
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

