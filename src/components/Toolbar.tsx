import { useSelection } from '../contexts/SelectionContext'
import { useUndoRedo } from '../contexts/UndoRedoContext'
import { ZOrderCommand } from '../commands'
import '../styles/Toolbar.css'

function Toolbar() {
  const { selectedElement } = useSelection()
  const { executeCommand } = useUndoRedo()

  const bringToFront = () => {
    if (!selectedElement) return
    const command = new ZOrderCommand(selectedElement.element, 'toFront')
    executeCommand(command)
  }

  const sendToBack = () => {
    if (!selectedElement) return
    const command = new ZOrderCommand(selectedElement.element, 'toBack')
    executeCommand(command)
  }

  const bringForward = () => {
    if (!selectedElement) return
    const command = new ZOrderCommand(selectedElement.element, 'forward')
    executeCommand(command)
  }

  const sendBackward = () => {
    if (!selectedElement) return
    const command = new ZOrderCommand(selectedElement.element, 'backward')
    executeCommand(command)
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h4>Z-Order</h4>
        <div className="toolbar-buttons">
          <button
            onClick={bringToFront}
            disabled={!selectedElement}
            title="Bring to Front (Ctrl+Shift+])"
            className="toolbar-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 7h10v10" />
            </svg>
            <span>To Front</span>
          </button>
          <button
            onClick={bringForward}
            disabled={!selectedElement}
            title="Bring Forward (Ctrl+])"
            className="toolbar-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 12h10" />
            </svg>
            <span>Forward</span>
          </button>
          <button
            onClick={sendBackward}
            disabled={!selectedElement}
            title="Send Backward (Ctrl+[)"
            className="toolbar-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 12h10" />
            </svg>
            <span>Backward</span>
          </button>
          <button
            onClick={sendToBack}
            disabled={!selectedElement}
            title="Send to Back (Ctrl+Shift+[)"
            className="toolbar-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 17h10v-10" />
            </svg>
            <span>To Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar

