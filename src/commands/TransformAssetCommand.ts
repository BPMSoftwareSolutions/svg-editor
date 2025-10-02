import { Command } from '../types/command'
import { SVGAsset } from '../types/asset'

/**
 * Command to transform an asset (position, scale, rotation, opacity)
 * Stores original and new transform states for undo/redo
 */
export class TransformAssetCommand implements Command {
  private originalState: Partial<SVGAsset>
  private newState: Partial<SVGAsset>
  public description: string

  constructor(
    private assetId: string,
    private updates: Partial<SVGAsset>,
    private getAssetFn: (id: string) => SVGAsset | undefined,
    private updateAssetFn: (id: string, updates: Partial<SVGAsset>) => void
  ) {
    const asset = this.getAssetFn(assetId)
    
    // Store original state
    this.originalState = {}
    this.newState = updates
    
    if (asset) {
      // Only store properties that are being changed
      Object.keys(updates).forEach(key => {
        this.originalState[key as keyof SVGAsset] = asset[key as keyof SVGAsset]
      })
    }

    // Generate description based on what's being transformed
    const transformTypes: string[] = []
    if (updates.position) transformTypes.push('position')
    if (updates.scale) transformTypes.push('scale')
    if (updates.rotation !== undefined) transformTypes.push('rotation')
    if (updates.opacity !== undefined) transformTypes.push('opacity')
    
    this.description = `Transform asset: ${transformTypes.join(', ')}`
  }

  execute(): void {
    this.updateAssetFn(this.assetId, this.newState)
    console.log('[TransformAssetCommand] Transformed asset:', this.assetId, this.newState)
  }

  undo(): void {
    this.updateAssetFn(this.assetId, this.originalState)
    console.log('[TransformAssetCommand] Reverted asset transform:', this.assetId, this.originalState)
  }
}

