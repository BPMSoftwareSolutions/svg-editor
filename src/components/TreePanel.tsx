import { useState, useEffect } from 'react'
import { useSelection } from '../contexts/SelectionContext'
import TreeNode from './TreeNode'
import '../styles/TreePanel.css'

interface TreeNodeData {
  element: SVGElement
  children: TreeNodeData[]
  level: number
}

function TreePanel() {
  const { selectedElement, selectedElements, selectElement, toggleElement } = useSelection()
  const [treeData, setTreeData] = useState<TreeNodeData[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const parseTree = () => {
    // Parse SVG structure
    const svgElement = document.querySelector('.svg-content svg')
    if (!svgElement) {
      setTreeData([])
      return
    }

    const parseElement = (element: Element, level: number = 0): TreeNodeData | null => {
      if (!(element instanceof SVGElement)) return null

      const children: TreeNodeData[] = []
      for (let i = 0; i < element.children.length; i++) {
        const child = parseElement(element.children[i], level + 1)
        if (child) children.push(child)
      }

      return {
        element: element as SVGElement,
        children,
        level,
      }
    }

    const rootNode = parseElement(svgElement, 0)
    setTreeData(rootNode ? [rootNode] : [])
  }

  useEffect(() => {
    parseTree()

    // Set up a MutationObserver to watch for changes to the SVG
    const svgContainer = document.querySelector('.svg-content')
    if (!svgContainer) return

    const observer = new MutationObserver(() => {
      parseTree()
    })

    observer.observe(svgContainer, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => observer.disconnect()
  }, [])

  const handleNodeClick = (element: SVGElement, e?: React.MouseEvent) => {
    // Don't select the root SVG element
    if (element.tagName.toLowerCase() === 'svg') {
      selectElement(null)
      return
    }

    // Check if Ctrl/Cmd is pressed for multi-selection
    if (e && (e.ctrlKey || e.metaKey)) {
      toggleElement(element)
    } else {
      selectElement(element)
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (isCollapsed) {
    return (
      <div className="tree-panel collapsed">
        <button onClick={toggleCollapse} className="toggle-button" title="Show Tree Panel">
          ▶
        </button>
      </div>
    )
  }

  return (
    <div className="tree-panel">
      <div className="tree-header">
        <h3>SVG Structure</h3>
        <button onClick={toggleCollapse} className="toggle-button" title="Hide Tree Panel">
          ◀
        </button>
      </div>
      <div className="tree-content">
        {treeData.length === 0 ? (
          <p className="empty-message">No SVG loaded</p>
        ) : (
          treeData.map((node, index) => (
            <TreeNode
              key={index}
              node={node}
              selectedElement={selectedElement?.element}
              selectedElements={selectedElements.map(sel => sel.element)}
              onNodeClick={handleNodeClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TreePanel

