# Resize Logic Refactor Summary

## Problem

The resize implementation in `SelectionOverlay.tsx` had become overly complicated, causing issues where:
1. Elements would "jump" during resizing
2. Elements weren't resized to the exact size of the resize box
3. The position correction logic was unstable, especially during mouse move events

## Root Cause

The original implementation had several issues:

### 1. **Unnecessary Complexity**
The code was trying to preserve the top-left corner position by:
- Calculating the original position in multiple coordinate systems
- Applying scale transform
- Measuring where the element ended up
- Calculating an offset
- Adjusting the translate to compensate

This was done on **every mouse move event**, which created instability.

### 2. **Wrong Target Position**
The code was ignoring the `left` and `top` parameters provided by the `useResize` hook, which tell us where the resize box should be positioned. Instead, it was trying to keep the original start position fixed, even when dragging corner handles that should move the position.

### 3. **Position Correction During Mouse Move**
The position correction logic was being executed during `onResize` (mouse move), which meant the transform was being adjusted continuously. This caused jittering and jumping.

## Solution

The fix simplifies the resize logic significantly:

### Key Changes in `SelectionOverlay.tsx`

1. **Use the Start Position as Target**
   Instead of using the changing `left/top` from `useResize`, we now preserve the **original bounding box position** captured at resize start. This is correct because:
   - For simple elements (rect, circle), we change their width/height attributes
   - For groups/paths, we scale them, and scaling from origin causes position shift
   - We compensate by keeping the top-left of the bounding box fixed

2. **Cleaner Two-Step Process**
   ```typescript
   // Step 1: Apply the scale
   transformData.scaleX *= scaleXRatio
   transformData.scaleY *= scaleYRatio
   element.setAttribute('transform', serializeTransform(transformData))

   // Step 2: Measure and correct position ONCE
   const scaledBBox = element.getBoundingClientRect()
   const offsetX = targetLeft - scaledLeft
   transformData.translateX += offsetX / scale
   element.setAttribute('transform', serializeTransform(transformData))
   ```

3. **Key Insight: Start from Original Transform**
   On each `onResize` call, we start from the **original transform** captured at resize start (`resizeStartTransformRef.current`), not from the current transform. This prevents cumulative errors.

### What Was Removed

- Complex multi-step position calculations
- Unused `startBBox` variable in some paths
- Confusing coordinate system conversions
- The attempt to use `left/top` from resize handles for groups (they're meant for repositioning simple elements)

## How It Works Now

### For Simple Elements (rect, circle, ellipse, image)
- Just update width/height attributes directly
- No transform manipulation needed
- Works perfectly

### For Groups and Complex Elements
1. **On resize start**: Capture original dimensions, transform, and bounding box
2. **During resize** (`onResize` callback):
   - Calculate scale ratio: `newSize / originalSize`
   - Parse the original transform
   - Multiply scale by ratio
   - Apply transform
   - Measure where element ended up
   - Calculate offset from target position (original top-left)
   - Adjust translate to compensate
   - Apply corrected transform
3. **On resize end**: Create command for undo/redo

### Why This Works

- **Scaling from origin**: SVG applies transforms from (0,0), so when we scale, the element's visual position changes
- **Position compensation**: We measure the shift and adjust `translateX/translateY` to counteract it
- **Consistent reference**: Always start from the original transform captured at resize start
- **Single correction**: Only correct position once per mouse move, not multiple times

## Test Results

All tests now pass:
- ✅ Unit tests for `ResizeElementCommand`
- ✅ `group-resize-simple.cy.ts` - Basic group resize
- ✅ `group-resize.cy.ts` - All 7 tests including:
  - Basic group resize with no existing transform
  - Maintaining child element proportions
  - Composing scale with existing transforms
  - **Preserving position and rotation during resize** (was failing before)
  - Undo/redo operations
  - Multiple consecutive resize operations

## Benefits

1. **Simpler code**: Easier to understand and maintain
2. **No jumping**: Elements stay stable during resize
3. **Accurate sizing**: Elements match the resize box dimensions
4. **Works with rotation**: Correctly handles groups with rotate transforms
5. **Better performance**: Less DOM manipulation per frame

## Related Files

- `src/components/SelectionOverlay.tsx` - Main changes
- `src/hooks/useResize.ts` - No changes needed (was already correct)
- `src/commands/ResizeElementCommand.ts` - No changes needed
- `cypress/e2e/group-resize*.cy.ts` - All tests passing
