import { useUndoRedo } from '../contexts/UndoRedoContext'
import { useSelection } from '../contexts/SelectionContext'
import { DeleteElementCommand, ZOrderCommand } from '../commands'
import '../styles/HeaderToolbar.css'

interface HeaderToolbarProps {
  onSave?: () => void
  onClear?: () => void
}

function HeaderToolbar({ onSave, onClear }: HeaderToolbarProps) {
  const { canUndo, canRedo, undo, redo, executeCommand } = useUndoRedo()
  const { selectedElements, clearSelection } = useSelection()

  const handleDelete = () => {
    if (selectedElements.length === 0) return
    
    const elements = selectedElements.map(sel => sel.element)
    const command = new DeleteElementCommand(elements)
    executeCommand(command)
    clearSelection()
  }

  const handleZOrder = (action: 'toFront' | 'toBack' | 'forward' | 'backward') => {
    if (selectedElements.length === 0) return
    
    selectedElements.forEach(sel => {
      const command = new ZOrderCommand(sel.element, action)
      executeCommand(command)
    })
  }

  return (
    <div className="header-toolbar">
      {/* Undo/Redo Group */}
      <div className="toolbar-group">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="toolbar-btn"
          title="Undo (Ctrl+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
          <span>Undo</span>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="toolbar-btn"
          title="Redo (Ctrl+Y)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
          <span>Redo</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Edit Group */}
      <div className="toolbar-group">
        <button
          onClick={handleDelete}
          disabled={selectedElements.length === 0}
          className="toolbar-btn"
          title="Delete (Del)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          <span>Delete</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Z-Order Group */}
      <div className="toolbar-group">
        <div className="dropdown">
          <button
            disabled={selectedElements.length === 0}
            className="toolbar-btn dropdown-toggle"
            title="Z-Order"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h10v10" />
            </svg>
            <span>Z-Order</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div className="dropdown-menu">
            <button
              onClick={() => handleZOrder('toFront')}
              className="dropdown-item"
              title="Bring to Front (Ctrl+Shift+])"
            >
              ⬆️ Bring to Front
            </button>
            <button
              onClick={() => handleZOrder('forward')}
              className="dropdown-item"
              title="Bring Forward (Ctrl+])"
            >
              ⬆ Bring Forward
            </button>
            <button
              onClick={() => handleZOrder('backward')}
              className="dropdown-item"
              title="Send Backward (Ctrl+[)"
            >
              ⬇ Send Backward
            </button>
            <button
              onClick={() => handleZOrder('toBack')}
              className="dropdown-item"
              title="Send to Back (Ctrl+Shift+[)"
            >
              ⬇️ Send to Back
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* File Actions Group */}
      <div className="toolbar-group">
        {onSave && (
          <button
            onClick={onSave}
            className="toolbar-btn save-btn"
            title="Save SVG (Ctrl+S)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <path d="M17 21v-8H7v8" />
              <path d="M7 3v5h8" />
            </svg>
            <span>Save</span>
          </button>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="toolbar-btn clear-btn"
            title="Clear and load new file"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default HeaderToolbar

