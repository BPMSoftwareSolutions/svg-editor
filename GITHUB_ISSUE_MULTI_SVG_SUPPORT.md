# Feature Request: Multi-SVG File Support and Digital Asset Merging

## Summary
Add support for loading multiple SVG files onto a single canvas to enable merging and creating professional, high-quality visualizations from multiple digital assets.

## Background
Currently, the SVG Editor supports loading a single SVG file at a time. To create professional visualizations and manage digital assets effectively, users need the ability to:
- Load multiple SVG files onto the same canvas
- Position and layer SVG files relative to each other
- Merge multiple SVG files into a single combined SVG
- Manage imported assets as distinct layers or groups

## User Stories

### As a Designer
- **I want to** load multiple SVG assets onto the same canvas **so that** I can create complex visualizations from reusable components
- **I want to** position imported SVG files independently **so that** I can arrange them to create the desired layout
- **I want to** control the layering of imported SVGs **so that** I can ensure proper visual hierarchy
- **I want to** export the combined result as a single SVG **so that** I can share or use the merged visualization

### As a Content Creator
- **I want to** import logo assets, icons, and graphics **so that** I can combine them into marketing materials
- **I want to** maintain the quality and scalability of all assets **so that** the final output remains professional
- **I want to** organize imported assets into groups **so that** I can manage complex compositions efficiently

### As a Developer
- **I want to** programmatically import SVG assets **so that** I can automate visualization creation
- **I want to** access metadata about imported assets **so that** I can track sources and modifications

## Current Architecture Analysis

### Existing Components That Support Multi-SVG
✅ **Selection System**: Already supports multi-selection with `SelectionContext`
✅ **Command System**: Undo/redo supports operations on multiple elements
✅ **Transform Utilities**: Can handle positioning and scaling of multiple elements
✅ **Canvas Management**: SVGViewer can handle complex SVG structures

### Components Requiring Modification

#### 1. FileUploader Component
**Current State**: Single file upload only
```typescript
// Current: processes single file
const processFile = (file: File) => {
  // Only accepts one .svg file
  onFileLoad(content, file.name)
}
```

**Required Changes**:
- Support multiple file selection
- Queue-based import system
- File validation for multiple SVGs
- Import progress feedback

#### 2. App Component State Management
**Current State**: Single SVG content string
```typescript
const [svgContent, setSvgContent] = useState<string | null>(null)
```

**Required Changes**:
- Multiple SVG asset management
- Canvas composition state
- Asset layer management
- Import/merge workflow state

#### 3. SVGViewer Component
**Current State**: Renders single SVG content
```typescript
dangerouslySetInnerHTML={{ __html: svgContent }}
```

**Required Changes**:
- Composite SVG rendering
- Asset positioning and transformation
- Layer management integration
- Multi-asset selection handling

## Technical Implementation Plan

### Phase 1: Core Multi-File Infrastructure
1. **Enhanced FileUploader**
   ```typescript
   interface MultiFileUploaderProps {
     onFilesLoad: (assets: SVGAsset[]) => void
     maxFiles?: number
     allowDirectories?: boolean
   }
   
   interface SVGAsset {
     id: string
     name: string
     content: string
     position: { x: number, y: number }
     scale: number
     zIndex: number
     visible: boolean
   }
   ```

2. **Asset Management Context**
   ```typescript
   interface AssetContextType {
     assets: SVGAsset[]
     addAsset: (asset: SVGAsset) => void
     updateAsset: (id: string, updates: Partial<SVGAsset>) => void
     removeAsset: (id: string) => void
     reorderAssets: (fromIndex: number, toIndex: number) => void
   }
   ```

3. **Composite SVG Renderer**
   ```typescript
   interface CompositeCanvasProps {
     assets: SVGAsset[]
     viewport: ViewportState
     onAssetSelect: (assetId: string) => void
   }
   ```

### Phase 2: Asset Management UI
1. **Asset Library Panel**
   - List of imported SVG files
   - Thumbnail previews
   - Visibility toggles
   - Layer reordering (drag & drop)
   - Delete/rename capabilities

2. **Import Workflow**
   - Multi-file selection dialog
   - Import progress indicators
   - Automatic positioning algorithms
   - Conflict resolution (duplicate names)

3. **Layer Controls**
   - Bring to front/send to back
   - Lock/unlock layers
   - Group/ungroup assets
   - Opacity controls

### Phase 3: Advanced Features
1. **Asset Positioning**
   - Smart auto-arrangement
   - Grid snapping for assets
   - Alignment tools
   - Distribution controls

2. **Merge and Export**
   - Flatten layers option
   - Maintain layer structure
   - Export options (single SVG, layered SVG)
   - Optimization settings

### Phase 4: Professional Features
1. **Asset Templates**
   - Save/load asset combinations
   - Template library
   - Asset presets

