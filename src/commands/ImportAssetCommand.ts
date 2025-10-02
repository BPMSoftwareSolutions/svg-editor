import { Command } from '../types/command'
import { SVGAsset } from '../types/asset'

/**
 * Command to import an asset to the canvas
 * Supports undo/redo for asset import operations
 */
export class ImportAssetCommand implements Command {
  private assetId: string | null = null
  public description: string

  constructor(
    private asset: Omit<SVGAsset, 'id' | 'importedAt'>,
    private addAssetFn: (asset: Omit<SVGAsset, 'id' | 'importedAt'>) => string,
    private removeAssetFn: (id: string) => void
  ) {
    this.description = `Import asset: ${asset.name}`
  }

  execute(): void {
    // Add the asset and store its ID
    this.assetId = this.addAssetFn(this.asset)
    console.log('[ImportAssetCommand] Imported asset:', this.assetId, this.asset.name)
  }

  undo(): void {
    if (this.assetId) {
      this.removeAssetFn(this.assetId)
      console.log('[ImportAssetCommand] Removed asset:', this.assetId)
    }
  }
}

