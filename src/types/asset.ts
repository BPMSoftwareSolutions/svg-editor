/**
 * Asset Management Type Definitions for Multi-SVG Support
 * 
 * These types support loading and managing multiple SVG files as assets
 * on a single canvas, enabling composite visualizations and digital asset merging.
 */

/**
 * Represents a single SVG asset loaded onto the canvas
 */
export interface SVGAsset {
  /**
   * Unique identifier for the asset
   * Generated using crypto.randomUUID() or similar
   */
  id: string

  /**
   * Original filename of the SVG
   */
  name: string

  /**
   * SVG content as a string
   */
  content: string

  /**
   * Position of the asset on the canvas
   */
  position: {
    x: number
    y: number
  }

  /**
   * Scale factor for the asset (1.0 = 100%)
   */
  scale: number

  /**
   * Z-index for layering (higher values appear on top)
   */
  zIndex: number

  /**
   * Whether the asset is visible on the canvas
   */
  visible: boolean

  /**
   * Rotation angle in degrees
   */
  rotation?: number

  /**
   * Opacity (0-1)
   */
  opacity?: number

  /**
   * Timestamp when the asset was imported
   */
  importedAt: number
}

/**
 * Context type for the Asset Management system
 */
export interface AssetContextType {
  /**
   * Array of all assets currently loaded
   */
  assets: SVGAsset[]

  /**
   * Currently active/selected asset ID (if any)
   */
  activeAssetId: string | null

  /**
   * Add a new asset to the canvas
   */
  addAsset: (asset: Omit<SVGAsset, 'id' | 'importedAt'>) => string

  /**
   * Update an existing asset's properties
   */
  updateAsset: (id: string, updates: Partial<SVGAsset>) => void

  /**
   * Remove an asset from the canvas
   */
  removeAsset: (id: string) => void

  /**
   * Reorder assets (change z-index)
   */
  reorderAssets: (fromIndex: number, toIndex: number) => void

  /**
   * Set the active asset
   */
  setActiveAsset: (id: string | null) => void

  /**
   * Get an asset by ID
   */
  getAsset: (id: string) => SVGAsset | undefined

  /**
   * Clear all assets
   */
  clearAssets: () => void

  /**
   * Get assets sorted by z-index
   */
  getSortedAssets: () => SVGAsset[]
}

/**
 * Props for the enhanced FileUploader component
 */
export interface MultiFileUploaderProps {
  /**
   * Callback when files are loaded
   * Can handle both single and multiple files
   */
  onFileLoad?: (content: string, fileName: string) => void

  /**
   * Callback when multiple files are loaded as assets
   */
  onFilesLoad?: (assets: Omit<SVGAsset, 'id' | 'importedAt'>[]) => void

  /**
   * Maximum number of files that can be uploaded at once
   * Default: unlimited
   */
  maxFiles?: number

  /**
   * Whether to allow directory uploads
   * Default: false
   */
  allowDirectories?: boolean

  /**
   * Whether to enable multi-file selection
   * Default: false (for backward compatibility)
   */
  multiple?: boolean
}

/**
 * Extended SelectedElement interface to include asset metadata
 */
export interface AssetSelectedElement {
  /**
   * The selected SVG element
   */
  element: SVGElement

  /**
   * Element ID
   */
  id: string

  /**
   * Element type (tag name)
   */
  type: string

  /**
   * Bounding box
   */
  bbox: DOMRect

  /**
   * ID of the asset this element belongs to
   * Null if it's not part of an asset (legacy single-file mode)
   */
  assetId: string | null

  /**
   * Whether this element is the root SVG element of an asset
   */
  isAssetRoot: boolean
}

/**
 * Options for exporting composite SVGs
 */
export interface ExportOptions {
  /**
   * Whether to merge all assets into a single SVG
   * Default: true
   */
  mergeAssets: boolean

  /**
   * Whether to preserve layer structure in the export
   * Default: true
   */
  preserveLayers: boolean

  /**
   * Whether to optimize the output (remove unnecessary attributes, etc.)
   * Default: false
   */
  optimizeOutput: boolean

  /**
   * Whether to include metadata about assets in the export
   * Default: false
   */
  includeMetadata: boolean

  /**
   * Only export visible assets
   * Default: true
   */
  visibleOnly: boolean
}

/**
 * Result of an asset import operation
 */
export interface AssetImportResult {
  /**
   * Successfully imported assets
   */
  success: SVGAsset[]

  /**
   * Failed imports with error messages
   */
  failed: Array<{
    fileName: string
    error: string
  }>

  /**
   * Total number of files processed
   */
  total: number
}

/**
 * Configuration for asset positioning
 */
export interface AssetPositionConfig {
  /**
   * Default cascade offset for multiple assets
   */
  cascadeOffset: number

  /**
   * Default scale for imported assets
   */
  defaultScale: number

  /**
   * Whether to center assets on import
   */
  centerOnImport: boolean

  /**
   * Canvas dimensions for positioning calculations
   */
  canvasSize?: {
    width: number
    height: number
  }
}

