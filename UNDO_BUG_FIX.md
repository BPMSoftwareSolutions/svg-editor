# Undo Bug Fix - Move Operation

## Problem

When moving an element by dragging and then clicking undo, the element only moved back partially instead of returning to its exact original position.

## Root Cause

The issue was caused by **incorrect capture of original transform state**:

1. During drag (`handleMouseMove`), the element was moved in real-time using `applyTranslation()`
2. When drag ended (`handleMouseUp`), a `MoveElementCommand` was created
3. The `MoveElementCommand` constructor read the element's **current** transform (which already included the move)
4. It then added the delta to this already-moved position to calculate the "new" transform
5. Result: The "original" transform stored in the command was actually the moved position
6. When undo was called, it restored to the moved position instead of the actual original position

**Additional issue:** Initially, we also had the problem of calling `executeCommand()` which would apply the move twice, but this was partially addressed by using `addToHistory()`. However, the root cause was the incorrect capture of the original transform.

## Solution

### 1. Capture Original Transforms Before Drag

Added a ref to store the original transforms before the drag starts:

```typescript
const dragStartTransformsRef = useRef<string[]>([])

const handleMouseDown = (e: React.MouseEvent) => {
  // ... existing code

  // Capture original transforms before drag starts
  dragStartTransformsRef.current = selectedElements.map(sel =>
    sel.element.getAttribute('transform') || ''
  )

  console.log('[SelectionOverlay] Starting drag, captured original transforms:', dragStartTransformsRef.current)
  // ...
}
```

### 2. Modified MoveElementCommand to Accept Original Transforms

Updated the constructor to accept an optional `originalTransforms` parameter:

```typescript
constructor(
  elements: SVGElement | SVGElement[],
  deltaX: number,
  deltaY: number,
  scale: number = 1,
  originalTransforms?: string[]  // NEW PARAMETER
) {
  const elementArray = Array.isArray(elements) ? elements : [elements]

  this.positions = elementArray.map((element, index) => {
    // Use provided original transform if available, otherwise read from element
    const originalTransform = originalTransforms
      ? (originalTransforms[index] || '')
      : (element.getAttribute('transform') || '')

    // ... rest of the code
  })
}
```

### 3. Pass Original Transforms When Creating Command

Updated `handleMouseUp` to pass the captured original transforms:

```typescript
const handleMouseUp = () => {
  // ... existing code

  const command = new MoveElementCommand(
    elements,
    totalDelta.x,
    totalDelta.y,
    scale,
    dragStartTransformsRef.current  // Pass captured original transforms
  )

  addToHistory(command)

  // Clean up
  dragStartTransformsRef.current = []
}
```

### 4. Added `addToHistory()` Method

Created a new method in `UndoRedoContext` that adds a command to history **without executing it**:

```typescript
/**
 * Add a command to history without executing it (for operations already performed)
 */
const addToHistory = useCallback((command: Command) => {
  console.log('[UndoRedo] Adding command to history (without executing):', command.description)
  
  setState(prevState => {
    // Remove any commands after current index
    const newHistory = prevState.history.slice(0, prevState.currentIndex + 1)
    
    // Add new command
    newHistory.push(command)

    // Trim history if it exceeds max size
    const trimmedHistory = newHistory.length > prevState.maxHistorySize
      ? newHistory.slice(newHistory.length - prevState.maxHistorySize)
      : newHistory

    return {
      ...prevState,
      history: trimmedHistory,
      currentIndex: trimmedHistory.length - 1,
    }
  })
}, [])
```

### 5. Updated Type Definition

Added `addToHistory` to the `UndoRedoContextType` interface:

```typescript
export interface UndoRedoContextType {
  // ... existing properties
  executeCommand: (command: Command) => void
  addToHistory: (command: Command) => void  // NEW
  // ... other properties
}
```

### 6. Updated SelectionOverlay

Changed `handleMouseUp` to use `addToHistory()` instead of `executeCommand()` and pass original transforms:

```typescript
const handleMouseUp = () => {
  if (isDragging && selectedElements.length > 0) {
    // ... get scale and delta
    
    if (totalDelta.x !== 0 || totalDelta.y !== 0) {
      const elements = selectedElements.map(sel => sel.element)
      const command = new MoveElementCommand(elements, totalDelta.x, totalDelta.y, scale)
      
      // IMPORTANT: Use addToHistory instead of executeCommand because the move 
      // has already been applied during drag
      addToHistory(command)  // Changed from executeCommand(command)
    }
  }
  // ...
}
```

### 7. Added Console Logging

Added comprehensive console logging throughout the undo/redo system for debugging:

- `UndoRedoContext`: Logs when commands are executed, added to history, undone, or redone
- `MoveElementCommand`: Logs transform values before and after execute/undo operations
- `SelectionOverlay`: Logs when creating move commands with delta and scale values

## When to Use Each Method

### Use `executeCommand(command)`
- When the operation **has NOT been performed yet**
- Examples:
  - Delete button click
  - Z-order change
  - Text edit
  - Arrow key movement (keyboard shortcuts)

### Use `addToHistory(command)`
- When the operation **has ALREADY been performed**
- Examples:
  - Drag operations (move already applied during drag)
  - Resize operations (resize already applied during resize)
  - Any real-time interactive operation

## Testing

### Unit Tests
All existing unit tests continue to pass (40 tests).

### E2E Tests
Created `cypress/e2e/move-undo-bug.cy.ts` with specific tests for:
- ✅ Full restoration of element position after drag and undo
- ✅ Multiple move operations with undo/redo
- ✅ Keyboard arrow key moves with undo
- ✅ Ctrl+Z keyboard shortcut after drag

**All 4 E2E tests passing!**

### Manual Testing Steps
1. Load an SVG file
2. Select an element
3. Drag it to a new position
4. Open browser console (F12) to see debug logs
5. Click Undo or press Ctrl+Z
6. Verify element returns to exact original position

## Files Changed

- `src/contexts/UndoRedoContext.tsx` - Added `addToHistory()` method and console logging
- `src/types/command.ts` - Added `addToHistory` to interface
- `src/components/SelectionOverlay.tsx` - Changed to use `addToHistory()` for drag operations
- `src/commands/MoveElementCommand.ts` - Added console logging
- `src/commands/ResizeElementCommand.ts` - Fixed lint errors (added braces to case blocks)
- `cypress/e2e/move-undo-bug.cy.ts` - New E2E test file

## Future Considerations

### Resize Operations
The same issue likely exists for resize operations. The `SelectionOverlay` component should be updated to use `addToHistory()` for resize commands as well.

### Console Logging
The console logging added for debugging should be:
- Kept during development for troubleshooting
- Optionally removed or disabled in production builds
- Or converted to use a proper logging library with log levels

### Other Interactive Operations
Any future interactive operations that apply changes in real-time should use `addToHistory()` instead of `executeCommand()`.

