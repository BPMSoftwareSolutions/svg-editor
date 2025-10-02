import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AssetProvider, useAssets } from './AssetContext'
import { SVGAsset } from '../types/asset'

describe('AssetContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AssetProvider>{children}</AssetProvider>
  )

  const createMockAsset = (overrides?: Partial<Omit<SVGAsset, 'id' | 'importedAt'>>): Omit<SVGAsset, 'id' | 'importedAt'> => ({
    name: 'test.svg',
    content: '<svg><circle cx="50" cy="50" r="40" /></svg>',
    position: { x: 0, y: 0 },
    scale: 1,
    zIndex: 0,
    visible: true,
    ...overrides,
  })

  beforeEach(() => {
    // Reset any global state if needed
  })

  it('should start with empty assets', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    expect(result.current.assets).toEqual([])
    expect(result.current.activeAssetId).toBeNull()
  })

  it('should add an asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    const mockAsset = createMockAsset()
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(mockAsset)
    })
    
    expect(assetId).toBeTruthy()
    expect(result.current.assets).toHaveLength(1)
    expect(result.current.assets[0].id).toBe(assetId)
    expect(result.current.assets[0].name).toBe('test.svg')
    expect(result.current.assets[0].importedAt).toBeTruthy()
  })

  it('should add multiple assets', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    act(() => {
      result.current.addAsset(createMockAsset({ name: 'asset1.svg' }))
      result.current.addAsset(createMockAsset({ name: 'asset2.svg' }))
      result.current.addAsset(createMockAsset({ name: 'asset3.svg' }))
    })
    
    expect(result.current.assets).toHaveLength(3)
    expect(result.current.assets[0].name).toBe('asset1.svg')
    expect(result.current.assets[1].name).toBe('asset2.svg')
    expect(result.current.assets[2].name).toBe('asset3.svg')
  })

  it('should update an asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(createMockAsset())
    })
    
    act(() => {
      result.current.updateAsset(assetId, { 
        position: { x: 100, y: 200 },
        scale: 1.5,
      })
    })
    
    const updatedAsset = result.current.assets[0]
    expect(updatedAsset.position.x).toBe(100)
    expect(updatedAsset.position.y).toBe(200)
    expect(updatedAsset.scale).toBe(1.5)
  })

  it('should remove an asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(createMockAsset())
      result.current.addAsset(createMockAsset({ name: 'asset2.svg' }))
    })
    
    expect(result.current.assets).toHaveLength(2)
    
    act(() => {
      result.current.removeAsset(assetId)
    })
    
    expect(result.current.assets).toHaveLength(1)
    expect(result.current.assets[0].name).toBe('asset2.svg')
  })

  it('should clear active asset when removed', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(createMockAsset())
      result.current.setActiveAsset(assetId)
    })
    
    expect(result.current.activeAssetId).toBe(assetId)
    
    act(() => {
      result.current.removeAsset(assetId)
    })
    
    expect(result.current.activeAssetId).toBeNull()
  })

  it('should reorder assets', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    act(() => {
      result.current.addAsset(createMockAsset({ name: 'asset1.svg', zIndex: 0 }))
      result.current.addAsset(createMockAsset({ name: 'asset2.svg', zIndex: 1 }))
      result.current.addAsset(createMockAsset({ name: 'asset3.svg', zIndex: 2 }))
    })
    
    // Move asset at index 0 to index 2
    act(() => {
      result.current.reorderAssets(0, 2)
    })
    
    expect(result.current.assets[0].name).toBe('asset2.svg')
    expect(result.current.assets[1].name).toBe('asset3.svg')
    expect(result.current.assets[2].name).toBe('asset1.svg')
    
    // Check z-index was updated
    expect(result.current.assets[0].zIndex).toBe(0)
    expect(result.current.assets[1].zIndex).toBe(1)
    expect(result.current.assets[2].zIndex).toBe(2)
  })

  it('should set and get active asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(createMockAsset())
    })
    
    act(() => {
      result.current.setActiveAsset(assetId)
    })
    
    expect(result.current.activeAssetId).toBe(assetId)
  })

  it('should get asset by ID', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    let assetId: string = ''
    act(() => {
      assetId = result.current.addAsset(createMockAsset({ name: 'findme.svg' }))
    })
    
    const asset = result.current.getAsset(assetId)
    expect(asset).toBeDefined()
    expect(asset?.name).toBe('findme.svg')
  })

  it('should return undefined for non-existent asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    const asset = result.current.getAsset('non-existent-id')
    expect(asset).toBeUndefined()
  })

  it('should clear all assets', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    act(() => {
      const id = result.current.addAsset(createMockAsset())
      result.current.addAsset(createMockAsset())
      result.current.addAsset(createMockAsset())
      result.current.setActiveAsset(id)
    })
    
    expect(result.current.assets).toHaveLength(3)
    expect(result.current.activeAssetId).toBeTruthy()
    
    act(() => {
      result.current.clearAssets()
    })
    
    expect(result.current.assets).toHaveLength(0)
    expect(result.current.activeAssetId).toBeNull()
  })

  it('should get sorted assets by z-index', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    act(() => {
      result.current.addAsset(createMockAsset({ name: 'asset1.svg', zIndex: 2 }))
      result.current.addAsset(createMockAsset({ name: 'asset2.svg', zIndex: 0 }))
      result.current.addAsset(createMockAsset({ name: 'asset3.svg', zIndex: 1 }))
    })
    
    const sorted = result.current.getSortedAssets()
    expect(sorted[0].name).toBe('asset2.svg')
    expect(sorted[1].name).toBe('asset3.svg')
    expect(sorted[2].name).toBe('asset1.svg')
  })

  it('should generate unique IDs for each asset', () => {
    const { result } = renderHook(() => useAssets(), { wrapper })
    
    const ids: string[] = []
    act(() => {
      ids.push(result.current.addAsset(createMockAsset()))
      ids.push(result.current.addAsset(createMockAsset()))
      ids.push(result.current.addAsset(createMockAsset()))
    })
    
    // Check all IDs are unique
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(3)
  })

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAssets())
    }).toThrow('useAssets must be used within an AssetProvider')
  })
})

