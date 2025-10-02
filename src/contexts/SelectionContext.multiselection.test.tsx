import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectionProvider, useSelection } from './SelectionContext'

// Create mock elements outside component to maintain references
const mockElements: Record<string, SVGElement> = {}

const createMockElement = (id: string) => {
  if (!mockElements[id]) {
    const mockElement = document.createElement('circle') as unknown as SVGElement
    mockElement.id = id
    mockElement.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      toJSON: () => ({}),
    })
    mockElements[id] = mockElement
  }
  return mockElements[id]
}

// Test component that uses the selection context
function MultiSelectionTestComponent() {
  const { selectedElements, selectElement, toggleElement, clearSelection, isSelected } = useSelection()

  return (
    <div>
      <div data-testid="selection-count">
        {selectedElements.length}
      </div>
      <div data-testid="selection-types">
        {selectedElements.map(sel => sel.type).join(', ')}
      </div>
      <button
        onClick={() => {
          const element = createMockElement('element1')
          selectElement(element, false)
        }}
      >
        Select Element 1
      </button>
      <button
        onClick={() => {
          const element = createMockElement('element2')
          selectElement(element, true)
        }}
      >
        Add Element 2
      </button>
      <button
        onClick={() => {
          const element = createMockElement('element3')
          toggleElement(element)
        }}
      >
        Toggle Element 3
      </button>
      <button onClick={clearSelection}>Clear All</button>
      <div data-testid="is-selected-1">
        {isSelected(createMockElement('element1')) ? 'yes' : 'no'}
      </div>
    </div>
  )
}

describe('SelectionContext - Multi-Selection', () => {
  it('starts with no selections', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    expect(screen.getByTestId('selection-count')).toHaveTextContent('0')
  })

  it('allows selecting a single element', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Select Element 1'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')
    expect(screen.getByTestId('selection-types')).toHaveTextContent('circle')
  })

  it('allows adding elements to selection', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Select Element 1'))
    fireEvent.click(screen.getByText('Add Element 2'))
    
    expect(screen.getByTestId('selection-count')).toHaveTextContent('2')
    expect(screen.getByTestId('selection-types')).toHaveTextContent('circle, circle')
  })

  it('replaces selection when addToSelection is false', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Add Element 2'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')
    
    fireEvent.click(screen.getByText('Select Element 1'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')
  })

  it('allows toggling elements in selection', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    // Toggle on
    fireEvent.click(screen.getByText('Toggle Element 3'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')

    // Toggle off
    fireEvent.click(screen.getByText('Toggle Element 3'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('0')
  })

  it('clears all selections', () => {
    render(
      <SelectionProvider>
        <MultiSelectionTestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Select Element 1'))
    fireEvent.click(screen.getByText('Add Element 2'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('2')

    fireEvent.click(screen.getByText('Clear All'))
    expect(screen.getByTestId('selection-count')).toHaveTextContent('0')
  })

  it('provides backward compatibility with selectedElement', () => {
    function BackwardCompatTestComponent() {
      const { selectedElement, selectElement } = useSelection()

      return (
        <div>
          <div data-testid="has-single-selection">
            {selectedElement ? 'yes' : 'no'}
          </div>
          <button
            onClick={() => {
              const mockElement = document.createElement('circle') as unknown as SVGElement
              mockElement.getBoundingClientRect = () => ({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                top: 0,
                left: 0,
                right: 100,
                bottom: 100,
                toJSON: () => ({}),
              })
              selectElement(mockElement, false)
            }}
          >
            Select
          </button>
        </div>
      )
    }

    render(
      <SelectionProvider>
        <BackwardCompatTestComponent />
      </SelectionProvider>
    )

    expect(screen.getByTestId('has-single-selection')).toHaveTextContent('no')
    
    fireEvent.click(screen.getByText('Select'))
    expect(screen.getByTestId('has-single-selection')).toHaveTextContent('yes')
  })
})

