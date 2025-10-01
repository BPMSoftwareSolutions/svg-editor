import { useSelection } from '../contexts/SelectionContext'
import '../styles/ElementInspector.css'

function ElementInspector() {
  const { selectedElement, clearSelection } = useSelection()

  const handleDelete = () => {
    if (!selectedElement) return

    // Remove element from DOM
    selectedElement.element.remove()

    // Clear selection
    clearSelection()
  }

  if (!selectedElement) {
    return (
      <div className="element-inspector empty">
        <p>No element selected</p>
        <p className="hint">Click on an SVG element to inspect it</p>
      </div>
    )
  }

  const { element, id, type, bbox } = selectedElement
  const className = element.getAttribute('class')

  // Get element attributes
  const attributes: Record<string, string> = {}
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    attributes[attr.name] = attr.value
  }

  return (
    <div className="element-inspector">
      <div className="inspector-header">
        <h3>Element Inspector</h3>
        <div className="inspector-actions">
          <button onClick={handleDelete} className="delete-button" title="Delete element (Del)">
            🗑️
          </button>
          <button onClick={clearSelection} className="close-button" title="Clear Selection">
            ×
          </button>
        </div>
      </div>

      <div className="inspector-section">
        <h4>Type</h4>
        <p className="element-type">&lt;{type}&gt;</p>
      </div>

      {id && (
        <div className="inspector-section">
          <h4>ID</h4>
          <p className="element-id">#{id}</p>
        </div>
      )}

      {className && (
        <div className="inspector-section">
          <h4>Class</h4>
          <p className="element-class">.{className}</p>
        </div>
      )}

      <div className="inspector-section">
        <h4>Dimensions</h4>
        <div className="dimensions">
          <div className="dimension-item">
            <span className="label">Width:</span>
            <span className="value">{Math.round(bbox.width)}px</span>
          </div>
          <div className="dimension-item">
            <span className="label">Height:</span>
            <span className="value">{Math.round(bbox.height)}px</span>
          </div>
          <div className="dimension-item">
            <span className="label">X:</span>
            <span className="value">{Math.round(bbox.x)}px</span>
          </div>
          <div className="dimension-item">
            <span className="label">Y:</span>
            <span className="value">{Math.round(bbox.y)}px</span>
          </div>
        </div>
      </div>

      <div className="inspector-section">
        <h4>Attributes</h4>
        <div className="attributes">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="attribute-item">
              <span className="attr-name">{key}:</span>
              <span className="attr-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ElementInspector

