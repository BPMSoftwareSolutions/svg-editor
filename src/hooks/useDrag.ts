import { useState, useCallback, MouseEvent } from 'react'

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface UseDragOptions {
  onDragStart?: (x: number, y: number) => void
  onDrag?: (deltaX: number, deltaY: number) => void
  onDragEnd?: (deltaX: number, deltaY: number) => void
}

export function useDrag({ onDragStart, onDrag, onDragEnd }: UseDragOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      const x = e.clientX
      const y = e.clientY

      setDragState({
        isDragging: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      })

      onDragStart?.(x, y)
    },
    [onDragStart]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return

      const currentX = e.clientX
      const currentY = e.clientY
      const deltaX = currentX - dragState.startX
      const deltaY = currentY - dragState.startY

      setDragState(prev => ({
        ...prev,
        currentX,
        currentY,
      }))

      onDrag?.(deltaX, deltaY)
    },
    [dragState.isDragging, dragState.startX, dragState.startY, onDrag]
  )

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging) return

      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY

      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      })

      onDragEnd?.(deltaX, deltaY)
    },
    [dragState.isDragging, dragState.startX, dragState.startY, onDragEnd]
  )

  return {
    isDragging: dragState.isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}

