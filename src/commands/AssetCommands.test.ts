import { describe, it, expect, vi } from 'vitest'
import { ImportAssetCommand } from './ImportAssetCommand'
import { RemoveAssetCommand } from './RemoveAssetCommand'
import { TransformAssetCommand } from './TransformAssetCommand'
import { SVGAsset } from '../types/asset'

describe('Asset Commands', () => {
  const createMockAsset = (overrides?: Partial<Omit<SVGAsset, 'id' | 'importedAt'>>): Omit<SVGAsset, 'id' | 'importedAt'> => ({
    name: 'test.svg',
    content: '<svg><circle cx="50" cy="50" r="40" /></svg>',
    position: { x: 0, y: 0 },
    scale: 1,
    zIndex: 0,
    visible: true,
    rotation: 0,
    opacity: 1,
    ...overrides,
  })

  const createFullMockAsset = (id: string = 'asset-1'): SVGAsset => ({
    ...createMockAsset(),
    id,
    importedAt: Date.now(),
  })

  describe('ImportAssetCommand', () => {
    it('should import an asset on execute', () => {
      const mockAsset = createMockAsset()
      const mockAddAsset = vi.fn().mockReturnValue('asset-123')
      const mockRemoveAsset = vi.fn()

      const command = new ImportAssetCommand(mockAsset, mockAddAsset, mockRemoveAsset)
      command.execute()

      expect(mockAddAsset).toHaveBeenCalledWith(mockAsset)
      expect(mockAddAsset).toHaveBeenCalledTimes(1)
    })

    it('should remove the asset on undo', () => {
      const mockAsset = createMockAsset()
      const mockAddAsset = vi.fn().mockReturnValue('asset-123')
      const mockRemoveAsset = vi.fn()

      const command = new ImportAssetCommand(mockAsset, mockAddAsset, mockRemoveAsset)
      command.execute()
      command.undo()

      expect(mockRemoveAsset).toHaveBeenCalledWith('asset-123')
      expect(mockRemoveAsset).toHaveBeenCalledTimes(1)
    })

    it('should have correct description', () => {
      const mockAsset = createMockAsset({ name: 'my-asset.svg' })
      const mockAddAsset = vi.fn().mockReturnValue('asset-123')
      const mockRemoveAsset = vi.fn()

      const command = new ImportAssetCommand(mockAsset, mockAddAsset, mockRemoveAsset)
      expect(command.description).toBe('Import asset: my-asset.svg')
    })

    it('should be able to redo after undo', () => {
      const mockAsset = createMockAsset()
      const mockAddAsset = vi.fn().mockReturnValue('asset-123')
      const mockRemoveAsset = vi.fn()

      const command = new ImportAssetCommand(mockAsset, mockAddAsset, mockRemoveAsset)
      
      command.execute()
      command.undo()
      command.execute()

      expect(mockAddAsset).toHaveBeenCalledTimes(2)
      expect(mockRemoveAsset).toHaveBeenCalledTimes(1)
    })
  })

  describe('RemoveAssetCommand', () => {
    it('should remove an asset on execute', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockRemoveAsset = vi.fn()
      const mockAddAsset = vi.fn()

      const command = new RemoveAssetCommand('asset-123', mockGetAsset, mockRemoveAsset, mockAddAsset)
      command.execute()

      expect(mockRemoveAsset).toHaveBeenCalledWith('asset-123')
      expect(mockRemoveAsset).toHaveBeenCalledTimes(1)
    })

    it('should restore the asset on undo', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockRemoveAsset = vi.fn()
      const mockAddAsset = vi.fn()

      const command = new RemoveAssetCommand('asset-123', mockGetAsset, mockRemoveAsset, mockAddAsset)
      command.execute()
      command.undo()

      expect(mockAddAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockAsset.name,
          content: mockAsset.content,
          position: mockAsset.position,
        })
      )
    })

    it('should have correct description', () => {
      const mockAsset = createFullMockAsset('asset-123')
      mockAsset.name = 'my-asset.svg'
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockRemoveAsset = vi.fn()
      const mockAddAsset = vi.fn()

      const command = new RemoveAssetCommand('asset-123', mockGetAsset, mockRemoveAsset, mockAddAsset)
      expect(command.description).toBe('Remove asset: my-asset.svg')
    })

    it('should handle non-existent asset gracefully', () => {
      const mockGetAsset = vi.fn().mockReturnValue(undefined)
      const mockRemoveAsset = vi.fn()
      const mockAddAsset = vi.fn()

      const command = new RemoveAssetCommand('non-existent', mockGetAsset, mockRemoveAsset, mockAddAsset)
      command.execute()
      command.undo()

      // Should not crash, but also shouldn't add anything
      expect(mockAddAsset).not.toHaveBeenCalled()
    })
  })

  describe('TransformAssetCommand', () => {
    it('should transform an asset on execute', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockUpdateAsset = vi.fn()

      const updates = { position: { x: 100, y: 200 }, scale: 1.5 }
      const command = new TransformAssetCommand('asset-123', updates, mockGetAsset, mockUpdateAsset)
      command.execute()

      expect(mockUpdateAsset).toHaveBeenCalledWith('asset-123', updates)
    })

    it('should restore original state on undo', () => {
      const mockAsset = createFullMockAsset('asset-123')
      mockAsset.position = { x: 0, y: 0 }
      mockAsset.scale = 1
      
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockUpdateAsset = vi.fn()

      const updates = { position: { x: 100, y: 200 }, scale: 1.5 }
      const command = new TransformAssetCommand('asset-123', updates, mockGetAsset, mockUpdateAsset)
      
      command.execute()
      command.undo()

      expect(mockUpdateAsset).toHaveBeenCalledWith('asset-123', {
        position: { x: 0, y: 0 },
        scale: 1,
      })
    })

    it('should have correct description for position transform', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockUpdateAsset = vi.fn()

      const updates = { position: { x: 100, y: 200 } }
      const command = new TransformAssetCommand('asset-123', updates, mockGetAsset, mockUpdateAsset)
      
      expect(command.description).toBe('Transform asset: position')
    })

    it('should have correct description for multiple transforms', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockUpdateAsset = vi.fn()

      const updates = { 
        position: { x: 100, y: 200 }, 
        scale: 1.5,
        rotation: 45,
        opacity: 0.8,
      }
      const command = new TransformAssetCommand('asset-123', updates, mockGetAsset, mockUpdateAsset)
      
      expect(command.description).toContain('position')
      expect(command.description).toContain('scale')
      expect(command.description).toContain('rotation')
      expect(command.description).toContain('opacity')
    })

    it('should be able to redo after undo', () => {
      const mockAsset = createFullMockAsset('asset-123')
      const mockGetAsset = vi.fn().mockReturnValue(mockAsset)
      const mockUpdateAsset = vi.fn()

      const updates = { position: { x: 100, y: 200 } }
      const command = new TransformAssetCommand('asset-123', updates, mockGetAsset, mockUpdateAsset)
      
      command.execute()
      command.undo()
      command.execute()

      expect(mockUpdateAsset).toHaveBeenCalledTimes(3) // execute, undo, execute
    })
  })
})

