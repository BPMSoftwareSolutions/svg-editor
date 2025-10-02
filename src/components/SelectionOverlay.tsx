import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { useUndoRedo } from '../contexts/UndoRedoContext'
import { useAssets } from '../contexts/AssetContext'
import { applyTranslation, parseTransform, serializeTransform } from '../utils/transform'
import { useResize, ResizeHandle } from '../hooks/useResize'
import { MoveElementCommand, ResizeElementCommand } from '../commands'
import '../styles/SelectionOverlay.css'

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

function SelectionOverlay() {
  const { selectedElement, selectedElements } = useSelection()
  const { addToHistory } = useUndoRedo()
  const { updateAsset, getAsset } = useAssets()
  const [bbox, setBbox] = useState<BoundingBox | null>(null)
  const [multiSelectionBoxes, setMultiSelectionBoxes] = useState<BoundingBox[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const dragTotalDeltaRef = useRef({ x: 0, y: 0 })
  const dragStartTransformsRef = useRef<string[]>([])
  const overlayRef = useRef<HTMLDivElement>(null)
  const resizeStartDimensionsRef = useRef<{ width: number; height: number } | null>(null)
  const resizeStartTransformRef = useRef<string | null>(null)

  const { isResizing, handleResizeStart, handleResizeMove, handleResizeEnd } = useResize({
    onResizeStart: () => {
      if (!selectedElement) return

      const element = selectedElement.element

      // Store original dimensions
      const rect = element.getBoundingClientRect()
      resizeStartDimensionsRef.current = {
        width: rect.width,
        height: rect.height,
      }

      // Store original transform for groups and other transform-based elements
      const tagName = element.tagName.toLowerCase()
      if (!['rect', 'circle', 'ellipse', 'image', 'line'].includes(tagName)) {
        resizeStartTransformRef.current = element.getAttribute('transform') || ''
      }
    },
    onResize: (width, height, _left, _top) => {
      if (!selectedElement || !resizeStartDimensionsRef.current) return

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
        case 'circle': {
          const radius = Math.min(width, height) / (2 * scale)
          element.setAttribute('r', radius.toString())
          break
        }
        case 'ellipse':
          element.setAttribute('rx', (width / (2 * scale)).toString())
          element.setAttribute('ry', (height / (2 * scale)).toString())
          break
        default: {
          // For groups and other elements, apply transform scale
          const startDimensions = resizeStartDimensionsRef.current
          const startTransform = resizeStartTransformRef.current || ''

          // Calculate scale ratio relative to original dimensions
          const scaleXRatio = width / startDimensions.width
          const scaleYRatio = height / startDimensions.height

          // Parse the original transform
          const transformData = parseTransform(startTransform)

          // Apply the scale ratio to the original scale
          transformData.scaleX *= scaleXRatio
          transformData.scaleY *= scaleYRatio

          // Serialize and apply using the proper serialization function
          const newTransform = serializeTransform(transformData)
          element.setAttribute('transform', newTransform)
          break
        }
      }

      // Update bounding box
      updateBbox()
    },
    onResizeEnd: (width, height) => {
      if (!selectedElement || !resizeStartDimensionsRef.current) return

      const element = selectedElement.element
      const startDimensions = resizeStartDimensionsRef.current

      // Get viewport scale
      const viewerContainer = document.querySelector('.svg-content') as HTMLElement
      const transform = viewerContainer?.style.transform || ''
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

      console.log('[SelectionOverlay] Creating ResizeElementCommand:', {
        originalWidth: startDimensions.width,
        originalHeight: startDimensions.height,
        newWidth: width,
        newHeight: height,
        scale
      })

      // Create resize command
      const command = new ResizeElementCommand(
        element,
        startDimensions.width,
        startDimensions.height,
        width,
        height,
        scale
      )

      // IMPORTANT: Use addToHistory instead of executeCommand because the resize
      // has already been applied during the resize operation
      addToHistory(command)

      // If this is an asset group, sync the scale with the asset context
      const assetId = element.getAttribute('data-asset-id')
      if (assetId) {
        const asset = getAsset(assetId)
        if (asset) {
          // Parse the current transform to get the new scale
          const currentTransform = element.getAttribute('transform') || ''
          const transformData = parseTransform(currentTransform)

          // Update the asset's scale property
          updateAsset(assetId, { scale: transformData.scaleX })

          console.log('[SelectionOverlay] Synced asset scale:', assetId, transformData.scaleX)
        }
      }

      resizeStartDimensionsRef.current = null
      resizeStartTransformRef.current = null
    },
  })

  // Calculate combined bounding box for all selected elements
  const getCombinedBoundingBox = useCallback((): BoundingBox | null => {
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
  }, [selectedElements])

  const updateBbox = useCallback(() => {
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
  }, [selectedElements, getCombinedBoundingBox])

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
  }, [selectedElements, updateBbox])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedElements.length === 0 || isResizing) return

    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    dragTotalDeltaRef.current = { x: 0, y: 0 }

    // Capture original transforms before drag starts
    dragStartTransformsRef.current = selectedElements.map(sel =>
      sel.element.getAttribute('transform') || ''
    )

    console.log('[SelectionOverlay] Starting drag, captured original transforms:', dragStartTransformsRef.current)

    document.body.style.cursor = 'grabbing'
  }

  const handleHandleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (!selectedElement || !bbox) return

    e.stopPropagation()

    const rect = selectedElement.element.getBoundingClientRect()
    handleResizeStart(e, handle, rect)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || selectedElements.length === 0) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    // Accumulate total delta for command
    dragTotalDeltaRef.current.x += deltaX
    dragTotalDeltaRef.current.y += deltaY

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
  }, [isDragging, selectedElements, updateBbox])

  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedElements.length > 0) {
      // Get viewport scale
      const viewerContainer = document.querySelector('.svg-content') as HTMLElement
      const transform = viewerContainer?.style.transform || ''
      const scaleMatch = transform.match(/scale\(([^)]+)\)/)
      const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1

      // Create move command with total delta
      const totalDelta = dragTotalDeltaRef.current
      if (totalDelta.x !== 0 || totalDelta.y !== 0) {
        console.log('[SelectionOverlay] Creating MoveElementCommand:', {
          deltaX: totalDelta.x,
          deltaY: totalDelta.y,
          scale,
          elementCount: selectedElements.length,
          originalTransforms: dragStartTransformsRef.current
        })

        const elements = selectedElements.map(sel => sel.element)
        const command = new MoveElementCommand(
          elements,
          totalDelta.x,
          totalDelta.y,
          scale,
          dragStartTransformsRef.current
        )

        // IMPORTANT: Use addToHistory instead of executeCommand because the move
        // has already been applied during drag. We just need to add it to history for undo/redo
        addToHistory(command)
      }
    }

    setIsDragging(false)
    dragStartTransformsRef.current = []
    document.body.style.cursor = ''
  }, [isDragging, selectedElements, addToHistory])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, selectedElements, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (isResizing) {
      const handleMove = (e: Event) => handleResizeMove(e as unknown as React.MouseEvent)
      const handleUp = (e: Event) => handleResizeEnd(e as unknown as React.MouseEvent)

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

