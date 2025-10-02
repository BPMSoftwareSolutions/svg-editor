# Feature Request: Undo/Redo System with Enhanced Header Toolbar

## Problem Statement
The SVG editor currently lacks undo/redo functionality, which is essential for a professional editing experience. Users cannot recover from accidental changes (deletions, moves, resizes) and must reload the file to start over. Additionally, the main editing functions are scattered across different UI areas instead of being centralized in an accessible header toolbar.

## Proposed Solution

### 1. Implement Undo/Redo System
Create a robust command pattern-based undo/redo system that tracks all user operations and allows them to be reversed or replayed.

### 2. Enhanced Header Toolbar
Move key editing functions to the main header for better UX and add undo/redo controls.

## Detailed Requirements

### Core Undo/Redo Functionality

#### Operations to Track
- ✅ **Element Deletion** - Remove elements from DOM
- ✅ **Element Movement** - Position changes via drag operations  
- ✅ **Element Resizing** - Size changes via resize handles
- ✅ **Z-Order Changes** - Bring to front, send to back, etc.
- ✅ **Text Editing** - Text content modifications
- 🔄 **Multi-Selection Operations** - Bulk operations on multiple elements

#### Technical Implementation

**Command Pattern Structure:**
```typescript
interface Command {
  execute(): void
  undo(): void
  description: string
}

interface UndoRedoState {
  history: Command[]
  currentIndex: number
  maxHistorySize: number
}
```

**Required Commands:**
- `DeleteElementCommand` - Track deleted elements and their position in DOM
- `MoveElementCommand` - Track before/after positions 
- `ResizeElementCommand` - Track before/after dimensions
- `ZOrderCommand` - Track element order changes
- `TextEditCommand` - Track text content changes
- `CompoundCommand` - For multi-element operations

**Context Integration:**
```typescript
interface UndoRedoContextType {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  executeCommand: (command: Command) => void
  clearHistory: () => void
}
```

### Enhanced Header Toolbar

#### Current State
- Header only contains: Title, File name, Save button, Clear button
- Editing tools are in side panel (`Toolbar.tsx`)
- No undo/redo controls

#### Proposed Header Layout
```
[SVG Editor] [File: example.svg] [Undo] [Redo] [|] [Delete] [Z-Order ▼] [Save] [Clear]
```

#### New Header Toolbar Components
1. **Undo Button** - Ctrl+Z, disabled when no history
2. **Redo Button** - Ctrl+Y/Ctrl+Shift+Z, disabled when at history end  
3. **Delete Button** - Delete key, disabled when no selection
4. **Z-Order Dropdown** - Bring to front, forward, backward, to back
5. **Dividers** - Visual separation between button groups

### Integration Points

#### Modify Existing Components
1. **App.tsx** - Add `UndoRedoProvider` wrapper, expand header toolbar
2. **SelectionOverlay.tsx** - Wrap drag/resize operations in commands
3. **ElementInspector.tsx** - Wrap delete/text-edit operations in commands  
4. **Toolbar.tsx** - Move z-order functionality to header or remove
5. **SVGViewer.tsx** - Update keyboard shortcuts, integrate commands

#### New Components
1. **UndoRedoProvider.tsx** - Context provider for command history
2. **HeaderToolbar.tsx** - New component for enhanced header controls
3. **Commands/** - Directory with all command implementations

## Acceptance Criteria

### Functional Requirements
- [ ] **Undo Operations**: All tracked operations can be undone with Ctrl+Z
- [ ] **Redo Operations**: Undone operations can be redone with Ctrl+Y  
- [ ] **History Limit**: Configurable history size (default: 50 operations)
- [ ] **Visual Feedback**: Undo/Redo buttons show enabled/disabled state
- [ ] **Keyboard Shortcuts**: Standard shortcuts work reliably
- [ ] **Multi-Selection**: Bulk operations create single undo point
- [ ] **Performance**: No noticeable lag with large SVGs (1000+ elements)

### User Experience  
- [ ] **Intuitive Header**: Common editing tools accessible in main header
- [ ] **Clear Grouping**: Related buttons are visually grouped with dividers
- [ ] **Tooltips**: All buttons have helpful tooltips with shortcuts
- [ ] **Accessibility**: Keyboard navigation and screen reader support
- [ ] **Responsive**: Header works on different screen sizes

### Technical Requirements
- [ ] **Type Safety**: Full TypeScript integration for all commands
- [ ] **Memory Management**: History is cleaned up when limit exceeded  
- [ ] **State Consistency**: DOM and React state stay synchronized
- [ ] **Error Handling**: Graceful handling of invalid operations
- [ ] **Testing**: Unit tests for all commands and integration tests for workflows

## Implementation Plan

### Phase 1: Command Infrastructure (3-4 days)
1. Create command pattern interfaces and base classes
2. Implement `UndoRedoContext` with history management
3. Create basic commands (Delete, Move, Resize)
4. Add command execution to existing operations

### Phase 2: Header Toolbar (2-3 days)  
1. Design new header layout and styling
2. Create `HeaderToolbar` component with undo/redo buttons
3. Move/integrate z-order controls from side toolbar
4. Update keyboard shortcut handling

### Phase 3: Advanced Commands (2-3 days)
1. Implement text editing and z-order commands
2. Add compound command support for multi-selection
3. Optimize memory usage and performance
4. Add comprehensive error handling

### Phase 4: Polish & Testing (2-3 days)
1. Add visual feedback and improved UX
2. Comprehensive testing (unit + integration)
3. Documentation and code review
4. Cross-browser compatibility testing

## Risk Mitigation

### Technical Risks
- **Memory Leaks**: Implement proper cleanup in command history
- **Performance**: Use object pooling for frequently created commands
- **State Sync**: Careful coordination between DOM mutations and React state
- **Complex Operations**: Break down complex operations into atomic commands

### UX Risks
- **Confusion**: Clear visual feedback for undo/redo state
- **Muscle Memory**: Use standard keyboard shortcuts (Ctrl+Z/Y)
- **Discoverability**: Prominent placement in header toolbar

## Success Metrics
- [ ] Users can recover from all accidental operations
- [ ] Undo/redo operations complete in <100ms for typical SVGs
- [ ] Zero memory leaks during extended editing sessions
- [ ] 95%+ test coverage for command system
- [ ] Positive user feedback on improved header UX

## Dependencies
- No external dependencies required
- Uses existing React Context and TypeScript infrastructure
- Compatible with current SVG manipulation approach

## Related Issues
- Links to any existing issues about editing functionality
- References to UX feedback about missing undo/redo

---

**Estimated Effort:** 10-13 development days
**Priority:** High (Core editing functionality)
**Labels:** `enhancement`, `core-feature`, `UX-improvement`