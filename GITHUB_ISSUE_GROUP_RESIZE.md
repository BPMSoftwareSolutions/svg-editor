# GitHub Issue: Enable Resizing of SVG Group Elements with Proportional Child Scaling

## Issue Title
**Enable resizing of imported SVG asset groups (`<g>` elements) with proportional child scaling**

## Labels
- `enhancement`
- `feature`
- `multi-svg-support`
- `resize`
- `group-elements`

## Priority
**Medium** - Enhances user experience for multi-asset workflows

---

## Problem Statement

Currently, when users import multiple SVG files as assets, each asset is wrapped in a `<g>` (group) element with transform attributes for positioning, scaling, and rotation. While users can select these group elements and see resize handles, the resizing functionality may not work correctly due to transform composition issues when groups already have existing transforms.

## User Story

**As a user**, when I import multiple SVG files onto the canvas and select an individual SVG asset group (`<g>` element), **I want to** be able to resize it using the resize handles **so that** all child elements scale proportionally while maintaining their relative positions and the group's existing transforms.

## Current Behavior

✅ **Working:**
- Multiple SVG files can be imported as assets
- Each asset is wrapped in a `<g>` element with transforms: `transform="translate(x, y) scale(s) rotate(r)"`
- Groups can be selected and show selection overlay with resize handles
- The `ResizeElementCommand` class has a `default` case that handles groups via transform scaling

❓ **Needs Testing:**
- Whether resizing actually works properly with existing group transforms
- Whether transform composition conflicts occur
- Whether the asset system stays in sync with manual resizing

## Expected Behavior

1. **Group Selection**: User can click on any `<g>` element (imported SVG asset) to select it
2. **Resize Handles**: Selection overlay displays corner resize handles around the group's bounding box
3. **Proportional Scaling**: When dragging resize handles:
   - All child elements within the group scale proportionally
   - Relative positions between child elements are maintained
   - The scaling works correctly even if the group has existing transforms
4. **Transform Composition**: New scale transforms are properly composed with existing transforms
5. **Asset Sync**: The asset system's scale property is updated to reflect manual resizing
6. **Undo/Redo**: Resize operations are properly recorded in command history

## Technical Analysis

### Current Implementation
- **Group Creation**: `SVGViewer.generateCompositeContent()` wraps each asset in a `<g>` with:
  ```html
  <g data-asset-id="${asset.id}" 
     data-asset-name="${asset.name}"
     transform="translate(${x}, ${y}) scale(${scale}) rotate(${rotation})"
     opacity="${opacity}">
    <!-- SVG content -->
  </g>
  ```
- **Resize Command**: `ResizeElementCommand` handles groups in the `default` case by appending scale transforms
- **Selection**: Groups are selectable like any SVG element

### Potential Issues

1. **Transform Composition Conflict**:
   ```html
   <!-- Before resize -->
   <g transform="translate(100, 50) scale(1.5) rotate(10)">
   
   <!-- After resize - potential conflict -->
   <g transform="translate(100, 50) scale(1.5) rotate(10) scale(1.2, 1.2)">
   ```

2. **Asset System Sync**: Manual resizing might not update the asset's `scale` property

3. **Coordinate System Issues**: Resize handles might not work correctly with pre-transformed groups

## Acceptance Criteria

### Must Have
- [ ] User can select any imported SVG group (`<g>` element)
- [ ] Resize handles appear correctly around the group's bounding box
- [ ] Dragging resize handles scales all child elements proportionally
- [ ] Existing group transforms (position, scale, rotation) are preserved and composed correctly
- [ ] Resize operations are undoable/redoable
- [ ] No visual glitches or coordinate system issues during resize

### Should Have
- [ ] Asset system's `scale` property is updated when manually resizing groups
- [ ] Resize maintains aspect ratio when holding Shift key
- [ ] Smooth visual feedback during resize operation
- [ ] Works correctly with nested group structures

### Could Have
- [ ] Resize from center when holding Alt key
- [ ] Visual preview of final size during resize
- [ ] Keyboard shortcuts for precise scaling (e.g., Ctrl+Shift+Arrow keys)

## Implementation Strategy

### Phase 1: Investigation & Testing
1. **Manual Testing**: Test current resize behavior on imported SVG groups
2. **Identify Issues**: Document specific problems with transform composition
3. **Asset Sync Analysis**: Determine if asset properties need updating

### Phase 2: Core Implementation
1. **Transform Parser Enhancement**: Improve transform string parsing and composition
2. **ResizeElementCommand Update**: Enhance to properly handle existing group transforms
3. **Asset System Integration**: Sync manual resizing with asset properties

### Phase 3: Polish & Testing
1. **Edge Case Handling**: Test with complex nested structures
2. **Performance Optimization**: Ensure smooth resize operations
3. **Unit & E2E Tests**: Add comprehensive test coverage

## Files Likely to be Modified

- `src/commands/ResizeElementCommand.ts` - Enhanced transform composition
- `src/utils/transform.ts` - Improved transform parsing/serialization
- `src/contexts/AssetContext.tsx` - Asset sync integration
- `src/components/SelectionOverlay.tsx` - Group-specific resize handling
- `src/hooks/useResize.ts` - Enhanced for group elements

## Test Cases

### Basic Functionality
```javascript
describe('Group Element Resizing', () => {
  it('should resize group with existing transforms correctly')
  it('should maintain child element proportions')
  it('should preserve existing position and rotation')
  it('should update asset scale property')
})
```

### Edge Cases
```javascript
describe('Group Resize Edge Cases', () => {
  it('should handle nested groups')
  it('should work with groups containing mixed element types')
  it('should handle very small/large scale factors')
  it('should work with groups that have no initial transform')
})
```

## Dependencies

- No external dependencies required
- Builds on existing multi-SVG asset system
- Uses current command/undo-redo infrastructure

## Estimated Effort

**2-3 days** for a mid-level developer:
- Day 1: Investigation, testing, and issue identification
- Day 2: Core implementation and transform composition fixes
- Day 3: Asset sync integration, testing, and polish

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests added/updated with >90% coverage
- [ ] E2E tests added for key user workflows
- [ ] Code reviewed and approved
- [ ] Documentation updated (if needed)
- [ ] Manual testing completed on multiple browsers
- [ ] No regressions in existing functionality

---

## Related Issues

- #25 - Multi-SVG Support Phase 1 (parent feature)
- Future: Individual element multi-selection resize (different from this group resize)

## Screenshots/Mockups

*Add screenshots showing:*
1. Multiple imported SVGs as groups
2. Group selection with resize handles
3. Before/after resize demonstration
4. Expected transform composition behavior