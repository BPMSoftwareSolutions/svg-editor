import { createContext, useContext, useState, useRef, useCallback, ReactNode, RefObject } from 'react'

export interface ViewportState {
  scale: number
  translateX: number
  translateY: number
}

interface ViewportContextType {
  viewport: ViewportState
  containerRef: RefObject<HTMLDivElement>
  svgContentRef: RefObject<HTMLDivElement>
  updateViewport: (updates: Partial<ViewportState>) => void
  setViewport: (viewport: ViewportState) => void
  panBy: (deltaX: number, deltaY: number) => void
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined)

interface ViewportProviderProps {
  children: ReactNode
}

export function ViewportProvider({ children }: ViewportProviderProps) {
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const svgContentRef = useRef<HTMLDivElement>(null)

  const updateViewport = useCallback((updates: Partial<ViewportState>) => {
    setViewport(prev => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    setViewport(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }))
  }, [])

  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(10, prev.scale * 1.2),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale / 1.2),
    }))
  }, [])

  const reset = useCallback(() => {
    setViewport({
      scale: 1,
      translateX: 0,
      translateY: 0,
    })
  }, [])

  const value: ViewportContextType = {
    viewport,
    containerRef,
    svgContentRef,
    updateViewport,
    setViewport,
    panBy,
    zoomIn,
    zoomOut,
    reset,
  }

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  )
}

export function useViewport(): ViewportContextType {
  const context = useContext(ViewportContext)
  if (!context) {
    throw new Error('useViewport must be used within a ViewportProvider')
  }
  return context
}

