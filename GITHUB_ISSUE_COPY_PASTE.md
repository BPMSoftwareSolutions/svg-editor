# Copy/Paste Functionality for SVG Elements

## Overview
Implement copy (Ctrl+C) and paste (Ctrl+V) functionality to allow users to duplicate selected SVG elements within the editor. This feature will enable users to quickly create copies of elements, improving productivity and workflow efficiency.

## User Story
**As a user**, I want to copy selected SVG elements with Ctrl+C and paste duplicates with Ctrl+V, so that I can quickly duplicate elements without manually recreating them.

## Current State Analysis
The application already has:
- ✅ Comprehensive selection system (`SelectionContext`) with multi-selection support
- ✅ Established command pattern with undo/redo support
- ✅ Keyboard shortcut infrastructure in multiple components
- ✅ Element manipulation capabilities through existing commands

## Technical Requirements

### Core Components to Implement

#### 1. CopyElementCommand
```typescript
export class CopyElementCommand implements Command {
  private elements: SVGElement[]
  private copiedData: string[] // Serialized SVG strings
  public description: string
  
  // Store serialized element data for clipboard operations
}
```

#### 2. PasteElementCommand  
```typescript
export class PasteElementCommand implements Command {
  private pastedElements: SVGElement[]
  private targetParent: SVGElement
  private copiedData: string[]
  public description: string
  
  // Create new elements from copied data with unique IDs
}
```

#### 3. Clipboard Service/Context
```typescript
interface ClipboardContextType {
  copiedElements: string[] // Serialized SVG element data
  copyElements: (elements: SVGElement[]) => void
  pasteElements: () => void
  hasCopiedElements: boolean
}
```

### Implementation Details

#### Keyboard Shortcuts
- Add to existing keyboard handler in `SVGViewer.tsx`:
  - `Ctrl+C` / `Cmd+C`: Copy selected elements
  - `Ctrl+V` / `Cmd+V`: Paste copied elements

#### Element Duplication Strategy
1. **Serialize elements**: Convert SVG elements to string representation
2. **Generate unique IDs**: Ensure pasted elements have unique identifiers
3. **Position offset**: Place pasted elements slightly offset from originals (e.g., +10px x/y)
4. **Preserve attributes**: Maintain all styling, transforms, and properties
5. **Handle nested elements**: Properly duplicate group elements and their children

#### Integration Points
- **SelectionContext**: Use `selectedElements` for copy operations
- **UndoRedoContext**: Execute paste commands through existing `executeCommand()` method
- **SVGViewer**: Add keyboard event handlers for Ctrl+C/Ctrl+V

### Acceptance Criteria

#### Functional Requirements
- [ ] **Copy (Ctrl+C)**: 
  - Copies currently selected element(s) to internal clipboard
  - Works with single and multi-selection
  - Provides visual/audio feedback (optional)
  - No action if no elements are selected

- [ ] **Paste (Ctrl+V)**:
  - Pastes copied elements with slight offset positioning
  - Automatically selects newly pasted elements
  - Generates unique IDs for all pasted elements
  - Works with both single and multiple copied elements
  - No action if clipboard is empty

- [ ] **Element Integrity**:
  - Pasted elements maintain all original attributes (fill, stroke, transforms, etc.)
  - Nested elements (groups) are duplicated correctly
  - Text elements preserve content and styling

#### Technical Requirements
- [ ] **Undo/Redo Support**: Both copy and paste operations are undoable
- [ ] **Multi-Selection**: Works seamlessly with existing multi-selection system
- [ ] **Performance**: Handles copying/pasting of complex elements efficiently
- [ ] **Memory Management**: Clipboard data is properly managed (cleared on app exit)

#### Edge Cases
- [ ] **No Selection**: Ctrl+C with no selection does nothing
- [ ] **Empty Clipboard**: Ctrl+V with empty clipboard does nothing  
- [ ] **Complex Elements**: Groups, paths, and text elements are handled correctly
- [ ] **ID Conflicts**: Duplicate IDs are automatically resolved
- [ ] **Large Selections**: Performance remains acceptable with many elements

### Implementation Plan

#### Phase 1: Core Infrastructure
1. Create `ClipboardContext` for managing copied element data
2. Implement element serialization/deserialization utilities
3. Add unique ID generation utility

#### Phase 2: Command Implementation  
1. Implement `CopyElementCommand` (store element data)
2. Implement `PasteElementCommand` (create new elements)
3. Add commands to command exports

#### Phase 3: UI Integration
1. Add keyboard shortcuts to `SVGViewer.tsx`
2. Integrate with existing selection and undo/redo systems
3. Handle edge cases and error states

#### Phase 4: Testing & Polish
1. Add unit tests for copy/paste commands
2. Add E2E tests for keyboard shortcuts and workflows
3. Test with various element types and complex selections

### Related Files to Modify
- `src/contexts/` - New `ClipboardContext.tsx`
- `src/commands/` - New `CopyElementCommand.ts` and `PasteElementCommand.ts`
- `src/components/SVGViewer.tsx` - Add keyboard shortcuts
- `src/utils/` - Element serialization utilities
- `src/types/` - Clipboard-related type definitions

### Testing Strategy
```typescript
// Example test cases
describe('Copy/Paste Functionality', () => {
  it('should copy single selected element')
  it('should copy multiple selected elements') 
  it('should paste elements with unique IDs')
  it('should position pasted elements with offset')
  it('should support undo/redo for paste operations')
  it('should handle keyboard shortcuts correctly')
  it('should preserve element attributes during copy/paste')
})
```

### Definition of Done
- [ ] Copy/paste functionality works for single and multiple elements
- [ ] Keyboard shortcuts (Ctrl+C, Ctrl+V) are implemented and functional
- [ ] All pasted elements have unique IDs and proper positioning
- [ ] Undo/redo support is fully functional
- [ ] Unit tests achieve >90% code coverage for new components
- [ ] E2E tests cover primary copy/paste workflows
- [ ] Performance testing shows no significant regression
- [ ] Code review completed and approved
- [ ] Documentation updated (README.md keyboard shortcuts section)

## Priority
**Medium-High** - This is a fundamental editing feature that users expect in any graphics editor.

## Estimated Effort
**3-5 days** for experienced developer familiar with the codebase.

## Dependencies
- No external dependencies required
- Builds on existing selection and command infrastructure

## Nice-to-Have Enhancements (Future)
- Cross-browser clipboard API integration for copy/paste between applications
- Visual paste preview showing where elements will be placed
- Smart positioning that avoids overlapping with existing elements
- Keyboard shortcuts displayed in UI tooltips/help