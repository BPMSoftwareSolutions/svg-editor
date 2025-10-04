import { useState, useCallback, MouseEvent } from 'react'

export type ResizeHandle =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'

interface ResizeState {
  isResizing: boolean
  handle: ResizeHandle | null
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startLeft: number
  startTop: number
  // Track viewport transform at resize start to compensate for coordinate space
  startViewportScale: number
}

interface UseResizeOptions {
  onResizeStart?: (handle: ResizeHandle) => void
  onResize?: (width: number, height: number, left: number, top: number) => void
  onResizeEnd?: (width: number, height: number, left: number, top: number) => void
  maintainAspectRatio?: boolean
  viewportScale?: number // Current viewport scale for coordinate mapping
}

export function useResize({
  onResizeStart,
  onResize,
  onResizeEnd,
  maintainAspectRatio = false,
  viewportScale = 1,
}: UseResizeOptions = {}) {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
    startViewportScale: 1,
  })

  const handleResizeStart = useCallback(
    (e: MouseEvent, handle: ResizeHandle, bbox: DOMRect) => {
      e.stopPropagation()

      setResizeState({
        isResizing: true,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: bbox.width,
        startHeight: bbox.height,
        startLeft: bbox.left,
        startTop: bbox.top,
        startViewportScale: viewportScale,
      })

      onResizeStart?.(handle)
    },
    [onResizeStart, viewportScale]
  )

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.handle) return

      // Raw mouse delta in screen pixels
      const rawDeltaX = e.clientX - resizeState.startX
      const rawDeltaY = e.clientY - resizeState.startY

      // The selection overlay is inside .svg-content which has a scale transform.
      // Mouse moves in screen space, but the overlay is in scaled space.
      // We DON'T need to divide by scale here because:
      // 1. bbox dimensions are already in screen pixels (from getBoundingClientRect)
      // 2. We're calculating new screen-pixel dimensions
      // 3. The conversion to SVG units happens in SelectionOverlay's onResize callback
      const deltaX = rawDeltaX
      const deltaY = rawDeltaY

      let newWidth = resizeState.startWidth
      let newHeight = resizeState.startHeight
      let newLeft = resizeState.startLeft
      let newTop = resizeState.startTop

      const handle = resizeState.handle

      // Calculate new dimensions based on handle
      if (handle.includes('right')) {
        newWidth = resizeState.startWidth + deltaX
      }
      if (handle.includes('left')) {
        newWidth = resizeState.startWidth - deltaX
        newLeft = resizeState.startLeft + deltaX
      }
      if (handle.includes('bottom')) {
        newHeight = resizeState.startHeight + deltaY
      }
      if (handle.includes('top')) {
        newHeight = resizeState.startHeight - deltaY
        newTop = resizeState.startTop + deltaY
      }

      // Maintain aspect ratio if needed
      if (maintainAspectRatio) {
        const aspectRatio = resizeState.startWidth / resizeState.startHeight

        if (handle.includes('left') || handle.includes('right')) {
          newHeight = newWidth / aspectRatio
          if (handle.includes('top')) {
            newTop = resizeState.startTop + (resizeState.startHeight - newHeight)
          }
        } else {
          newWidth = newHeight * aspectRatio
          if (handle.includes('left')) {
            newLeft = resizeState.startLeft + (resizeState.startWidth - newWidth)
          }
        }
      }

      // Ensure minimum size
      newWidth = Math.max(10, newWidth)
      newHeight = Math.max(10, newHeight)

      onResize?.(newWidth, newHeight, newLeft, newTop)
    },
    [resizeState, maintainAspectRatio, onResize]
  )

  const handleResizeEnd = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing) return

      const rawDeltaX = e.clientX - resizeState.startX
      const rawDeltaY = e.clientY - resizeState.startY

      const deltaX = rawDeltaX
      const deltaY = rawDeltaY

      let finalWidth = resizeState.startWidth
      let finalHeight = resizeState.startHeight
      let finalLeft = resizeState.startLeft
      let finalTop = resizeState.startTop

      const handle = resizeState.handle

      if (handle?.includes('right')) {
        finalWidth = resizeState.startWidth + deltaX
      }
      if (handle?.includes('left')) {
        finalWidth = resizeState.startWidth - deltaX
        finalLeft = resizeState.startLeft + deltaX
      }
      if (handle?.includes('bottom')) {
        finalHeight = resizeState.startHeight + deltaY
      }
      if (handle?.includes('top')) {
        finalHeight = resizeState.startHeight - deltaY
        finalTop = resizeState.startTop + deltaY
      }

      if (maintainAspectRatio && handle) {
        const aspectRatio = resizeState.startWidth / resizeState.startHeight

        if (handle.includes('left') || handle.includes('right')) {
          finalHeight = finalWidth / aspectRatio
          if (handle.includes('top')) {
            finalTop = resizeState.startTop + (resizeState.startHeight - finalHeight)
          }
        } else {
          finalWidth = finalHeight * aspectRatio
          if (handle.includes('left')) {
            finalLeft = resizeState.startLeft + (resizeState.startWidth - finalWidth)
          }
        }
      }

      finalWidth = Math.max(10, finalWidth)
      finalHeight = Math.max(10, finalHeight)

      setResizeState({
        isResizing: false,
        handle: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        startLeft: 0,
        startTop: 0,
        startViewportScale: 1,
      })

      onResizeEnd?.(finalWidth, finalHeight, finalLeft, finalTop)
    },
    [resizeState, maintainAspectRatio, onResizeEnd]
  )

  return {
    isResizing: resizeState.isResizing,
    resizeHandle: resizeState.handle,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  }
}