2. **Performance Optimization**
   - Lazy loading for large assets
   - Virtual scrolling for asset lists
   - Canvas rendering optimization

## Implementation Details

### New Command Types
```typescript
class ImportAssetCommand implements Command {
  constructor(private asset: SVGAsset) {}
  execute(): void { /* Add asset to canvas */ }
  undo(): void { /* Remove asset from canvas */ }
}

class MergeAssetsCommand implements Command {
  constructor(private assetIds: string[]) {}
  execute(): void { /* Merge selected assets */ }
  undo(): void { /* Restore individual assets */ }
}
```

### Enhanced Selection System
```typescript
interface AssetSelection extends SelectedElement {
  assetId: string
  isAssetRoot: boolean
}
```

### Export Enhancement
```typescript
interface ExportOptions {
  mergeAssets: boolean
  preserveLayers: boolean
  optimizeOutput: boolean
  includeMetadata: boolean
}
```

## API Requirements

### Asset Management
- `loadAssets(files: File[]): Promise<SVGAsset[]>`
- `positionAsset(assetId: string, position: Point): void`
- `transformAsset(assetId: string, transform: Transform): void`
- `mergeAssets(assetIds: string[]): SVGAsset`

### Export Functions
- `exportComposite(options: ExportOptions): string`
- `exportAssetLibrary(): AssetLibrary`
- `importAssetLibrary(library: AssetLibrary): void`

## Testing Strategy

### Unit Tests
- Asset management context
- Import validation logic
- Merge algorithms
- Export functionality

### Integration Tests
- Multi-file upload workflows
- Asset positioning and transformation
- Layer management operations
- Export/import round-trips

### E2E Tests (Cypress)
```typescript
describe('Multi-SVG Asset Management', () => {
  it('should import multiple SVG files', () => {
    // Test multi-file import
  })
  
  it('should position assets independently', () => {
    // Test asset positioning
  })
  
  it('should merge assets into single SVG', () => {
    // Test merge and export
  })
})
```

## Performance Considerations

### Memory Management
- Lazy loading of asset content
- Asset cleanup on removal
- Efficient rendering with React.memo

### Rendering Optimization
- Canvas virtualization for large asset counts
- Selective re-rendering of modified assets
- Transform batching for multiple assets

### File Size Management
- Asset compression options
- SVG optimization during import
- Memory usage monitoring

## Accessibility

### Keyboard Navigation
- Tab through asset library
- Keyboard shortcuts for common operations
- Screen reader support for asset metadata

### Visual Indicators
- Clear visual hierarchy for layers
- High contrast selection indicators
- Accessible color schemes

## Migration Strategy

### Backward Compatibility
- Existing single-SVG workflows remain unchanged
- Progressive enhancement approach
- Optional multi-asset features

### Data Migration
- Convert existing projects to asset-based structure
- Maintain export compatibility
- Upgrade path for saved projects

## Success Metrics

### User Experience
- ✅ Import 5+ SVG files in under 10 seconds
- ✅ Position assets with sub-pixel precision
- ✅ Export merged SVG under 2MB for typical use cases
- ✅ Undo/redo operations work across all asset operations

### Performance
- ✅ Support 50+ assets without performance degradation
- ✅ Smooth 60fps interactions during asset manipulation
- ✅ Memory usage stays under 100MB for typical projects

### Quality
- ✅ Exported SVGs maintain original quality
- ✅ All asset transformations are reversible
- ✅ Layer order is preserved accurately

## Dependencies and Infrastructure

### New Dependencies (Potential)
```json
{
  "file-saver": "^2.0.5",           // Enhanced export capabilities
  "react-beautiful-dnd": "^13.1.1", // Layer reordering UI
  "lodash": "^4.17.21"              // Utility functions for asset management
}
```

### Build Tool Enhancements
- Asset bundling optimization
- SVG processing pipeline
- Development asset mocking

## Documentation Requirements

### User Documentation
- Multi-asset workflow tutorials
- Best practices for asset organization
- Performance optimization guides

### Developer Documentation
- Asset management API reference
- Plugin development for custom importers
- Architecture decision records

## Future Enhancements

### Plugin System
- Custom asset importers (AI, Figma, etc.)
- Third-party asset libraries
- Automated asset optimization

### Collaboration Features
- Shared asset libraries
- Real-time collaborative editing
- Version control for assets

### AI Integration
- Intelligent asset positioning
- Automatic layout suggestions
- Content-aware asset scaling

---

## Priority Level: High
This feature significantly expands the editor's capabilities and addresses a core user need for professional digital asset management and visualization creation.

## Estimated Effort: 3-4 weeks
- Phase 1: 1 week (Core infrastructure)
- Phase 2: 1 week (UI components)
- Phase 3: 1 week (Advanced features)
- Phase 4: 0.5-1 week (Polish and optimization)

## Dependencies
- No external service dependencies
- Minimal new package requirements
- Compatible with existing testing infrastructure