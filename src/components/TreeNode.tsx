import { useState } from 'react'

interface TreeNodeData {
  element: SVGElement
  children: TreeNodeData[]
  level: number
}

interface TreeNodeProps {
  node: TreeNodeData
  selectedElement?: SVGElement
  selectedElements?: SVGElement[]
  onNodeClick: (element: SVGElement) => void
}

function TreeNode({ node, selectedElement, selectedElements = [], onNodeClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { element, children, level } = node

  const tagName = element.tagName.toLowerCase()
  const id = element.getAttribute('id')
  const className = element.getAttribute('class')
  const hasChildren = children.length > 0
  const isSelected = selectedElement === element || selectedElements.includes(element)

  const getElementIcon = (tag: string): string => {
    switch (tag) {
      case 'svg':
        return '📄'
      case 'g':
        return '📁'
      case 'rect':
        return '▭'
      case 'circle':
        return '⭕'
      case 'ellipse':
        return '⬭'
      case 'path':
        return '〰️'
      case 'line':
        return '─'
      case 'polyline':
      case 'polygon':
        return '⬡'
      case 'text':
        return '📝'
      case 'image':
        return '🖼️'
      case 'use':
        return '🔗'
      default:
        return '◆'
    }
  }

  const getElementLabel = (): string => {
    let label = `<${tagName}>`
    if (id) label += ` #${id}`
    if (className) label += ` .${className}`
    if (hasChildren) label += ` (${children.length})`
    return label
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeClick(element)
  }

  return (
    <div className="tree-node">
      <div
        className={`tree-node-content ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            className="expand-button"
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="expand-spacer" />}
        <span className="element-icon">{getElementIcon(tagName)}</span>
        <span className="element-label">{getElementLabel()}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="tree-node-children">
          {children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              selectedElement={selectedElement}
              selectedElements={selectedElements}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TreeNode

