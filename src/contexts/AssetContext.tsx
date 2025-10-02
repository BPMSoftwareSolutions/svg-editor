import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { SVGAsset, AssetContextType } from '../types/asset'

const AssetContext = createContext<AssetContextType | undefined>(undefined)

interface AssetProviderProps {
  children: ReactNode
}

/**
 * Asset Management Context Provider
 * Manages multiple SVG assets on the canvas
 */
export function AssetProvider({ children }: AssetProviderProps) {
  const [assets, setAssets] = useState<SVGAsset[]>([])
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null)

  /**
   * Generate a unique ID for an asset
   */
  const generateAssetId = (): string => {
    // Use crypto.randomUUID if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback for older browsers
    return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add a new asset to the canvas
   * Returns the generated asset ID
   */
  const addAsset = useCallback((assetData: Omit<SVGAsset, 'id' | 'importedAt'>): string => {
    const id = generateAssetId()
    const newAsset: SVGAsset = {
      ...assetData,
      id,
      importedAt: Date.now(),
    }

    setAssets(prev => [...prev, newAsset])
    console.log('[AssetContext] Added asset:', id, newAsset.name)
    
    return id
  }, [])

  /**
   * Update an existing asset's properties
   */
  const updateAsset = useCallback((id: string, updates: Partial<SVGAsset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ))
    console.log('[AssetContext] Updated asset:', id, updates)
  }, [])

  /**
   * Remove an asset from the canvas
   */
  const removeAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id))
    
    // Clear active asset if it was removed
    if (activeAssetId === id) {
      setActiveAssetId(null)
    }
    
    console.log('[AssetContext] Removed asset:', id)
  }, [activeAssetId])

  /**
   * Reorder assets by moving from one index to another
   * This affects the z-index/layering
   */
  const reorderAssets = useCallback((fromIndex: number, toIndex: number) => {
    setAssets(prev => {
      const newAssets = [...prev]
      const [movedAsset] = newAssets.splice(fromIndex, 1)
      newAssets.splice(toIndex, 0, movedAsset)
      
      // Update z-index based on new order
      return newAssets.map((asset, index) => ({
        ...asset,
        zIndex: index,
      }))
    })
    
    console.log('[AssetContext] Reordered assets:', fromIndex, '->', toIndex)
  }, [])

  /**
   * Set the active asset
   */
  const setActiveAsset = useCallback((id: string | null) => {
    setActiveAssetId(id)
    console.log('[AssetContext] Set active asset:', id)
  }, [])

  /**
   * Get an asset by ID
   */
  const getAsset = useCallback((id: string): SVGAsset | undefined => {
    return assets.find(asset => asset.id === id)
  }, [assets])

  /**
   * Clear all assets
   */
  const clearAssets = useCallback(() => {
    setAssets([])
    setActiveAssetId(null)
    console.log('[AssetContext] Cleared all assets')
  }, [])

  /**
   * Get assets sorted by z-index (for rendering)
   */
  const getSortedAssets = useCallback((): SVGAsset[] => {
    return [...assets].sort((a, b) => a.zIndex - b.zIndex)
  }, [assets])

  const value: AssetContextType = {
    assets,
    activeAssetId,
    addAsset,
    updateAsset,
    removeAsset,
    reorderAssets,
    setActiveAsset,
    getAsset,
    clearAssets,
    getSortedAssets,
  }

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  )
}

/**
 * Hook to use the Asset context
 */
export function useAssets() {
  const context = useContext(AssetContext)
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider')
  }
  return context
}

