import { useEffect, useState } from 'react'
import { useSelection } from '../contexts/SelectionContext'
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

  if (!bbox) return null

  return (
    <div
      className="selection-overlay"
      style={{
        left: `${bbox.x}px`,
        top: `${bbox.y}px`,
        width: `${bbox.width}px`,
        height: `${bbox.height}px`,
      }}
    >
      <div className="selection-handle top-left" />
      <div className="selection-handle top-right" />
      <div className="selection-handle bottom-left" />
      <div className="selection-handle bottom-right" />
    </div>
  )
}

export default SelectionOverlay

