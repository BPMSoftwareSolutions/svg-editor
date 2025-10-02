import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedElement {
  element: SVGElement
  id: string
  type: string
  bbox: DOMRect
}

interface SelectionContextType {
  selectedElements: SelectedElement[]
  selectedElement: SelectedElement | null // Kept for backward compatibility
  selectElement: (element: SVGElement | null, addToSelection?: boolean) => void
  deselectElement: (element: SVGElement) => void
  clearSelection: () => void
  toggleElement: (element: SVGElement) => void
  selectMultiple: (elements: SVGElement[]) => void
  isSelected: (element: SVGElement) => boolean
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([])

  // Helper function to create SelectedElement from SVGElement
  const createSelectedElement = (element: SVGElement): SelectedElement => {
    const bbox = element.getBoundingClientRect()
    const id = element.id || `element-${Date.now()}-${Math.random()}`
    const type = element.tagName.toLowerCase()

    return {
      element,
      id,
      type,
      bbox,
    }
  }

  // Check if an element is currently selected
  const isSelected = (element: SVGElement): boolean => {
    return selectedElements.some(sel => sel.element === element)
  }

  // Select an element (single or add to selection)
  const selectElement = (element: SVGElement | null, addToSelection: boolean = false) => {
    if (!element) {
      setSelectedElements([])
      return
    }

    if (addToSelection) {
      // Add to existing selection if not already selected
      if (!isSelected(element)) {
        setSelectedElements(prev => [...prev, createSelectedElement(element)])
      }
    } else {
      // Replace selection with single element
      setSelectedElements([createSelectedElement(element)])
    }
  }

  // Deselect a specific element
  const deselectElement = (element: SVGElement) => {
    setSelectedElements(prev => prev.filter(sel => sel.element !== element))
  }

  // Toggle element selection
  const toggleElement = (element: SVGElement) => {
    if (isSelected(element)) {
      deselectElement(element)
    } else {
      selectElement(element, true)
    }
  }

  // Select multiple elements at once
  const selectMultiple = (elements: SVGElement[]) => {
    const newSelection = elements.map(createSelectedElement)
    setSelectedElements(newSelection)
  }

  // Clear all selections
  const clearSelection = () => {
    setSelectedElements([])
  }

  // Backward compatibility: provide single selectedElement
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null

  return (
    <SelectionContext.Provider
      value={{
        selectedElements,
        selectedElement,
        selectElement,
        deselectElement,
        clearSelection,
        toggleElement,
        selectMultiple,
        isSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider')
  }
  return context
}

