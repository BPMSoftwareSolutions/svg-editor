# Topology Slides Icon Management

This directory contains scripts and tooling for managing animated section icons across all Team Topology slide SVG files.

## Overview

The `add-topology-icons.ts` script automatically adds consistent animated section icons to all topology slides (files 02-07). This ensures:

1. **Consistency**: All slides have icons in identical positions
2. **Maintainability**: Single source of truth for icon definitions
3. **Testability**: Comprehensive unit tests validate the transformations
4. **Automation**: No manual SVG editing required

## Icon Positions

All icons are positioned consistently across slides, aligned to the **right edge** of their respective section boxes in a two-column layout:

### Positioning Logic
- Content grid starts at: `translate(40, 160)`
- Left column sections: `x=0, width=340` (right edge at x=340)
- Right column sections: `x=380, width=340` (right edge at x=720)
- Icons positioned at right edge minus width adjustment

### Left Column (x: 318.44)
- **Nature** (y: 176.58): Layered cake representing vertical slice
- **Structure** (y: 296.58): 6 people in team formation
- **Focus** (y: 416.58): Rotating gear for orchestration

### Right Column (x: 698.44)
- **Topology Fit** (y: 176.58): Flowing stream arrows
- **Key Characteristics** (y: 316.58): Shield with checkmarks
- **Collaboration** (y: 536.58): Connected network nodes

### Scale
- x: 0.28173085392104
- y: 0.3143794929418287

## Usage

### Add/Update Icons on All Slides

```bash
npm run topology:add-icons
```

This will:
1. Add icon gradient definitions to the `<defs>` section (if not present)
2. Add all 6 animated icon assets before the closing `</svg>` tag (if not present)
3. Skip files that already have icons to avoid duplication

### Remove Icons from All Slides

```bash
npm run topology:remove-icons
```

This will:
1. Remove all animated icon assets from the SVG files
2. Remove icon gradient definitions from the `<defs>` section
3. Clean up for re-applying icons with updated positions

### Re-apply Icons with Updated Positions

```bash
npm run topology:reapply-icons
```

This convenience command:
1. Removes existing icons and gradients
2. Re-applies them with current positions from the script
3. Useful when icon positions are updated in the script

### Run Tests

```bash
npm run topology:test
```

This runs comprehensive unit tests that validate:
- Correct icon positions (aligned to section right edges)
- Proper gradient definitions
- Animation elements
- No duplication
- SVG structure integrity

## Icon Definitions

### 1. Nature Icon (Blue)
- **Visual**: Layered cake with vertical slice indicator
- **Animation**: Pulsing layers, animated dashed line
- **Represents**: Vertical slice architecture

### 2. Structure Icon (Green)
- **Visual**: 6 people arranged in a circle
- **Animation**: Pulsing heads (staggered), rotating connection circle
- **Represents**: Team structure of 2-6 people

### 3. Focus Icon (Orange)
- **Visual**: Gear/cog with 6 teeth
- **Animation**: 360° rotation, pulsing center, energy pulses
- **Represents**: Orchestration and coordination focus

### 4. Topology Fit Icon (Purple)
- **Visual**: Three parallel stream arrows
- **Animation**: Flowing particles along arrows
- **Represents**: Stream-aligned topology fit

### 5. Characteristics Icon (Pink)
- **Visual**: Shield with three checkmarks
- **Animation**: Drawing checkmarks sequentially, sparkling stars
- **Represents**: End-to-end ownership and quality

### 6. Collaboration Icon (Cyan)
- **Visual**: Network of connected nodes
- **Animation**: Pulse radiating from central hub
- **Represents**: X-as-a-Service collaboration model

## Architecture

### Script Structure

```
scripts/
├── add-topology-icons.ts       # Main script
├── add-topology-icons.test.ts  # Unit tests
└── README.md                   # This file
```

### Key Functions

- `addIconGradients(svgContent: string): string`
  - Adds gradient definitions to SVG defs
  - Idempotent: won't duplicate if already present

- `addAnimatedIcons(svgContent: string): string`
  - Adds all 6 animated icon assets
  - Idempotent: won't duplicate if already present

- `processTopologyFile(filePath: string): ProcessResult`
  - Processes a single SVG file
  - Returns success/failure status

- `main()`
  - Orchestrates processing of all topology files 02-07

### Test Coverage

The test suite includes:

1. **Position Tests**: Verify correct x,y coordinates
2. **Scale Tests**: Verify consistent scaling factors
3. **Gradient Tests**: Ensure all 6 gradients are added
4. **Icon Tests**: Validate presence of all 6 icons
5. **Animation Tests**: Check for animation elements
6. **Content Tests**: Verify specific icon structures (e.g., 6 people, shield shape)
7. **Integration Tests**: Full SVG transformation validation
8. **Idempotency Tests**: Ensure no duplication on re-runs

## Adding New Icons

To add a new icon to all slides:

1. Define the icon SVG content as a constant (e.g., `NEW_ICON`)
2. Add position to `ICON_POSITIONS` object
3. Add the icon to the `ALL_ICONS` array
4. Update tests to validate the new icon
5. Run `npm run topology:add-icons`

## Modifying Icon Positions

To change icon positions globally:

1. Update the `ICON_POSITIONS` constant
2. Update tests if needed
3. **Manually remove** existing icons from slide 01 (it has custom positioning)
4. Run `npm run topology:add-icons` to regenerate all icons with new positions

## Manual Overrides

Slide 01 (`topology-01-plugin-team.svg`) is manually maintained and serves as the reference implementation. Changes to slide 01 should be:

1. Made manually in the SVG file
2. Extracted to update the script if needed
3. Applied to other slides via the script

## Troubleshooting

### Icons Not Appearing

1. Check that gradients are defined in `<defs>`
2. Verify icon transform positions don't overlap with content
3. Ensure `opacity="1"` is set on icon groups

### Duplicate Icons

The script is idempotent and checks for existing icons. If you see duplicates:

1. The check might have failed (e.g., different `data-asset-id` values)
2. Manually remove duplicates and re-run the script

### Animation Not Working

1. Verify `repeatCount="indefinite"` is present
2. Check that animation elements have correct attribute names
3. Ensure SVG viewer supports SMIL animations

## Files Modified

The script modifies these files in the `svgs/` directory:

- `topology-02-host-sdk-platform.svg`
- `topology-03-thin-host-enabling.svg`
- `topology-04-components-design-system.svg`
- `topology-05-conductor-core.svg`
- `topology-06-valence-governance.svg`
- `topology-07-product-solution.svg`

**Note**: `topology-01-plugin-team.svg` is manually maintained and not modified by the script.

## Future Enhancements

Potential improvements:

1. **CLI Arguments**: Accept file patterns, specific slides, or custom positions
2. **Validation Mode**: Dry-run to preview changes without writing
3. **Diff Output**: Show what will change before applying
4. **Icon Library**: Extract icons to separate files and import
5. **Performance**: Parallelize file processing for large batches
6. **Rollback**: Add ability to remove icons and restore original SVGs
