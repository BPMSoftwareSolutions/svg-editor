import { useSelection } from '../contexts/SelectionContext'
import '../styles/Toolbar.css'

function Toolbar() {
  const { selectedElement } = useSelection()

  const bringToFront = () => {
    if (!selectedElement) return
    
    const element = selectedElement.element
    const parent = element.parentNode
    
    if (parent) {
      parent.appendChild(element)
    }
  }

  const sendToBack = () => {
    if (!selectedElement) return
    
    const element = selectedElement.element
    const parent = element.parentNode
    
    if (parent && parent.firstChild) {
      parent.insertBefore(element, parent.firstChild)
    }
  }

  const bringForward = () => {
    if (!selectedElement) return
    
    const element = selectedElement.element
    const nextSibling = element.nextSibling
    
    if (nextSibling) {
      const parent = element.parentNode
      if (parent && nextSibling.nextSibling) {
        parent.insertBefore(element, nextSibling.nextSibling)
      } else if (parent) {
        parent.appendChild(element)
      }
    }
  }

  const sendBackward = () => {
    if (!selectedElement) return
    
    const element = selectedElement.element
    const previousSibling = element.previousSibling
    
    if (previousSibling) {
      const parent = element.parentNode
      if (parent) {
        parent.insertBefore(element, previousSibling)
      }
    }
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

