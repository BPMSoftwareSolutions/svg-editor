import { createContext, useContext, useState, ReactNode } from 'react'

export interface SelectedElement {
  element: SVGElement
  id: string
  type: string
  bbox: DOMRect
}

interface SelectionContextType {
  selectedElement: SelectedElement | null
  selectElement: (element: SVGElement | null) => void
  clearSelection: () => void
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)

  const selectElement = (element: SVGElement | null) => {
    if (!element) {
      setSelectedElement(null)
      return
    }

    const bbox = element.getBoundingClientRect()
    const id = element.id || `element-${Date.now()}`
    const type = element.tagName.toLowerCase()

    setSelectedElement({
      element,
      id,
      type,
      bbox,
    })
  }

  const clearSelection = () => {
    setSelectedElement(null)
  }

  return (
    <SelectionContext.Provider value={{ selectedElement, selectElement, clearSelection }}>
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

