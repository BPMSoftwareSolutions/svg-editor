import { Command } from '../types/command'
import { SVGAsset } from '../types/asset'

/**
 * Command to remove an asset from the canvas
 * Stores the asset data for undo
 */
export class RemoveAssetCommand implements Command {
  private removedAsset: SVGAsset | null = null
  public description: string

  constructor(
    private assetId: string,
    private getAssetFn: (id: string) => SVGAsset | undefined,
    private removeAssetFn: (id: string) => void,
    private addAssetFn: (asset: Omit<SVGAsset, 'id' | 'importedAt'>) => string
  ) {
    const asset = this.getAssetFn(assetId)
    this.description = `Remove asset: ${asset?.name || assetId}`
  }

  execute(): void {
    // Store the asset before removing it
    this.removedAsset = this.getAssetFn(this.assetId) || null
    
    if (this.removedAsset) {
      this.removeAssetFn(this.assetId)
      console.log('[RemoveAssetCommand] Removed asset:', this.assetId)
    }
  }

  undo(): void {
    if (this.removedAsset) {
      // Re-add the asset with its original properties (excluding id and importedAt)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, importedAt, ...assetData } = this.removedAsset
      this.addAssetFn(assetData)
      console.log('[RemoveAssetCommand] Restored asset:', this.removedAsset.name)
    }
  }
}

