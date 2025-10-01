# SVG Editor

A modern, interactive SVG editor built with React and TypeScript.

## Features

- 📁 **File Upload**: Drag and drop SVG files or click to browse
- 🔍 **Pan & Zoom**: Navigate large SVG files with mouse controls
- 🎯 **Element Selection**: Click on any SVG element to select it
- 🖱️ **Drag & Move**: Drag selected elements to reposition them
- 📏 **Resize**: Use corner handles to resize elements
- 📚 **Z-Order Management**: Control element stacking with toolbar buttons
- ⌨️ **Keyboard Shortcuts**: Efficient editing with keyboard commands
- 🎨 **Element Inspector**: View and understand element properties

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

```bash
npm test
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

### Editing Elements

#### Selection
- Click on any element to select it
- Selected elements show a blue outline with corner handles
- Press `Escape` to clear selection

#### Moving Elements
- **Drag**: Click and drag the selected element
- **Arrow Keys**: Move 1px at a time
- **Shift + Arrow Keys**: Move 10px at a time

#### Resizing
- Drag the corner handles to resize
- Different element types (rect, circle, ellipse) resize appropriately

#### Z-Order (Stacking)
Use the toolbar at the bottom:
- **To Front**: Bring element to the very front
- **Forward**: Move element one layer forward
- **Backward**: Move element one layer backward
- **To Back**: Send element to the very back

#### Deleting
- Press `Delete` key to remove the selected element

### Element Inspector

The inspector panel (top-left) shows:
- Element type (rect, circle, path, etc.)
- Element ID (if present)
- Dimensions (width, height, position)
- All attributes and their values

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Clear selection |
| `Delete` | Remove selected element |
| `Arrow Keys` | Move element 1px |
| `Shift + Arrow Keys` | Move element 10px |

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **React Testing Library**: Component testing

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
