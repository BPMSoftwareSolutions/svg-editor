import { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { useUndoRedo } from '../contexts/UndoRedoContext'
import { useAssets } from '../contexts/AssetContext'
import { DeleteElementCommand, MoveElementCommand } from '../commands'
import SelectionOverlay from './SelectionOverlay'
import ElementInspector from './ElementInspector'
import Toolbar from './Toolbar'
import TreePanel from './TreePanel'
import MarqueeSelection from './MarqueeSelection'
import '../styles/SVGViewer.css'

interface SVGViewerProps {
  svgContent?: string
  useAssetMode?: boolean
}

interface ViewportState {
  scale: number
  translateX: number
  translateY: number
}

function SVGViewer({ svgContent, useAssetMode = false }: SVGViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgContentRef = useRef<HTMLDivElement>(null)
  const { selectedElements, selectElement, selectMultiple, toggleElement, clearSelection } = useSelection()
  const { executeCommand } = useUndoRedo()

  // Always call useAssets hook (hooks must be called unconditionally)
  const assetContext = useAssets()
  const { assets, getSortedAssets } = useAssetMode ? assetContext : { assets: [], getSortedAssets: () => [] }
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Reset viewport when new SVG is loaded or assets change
  useEffect(() => {
    setViewport({ scale: 1, translateX: 0, translateY: 0 })
  }, [svgContent, assets.length])

  // Add click handlers to SVG elements
  useEffect(() => {
    const svgElement = svgContentRef.current?.querySelector('svg')
    if (!svgElement) return

    const handleElementClick = (e: Event) => {
      const mouseEvent = e as unknown as React.MouseEvent
      const target = e.target as SVGElement

      // Don't select the root SVG element
      if (target.tagName.toLowerCase() === 'svg') {
        // Clear selection only if not holding Ctrl/Cmd
        if (!mouseEvent.ctrlKey && !mouseEvent.metaKey) {
          selectElement(null)
        }
        return
      }

      // Stop propagation to prevent parent elements from being selected
      e.stopPropagation()

      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed for multi-selection
      const isMultiSelect = mouseEvent.ctrlKey || mouseEvent.metaKey

      if (isMultiSelect) {
        // Toggle element in selection
        toggleElement(target)
      } else {
        // Single selection (replace existing)
        selectElement(target, false)
      }
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
  }, [svgContent, selectElement, toggleElement])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A - select all elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        const svgElement = svgContentRef.current?.querySelector('svg')
        if (svgElement) {
          const allElements = Array.from(svgElement.querySelectorAll(':scope > *'))
            .filter(el => el.tagName.toLowerCase() !== 'svg') as SVGElement[]
          selectMultiple(allElements)
        }
        return
      }

      // Delete key - remove selected elements
      if (e.key === 'Delete' && selectedElements.length > 0) {
        const elements = selectedElements.map(sel => sel.element)
        const command = new DeleteElementCommand(elements)
        executeCommand(command)
        clearSelection()
      }

      // Escape key - clear selection
      if (e.key === 'Escape') {
        clearSelection()
      }

      // Arrow keys - move selected elements
      if (selectedElements.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
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

        // Move all selected elements using command
        const elements = selectedElements.map(sel => sel.element)
        const command = new MoveElementCommand(elements, deltaX, deltaY, viewport.scale)
        executeCommand(command)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElements, clearSelection, selectMultiple, executeCommand, viewport.scale])

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

  /**
   * Generate composite SVG from multiple assets
   */
  const generateCompositeContent = (): string => {
    if (!useAssetMode || assets.length === 0) {
      return svgContent || ''
    }

    const sortedAssets = getSortedAssets().filter(asset => asset.visible)

    if (sortedAssets.length === 0) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"></svg>'
    }

    // Create a wrapper SVG that contains all assets
    const groups = sortedAssets.map(asset => {
      // Parse the asset's SVG content to extract its elements
      const parser = new DOMParser()
      const doc = parser.parseFromString(asset.content, 'image/svg+xml')
      const svgElement = doc.querySelector('svg')

      if (!svgElement) return ''

      // Get the inner content of the SVG
      const innerContent = svgElement.innerHTML

      // Create a group with transformations
      const transform = [
        `translate(${asset.position.x}, ${asset.position.y})`,
        `scale(${asset.scale})`,
        asset.rotation ? `rotate(${asset.rotation})` : '',
      ].filter(Boolean).join(' ')

      const opacity = asset.opacity !== undefined ? asset.opacity : 1

      return `<g
        data-asset-id="${asset.id}"
        data-asset-name="${asset.name}"
        transform="${transform}"
        opacity="${opacity}"
      >${innerContent}</g>`
    }).join('\n')

    // Create composite SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 600">
      ${groups}
    </svg>`
  }

  // Get the content to render (either single SVG or composite)
  const contentToRender = useAssetMode ? generateCompositeContent() : (svgContent || '')

  return (
    <div className="svg-viewer">
      <TreePanel />
      <ElementInspector />
      <Toolbar />
      <div className="viewer-controls">
        <button onClick={handleZoomIn} title="Zoom In">+</button>
        <button onClick={handleZoomOut} title="Zoom Out">-</button>
        <button onClick={handleReset} title="Reset View">Reset</button>
        <span className="zoom-level">{Math.round(viewport.scale * 100)}%</span>
        {selectedElements.length > 0 && (
          <span className="selection-count" title={`${selectedElements.length} element${selectedElements.length > 1 ? 's' : ''} selected`}>
            ✓ {selectedElements.length}
          </span>
        )}
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
        <MarqueeSelection containerRef={containerRef} isEnabled={!isPanning} />
        <SelectionOverlay />
        <div
          ref={svgContentRef}
          className="svg-content"
          style={{
            transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
          }}
          dangerouslySetInnerHTML={{ __html: contentToRender }}
        />
      </div>
    </div>
  )
}

export default SVGViewer

