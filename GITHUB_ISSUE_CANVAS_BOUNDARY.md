# Canvas Boundary and Selection Overlay Issues

## Summary
When dragging SVG elements near the edges of the canvas, elements disappear as if there's an invisible boundary. Additionally, the selection overlay may not properly track elements that are positioned outside the visible viewport boundaries.

## Issues Identified

### 1. Element Disappearing at Canvas Boundaries
**Severity:** High  
**Component:** `SVGViewer.tsx`, `SVGViewer.css`

#### Description
Elements disappear when dragged to the far left, right, top, or bottom of the canvas. The element appears to hit an invisible boundary and is no longer visible, even though it may still be within the SVG's coordinate space.

#### Root Cause
The `.viewer-container` has `overflow: hidden` set in `SVGViewer.css` (line 64), which clips any content that extends beyond the container's boundaries. When elements are dragged beyond this boundary:
- The element's SVG coordinates may be valid
- The element is still in the DOM
- But visually, it's clipped by the CSS overflow property

```css
.viewer-container {
  flex: 1;
  overflow: hidden;  /* ← This clips content at boundaries */
  position: relative;
  /* ... */
}
```

#### Why This Happens
1. **Fixed Container Dimensions**: The `.viewer-container` has a fixed visible area based on the browser window
2. **Transform-based Positioning**: Elements use SVG transforms which can position them outside the visible container
3. **No Auto-panning**: There's no automatic viewport adjustment when dragging near edges
4. **Clipping Behavior**: CSS `overflow: hidden` strictly clips any content outside the container bounds

### 2. Selection Overlay Tracking Issues
**Severity:** Medium  
**Component:** `SelectionOverlay.tsx`

#### Description
The selection overlay may not properly track elements that move outside the visible viewport, or may calculate incorrect bounding boxes when elements are partially clipped.

#### Root Cause Analysis
The `SelectionOverlay` component calculates bounding boxes using `getBoundingClientRect()`:

```tsx
// SelectionOverlay.tsx, lines 228-270
const updateBbox = useCallback(() => {
  const viewerContainer = document.querySelector('.viewer-container')
  if (!viewerContainer) return

  const containerRect = viewerContainer.getBoundingClientRect()

  // For single selection
  if (selectedElements.length === 1) {
    const rect = selectedElements[0].element.getBoundingClientRect()
    setBbox({
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    })
  }
  // ...
}, [selectedElements, getCombinedBoundingBox])
```

**Problems:**
1. `getBoundingClientRect()` returns screen coordinates, not SVG coordinates
2. When elements are clipped by `overflow: hidden`, their bounding rect may extend outside the container
3. The overlay position is calculated relative to `.viewer-container`, but doesn't account for clipping
4. No validation to ensure the overlay stays within visible bounds

### 3. Viewport/ViewBox Confusion
**Severity:** Medium  
**Component:** Architecture

#### Description
The current implementation uses a viewport transform on the `.svg-content` container but doesn't properly manage the relationship between:
- **Browser Viewport**: The visible area in the browser window
- **SVG ViewBox**: The SVG's internal coordinate system
- **Canvas Boundaries**: The area where elements can be placed

```tsx
// SVGViewer.tsx, lines 313-321
<div
  ref={svgContentRef}
  className="svg-content"
  style={{
    transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
  }}
  dangerouslySetInnerHTML={{ __html: contentToRender }}
/>
```

The viewport transform is applied to the entire `.svg-content` div, but:
- No automatic panning when dragging near edges
- No "infinite canvas" behavior
- No visual feedback about canvas boundaries

## Expected Behavior

### Option A: Infinite Canvas (Recommended)
- Elements should be draggable to any position
- Viewport should auto-pan when dragging near canvas edges
- Selection overlay should always track selected elements
- Optional: Show viewport bounds indicator

### Option B: Bounded Canvas with Constraints
- Define explicit canvas boundaries
- Prevent elements from being dragged outside boundaries
- Show visual indicator of canvas limits
- Constrain selection overlay to canvas area

## Proposed Solutions

### Solution 1: Auto-panning Near Edges (Recommended)
Implement edge detection during drag operations to automatically pan the viewport:

```tsx
// In SelectionOverlay.tsx - handleMouseMove
const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!isDragging || selectedElements.length === 0) return

  const viewerContainer = document.querySelector('.viewer-container')
  if (!viewerContainer) return

  const containerRect = viewerContainer.getBoundingClientRect()
  const edgeThreshold = 50 // pixels from edge to trigger panning
  const panSpeed = 5 // pixels per frame

  // Check if mouse is near edges
  const mouseX = e.clientX - containerRect.left
  const mouseY = e.clientY - containerRect.top

  let panX = 0
  let panY = 0

  if (mouseX < edgeThreshold) panX = panSpeed
  if (mouseX > containerRect.width - edgeThreshold) panX = -panSpeed
  if (mouseY < edgeThreshold) panY = panSpeed
  if (mouseY > containerRect.height - edgeThreshold) panY = -panSpeed

  // Apply panning to viewport
  if (panX !== 0 || panY !== 0) {
    // TODO: Update viewport state in SVGViewer
  }

  // ... existing drag logic
}, [isDragging, selectedElements])
```

