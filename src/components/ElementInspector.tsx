import { useState, useEffect, useRef } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import { useUndoRedo } from '../contexts/UndoRedoContext'
import { DeleteElementCommand, TextEditCommand, ZOrderCommand } from '../commands'
import '../styles/ElementInspector.css'

function ElementInspector() {
  const { selectedElement, selectedElements, clearSelection } = useSelection()
  const { executeCommand } = useUndoRedo()
  const [textContent, setTextContent] = useState('')
  const originalTextRef = useRef('')

  // Update text content when selection changes
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      const text = selectedElement.element.textContent || ''
      setTextContent(text)
      originalTextRef.current = text
    } else {
      setTextContent('')
      originalTextRef.current = ''
    }
  }, [selectedElement])

  const handleDelete = () => {
    if (selectedElements.length === 0) return

    // Create delete command
    const elements = selectedElements.map(sel => sel.element)
    const command = new DeleteElementCommand(elements)
    executeCommand(command)

    // Clear selection
    clearSelection()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value)
  }

  const handleTextBlur = () => {
    if (!selectedElement || selectedElement.type !== 'text') return

    // Only create command if text actually changed
    if (textContent !== originalTextRef.current) {
      const command = new TextEditCommand(
        selectedElement.element,
        originalTextRef.current,
        textContent
      )
      executeCommand(command)
      originalTextRef.current = textContent
    }
  }

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ;(e.target as HTMLTextAreaElement).blur()
    }
  }

  const bringToFront = () => {
    if (selectedElements.length === 0) return
    selectedElements.forEach(sel => {
      const command = new ZOrderCommand(sel.element, 'toFront')
      executeCommand(command)
    })
  }

  const sendToBack = () => {
    if (selectedElements.length === 0) return
    // Reverse order to maintain relative ordering
    [...selectedElements].reverse().forEach(sel => {
      const command = new ZOrderCommand(sel.element, 'toBack')
      executeCommand(command)
    })
  }

  const bringForward = () => {
    if (selectedElements.length === 0) return
    selectedElements.forEach(sel => {
      const command = new ZOrderCommand(sel.element, 'forward')
      executeCommand(command)
    })
  }

  const sendBackward = () => {
    if (selectedElements.length === 0) return
    selectedElements.forEach(sel => {
      const command = new ZOrderCommand(sel.element, 'backward')
      executeCommand(command)
    })
  }

  if (selectedElements.length === 0) {
    return (
      <div className="element-inspector empty">
        <p>No element selected</p>
        <p className="hint">Click on an SVG element to inspect it</p>
        <p className="hint">Hold Ctrl/Cmd to select multiple</p>
      </div>
    )
  }

  // Multi-selection view
  if (selectedElements.length > 1) {
    // Calculate type breakdown
    const typeCounts: Record<string, number> = {}
    selectedElements.forEach(sel => {
      typeCounts[sel.type] = (typeCounts[sel.type] || 0) + 1
    })

    return (
      <div className="element-inspector multi-selection">
        <div className="inspector-header">
          <h3>Multi-Selection</h3>
          <div className="inspector-actions">
            <button onClick={handleDelete} className="delete-button" title="Delete all selected (Del)">
              🗑️
            </button>
            <button onClick={clearSelection} className="close-button" title="Clear Selection">
              ×
            </button>
          </div>
        </div>

        <div className="inspector-section">
          <h4>Selection Count</h4>
          <p className="selection-count">{selectedElements.length} elements selected</p>
        </div>

        <div className="inspector-section">
          <h4>Type Breakdown</h4>
          <div className="type-breakdown">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} className="type-item">
                <span className="type-name">&lt;{type}&gt;</span>
                <span className="type-count">× {count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="inspector-section">
          <h4>Z-Order</h4>
          <div className="z-order-controls">
            <button onClick={bringToFront} className="z-order-button" title="Bring all to Front">
              ⬆️ To Front
            </button>
            <button onClick={bringForward} className="z-order-button" title="Bring all Forward">
              ⬆ Forward
            </button>
            <button onClick={sendBackward} className="z-order-button" title="Send all Backward">
              ⬇ Backward
            </button>
            <button onClick={sendToBack} className="z-order-button" title="Send all to Back">
              ⬇️ To Back
            </button>
          </div>
        </div>

        <div className="inspector-section">
          <button onClick={clearSelection} className="clear-selection-button">
            Clear Selection
          </button>
        </div>
      </div>
    )
  }

  // Single selection view (existing code)
  if (!selectedElement) return null

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

      {type === 'text' && (
        <div className="inspector-section">
          <h4>Text Content</h4>
          <textarea
            className="text-editor"
            value={textContent}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            placeholder="Enter text content..."
            rows={3}
          />
          <p className="hint-text">Press Enter to apply, Shift+Enter for new line</p>
        </div>
      )}

      <div className="inspector-section">
        <h4>Z-Order</h4>
        <div className="z-order-controls">
          <button onClick={bringToFront} className="z-order-button" title="Bring to Front">
            ⬆️ To Front
          </button>
          <button onClick={bringForward} className="z-order-button" title="Bring Forward">
            ⬆ Forward
          </button>
          <button onClick={sendBackward} className="z-order-button" title="Send Backward">
            ⬇ Backward
          </button>
          <button onClick={sendToBack} className="z-order-button" title="Send to Back">
            ⬇️ To Back
          </button>
        </div>
      </div>

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

