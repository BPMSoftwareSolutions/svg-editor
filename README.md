# SVG Editor

A modern, interactive SVG editor built with React and TypeScript.

## Features

- 📁 **File Upload**: Drag and drop SVG files or click to browse
- 🔍 **Pan & Zoom**: Navigate large SVG files with mouse controls
- 🌳 **Tree View Panel**: Hierarchical view of SVG structure with z-order visualization
- 🎯 **Element Selection**: Click on any SVG element to select it (tree or canvas)
- ✨ **Multi-Selection**: Select multiple elements with Ctrl+Click or drag selection
- 🖱️ **Drag & Move**: Drag selected elements to reposition them
- 📏 **Resize**: Use corner handles to resize elements
- 📚 **Z-Order Management**: Control element stacking with toolbar buttons
- ⌨️ **Keyboard Shortcuts**: Efficient editing with keyboard commands
- 🎨 **Element Inspector**: View and understand element properties
- 💾 **Save/Export**: Download modified SVG files with all changes preserved
- 🗑️ **Delete Elements**: Remove unwanted elements with visual feedback

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

#### Unit Tests

Run unit tests with Vitest:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with UI:

```bash
npm run test:ui
```

#### E2E Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

Run E2E tests with UI mode:

```bash
npm run test:e2e:ui
```

Run E2E tests in headed mode (see browser):

```bash
npm run test:e2e:headed
```

Debug E2E tests:

```bash
npm run test:e2e:debug
```

### Build

```bash
npm run build
```

## Usage

### Loading an SVG

1. Drag and drop an SVG file onto the upload area, or
2. Click the upload area to browse for a file

### Navigation

- **Pan**: Click and drag on the background
- **Zoom In**: Scroll up or click the + button
- **Zoom Out**: Scroll down or click the - button
- **Reset View**: Click the Reset button

### Tree View Panel

The left sidebar shows a hierarchical tree view of your SVG structure:

- **Element Icons**: Visual indicators for different element types (📄 svg, 📁 group, ▭ rect, ⭕ circle, etc.)
- **Element Labels**: Shows tag name, ID (with `#`), and class (with `.`)
- **Child Count**: Groups show the number of children in parentheses
- **Expand/Collapse**: Click the ▶/▼ button to show/hide children
- **Selection**: Click any element in the tree to select it on the canvas
- **Z-Order Visualization**: Elements are listed top-to-bottom (front-to-back)
- **Toggle Panel**: Click the ◀ button to hide the panel, ▶ to show it

### Editing Elements

#### Selection
- **Single Selection**: Click on any element to select it
- **Multi-Selection (Ctrl+Click)**: Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) and click elements to add/remove from selection
- **Marquee Selection**: Click and drag on empty canvas to select all elements in the rectangle
- **Select All**: Press `Ctrl+A` / `Cmd+A` to select all elements
- **Visual Feedback**:
  - Single selection shows blue outline with resize handles
  - Multi-selection shows green combined bounding box with individual element outlines
  - Selection count indicator appears in top-right corner
- Press `Escape` to clear selection

#### Moving Elements
- **Drag**: Click and drag the selected element(s)
- **Arrow Keys**: Move 1px at a time
- **Shift + Arrow Keys**: Move 10px at a time
- **Multi-Selection**: All selected elements move together

#### Resizing
- Drag the corner handles to resize
- Different element types (rect, circle, ellipse) resize appropriately

#### Z-Order (Stacking)
Use the toolbar at the bottom:
- **To Front**: Bring element(s) to the very front
- **Forward**: Move element(s) one layer forward
- **Backward**: Move element(s) one layer backward
- **To Back**: Send element(s) to the very back
- **Multi-Selection**: Z-order operations apply to all selected elements

#### Deleting
- Press `Delete` key to remove the selected element(s)
- Click the 🗑️ delete button in the Element Inspector panel
- **Multi-Selection**: Deletes all selected elements at once

### Saving Your Work

#### Export SVG
- Click the **💾 Save SVG** button in the header
- Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
- The modified SVG will be downloaded with all your changes preserved

### Element Inspector

The inspector panel (top-left) shows:

**Single Selection:**
- Element type (rect, circle, path, etc.)
- Element ID (if present)
- Dimensions (width, height, position)
- All attributes and their values

**Multi-Selection:**
- Total count of selected elements
- Type breakdown (e.g., "3× rect, 2× circle")
- Batch operations (delete all, z-order all)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` / `Cmd+A` | Select all elements |
| `Ctrl+Click` / `Cmd+Click` | Add/remove element from selection |
| `Escape` | Clear selection |
| `Delete` | Remove selected element(s) |
| `Arrow Keys` | Move element(s) 1px |
| `Shift + Arrow Keys` | Move element(s) 10px |
| `Ctrl+S` / `Cmd+S` | Save/Export SVG |

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing framework

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Workflow Triggers
- **Push to main**: Runs full CI pipeline
- **Push to feature branches**: Runs full CI pipeline
- **Pull requests to main**: Runs full CI pipeline

### CI Jobs

1. **Lint**: Runs ESLint to check code quality
2. **Unit Tests**: Runs Vitest unit tests with coverage
3. **E2E Tests**: Runs Playwright E2E tests in headless Chromium
4. **Build**: Builds the application for production
5. **Test Summary**: Aggregates results from all jobs

### Artifacts

The CI pipeline uploads the following artifacts:
- **Unit test coverage**: Code coverage reports
- **Playwright report**: E2E test results with screenshots
- **Playwright results**: Detailed test execution data
- **Build artifacts**: Production build output

All artifacts are retained for 30 days.

## Project Structure

```
src/
├── components/          # React components
│   ├── FileUploader.tsx
│   ├── SVGViewer.tsx
│   ├── SelectionOverlay.tsx
│   ├── ElementInspector.tsx
│   └── Toolbar.tsx
├── contexts/           # React contexts
│   └── SelectionContext.tsx
├── hooks/              # Custom React hooks
│   ├── useDrag.ts
│   └── useResize.ts
├── utils/              # Utility functions
│   └── transform.ts
├── styles/             # CSS files
└── App.tsx             # Main app component
```

## Development Plan

This project was built following a 6-iteration development plan:

1. **Foundation & Basic Viewer**: SVG loading and display with pan/zoom
2. **Element Selection System**: Click-to-select with visual feedback
3. **Move & Drag Functionality**: Drag elements to reposition
4. **Resize Handles & Scaling**: Resize elements with corner handles
5. **Z-Order Management**: Control element stacking order
6. **Polish & User Experience**: Keyboard shortcuts and animations

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for details.

## License

MIT