### Solution 2: Boundary Constraints
Add explicit boundary checking to prevent elements from being dragged outside canvas:

```tsx
// In SelectionOverlay.tsx or utils/transform.ts
function constrainToBounds(
  element: SVGElement,
  deltaX: number,
  deltaY: number,
  canvasBounds: DOMRect
): { deltaX: number; deltaY: number } {
  const rect = element.getBoundingClientRect()
  const newLeft = rect.left + deltaX
  const newTop = rect.top + deltaY
  const newRight = newLeft + rect.width
  const newBottom = newTop + rect.height

  // Constrain to boundaries
  if (newLeft < canvasBounds.left) {
    deltaX = canvasBounds.left - rect.left
  }
  if (newRight > canvasBounds.right) {
    deltaX = canvasBounds.right - (rect.left + rect.width)
  }
  if (newTop < canvasBounds.top) {
    deltaY = canvasBounds.top - rect.top
  }
  if (newBottom > canvasBounds.bottom) {
    deltaY = canvasBounds.bottom - (rect.top + rect.height)
  }

  return { deltaX, deltaY }
}
```

### Solution 3: Selection Overlay Improvements
Enhance the overlay to handle clipped elements gracefully:

```tsx
// In SelectionOverlay.tsx
const updateBbox = useCallback(() => {
  // ... existing code

  const viewerContainer = document.querySelector('.viewer-container')
  if (!viewerContainer) return

  const containerRect = viewerContainer.getBoundingClientRect()
  const rect = selectedElements[0].element.getBoundingClientRect()

  // Calculate overlay position
  let overlayX = rect.left - containerRect.left
  let overlayY = rect.top - containerRect.top

  // Check if element is clipped and adjust overlay visibility
  const isClipped = 
    overlayX < 0 || 
    overlayY < 0 || 
    overlayX + rect.width > containerRect.width ||
    overlayY + rect.height > containerRect.height

  // Option 1: Clamp overlay to visible area
  overlayX = Math.max(0, Math.min(overlayX, containerRect.width))
  overlayY = Math.max(0, Math.min(overlayY, containerRect.height))

  // Option 2: Add visual indicator for clipped elements
  if (isClipped) {
    // Show warning indicator or adjust overlay style
  }

  setBbox({ x: overlayX, y: overlayY, width: rect.width, height: rect.height })
}, [selectedElements])
```

### Solution 4: Viewport Context Sharing
Create a shared viewport context to coordinate between SVGViewer and SelectionOverlay:

```tsx
// New file: src/contexts/ViewportContext.tsx
interface ViewportContextType {
  viewport: ViewportState
  updateViewport: (updates: Partial<ViewportState>) => void
  panBy: (deltaX: number, deltaY: number) => void
  containerRef: RefObject<HTMLDivElement>
}

export const ViewportProvider = ({ children }: { children: ReactNode }) => {
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const panBy = (deltaX: number, deltaY: number) => {
    setViewport(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }))
  }

  // ... implementation
}
```

## Steps to Reproduce

1. Open the SVG editor
2. Load any SVG file with elements
3. Select an element
4. Drag the element towards the far right edge of the canvas
5. Continue dragging past the visible canvas boundary

**Expected:** Element remains visible and viewport auto-pans, OR element is constrained to canvas bounds  
**Actual:** Element disappears (clipped by CSS overflow)

## Technical Context

### Current Architecture
- **SVGViewer**: Manages viewport state (scale, translate)
- **SelectionOverlay**: Positioned absolutely, calculates bbox from `getBoundingClientRect()`
- **svg-content**: Transformed container with SVG content
- **viewer-container**: Clips content with `overflow: hidden`

### Key Files
- `src/components/SVGViewer.tsx` - Viewport management
- `src/components/SelectionOverlay.tsx` - Selection overlay rendering and positioning
- `src/styles/SVGViewer.css` - Container and overflow styles
- `src/utils/transform.ts` - Transform utilities

## Impact

**User Experience:**
- 🔴 **Critical**: Elements can be lost by accidentally dragging them off-screen
- 🟡 **Moderate**: Selection overlay can appear incorrectly positioned
- 🟡 **Moderate**: No visual feedback about canvas boundaries

**Workaround:**
- Use arrow keys to move elements instead of dragging
- Zoom out before dragging to see more canvas area
- Use Undo (Ctrl+Z) if element is dragged off-screen

## Acceptance Criteria

### Must Have
- [ ] Elements remain visible when dragged near canvas edges (via auto-pan OR constraints)
- [ ] Selection overlay accurately tracks element position at all times
- [ ] Clear visual feedback about canvas boundaries or viewport state

### Should Have
- [ ] Auto-panning activates when dragging near canvas edges
- [ ] Smooth viewport transitions during auto-pan
- [ ] Selection overlay handles partially clipped elements gracefully

### Nice to Have
- [ ] Visual indicator showing the full canvas bounds
- [ ] Mini-map showing element positions relative to canvas
- [ ] Configurable canvas boundaries (infinite vs. bounded mode)

## Related Issues
- None currently

## References
- `RESIZE_REFACTOR_SUMMARY.md` - Similar coordinate system issues
- `UNDO_BUG_FIX.md` - Transform handling patterns

---

**Priority:** High  
**Labels:** bug, enhancement, ux  
**Milestone:** v1.1
