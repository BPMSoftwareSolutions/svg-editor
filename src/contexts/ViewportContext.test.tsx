import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ViewportProvider, useViewport } from './ViewportContext'
import { ReactNode } from 'react'

describe('ViewportContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ViewportProvider>{children}</ViewportProvider>
  )

  describe('Initial State', () => {
    it('should initialize with default viewport state', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    })

    it('should provide containerRef and svgContentRef', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      expect(result.current.containerRef).toBeDefined()
      expect(result.current.svgContentRef).toBeDefined()
      expect(result.current.containerRef.current).toBeNull() // Not attached to DOM
      expect(result.current.svgContentRef.current).toBeNull() // Not attached to DOM
    })
  })

  describe('updateViewport', () => {
    it('should update viewport with partial updates', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ scale: 2 })
      })

      expect(result.current.viewport).toEqual({
        scale: 2,
        translateX: 0,
        translateY: 0,
      })
    })

    it('should update multiple properties at once', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ scale: 1.5, translateX: 100 })
      })

      expect(result.current.viewport).toEqual({
        scale: 1.5,
        translateX: 100,
        translateY: 0,
      })
    })

    it('should preserve existing values when updating', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ scale: 2, translateX: 50 })
      })

      act(() => {
        result.current.updateViewport({ translateY: 75 })
      })

      expect(result.current.viewport).toEqual({
        scale: 2,
        translateX: 50,
        translateY: 75,
      })
    })
  })

  describe('setViewport', () => {
    it('should replace entire viewport state', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ scale: 2, translateX: 100 })
      })

      act(() => {
        result.current.setViewport({ scale: 1, translateX: 0, translateY: 0 })
      })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    })
  })

  describe('panBy', () => {
    it('should pan viewport by delta values', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.panBy(50, 30)
      })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 50,
        translateY: 30,
      })
    })

    it('should accumulate pan deltas', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.panBy(50, 30)
      })

      act(() => {
        result.current.panBy(25, 15)
      })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 75,
        translateY: 45,
      })
    })

    it('should handle negative pan values', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.panBy(100, 100)
      })

      act(() => {
        result.current.panBy(-50, -30)
      })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 50,
        translateY: 70,
      })
    })
  })

  describe('zoomIn', () => {
    it('should increase scale by 1.2x', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.viewport.scale).toBeCloseTo(1.2, 5)
    })

    it('should not exceed maximum scale of 10', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.setViewport({ scale: 9, translateX: 0, translateY: 0 })
      })

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.viewport.scale).toBe(10)

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.viewport.scale).toBe(10)
    })

    it('should preserve translate values when zooming', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ translateX: 100, translateY: 50 })
      })

      act(() => {
        result.current.zoomIn()
      })

      expect(result.current.viewport.translateX).toBe(100)
      expect(result.current.viewport.translateY).toBe(50)
    })
  })

  describe('zoomOut', () => {
    it('should decrease scale by dividing by 1.2', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.setViewport({ scale: 2, translateX: 0, translateY: 0 })
      })

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.viewport.scale).toBeCloseTo(2 / 1.2, 5)
    })

    it('should not go below minimum scale of 0.1', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.setViewport({ scale: 0.12, translateX: 0, translateY: 0 })
      })

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.viewport.scale).toBe(0.1)

      act(() => {
        result.current.zoomOut()
      })

      expect(result.current.viewport.scale).toBe(0.1)
    })
  })

  describe('reset', () => {
    it('should reset viewport to initial state', () => {
      const { result } = renderHook(() => useViewport(), { wrapper })

      act(() => {
        result.current.updateViewport({ scale: 3, translateX: 200, translateY: 150 })
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.viewport).toEqual({
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw error when useViewport is used outside provider', () => {
      expect(() => {
        renderHook(() => useViewport())
      }).toThrow('useViewport must be used within a ViewportProvider')
    })
  })
})

