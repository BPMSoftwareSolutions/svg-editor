import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectionProvider, useSelection } from './SelectionContext'

// Test component that uses the selection context
function TestComponent() {
  const { selectedElement, selectElement, clearSelection } = useSelection()

  return (
    <div>
      <div data-testid="selected-info">
        {selectedElement ? selectedElement.type : 'none'}
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
          selectElement(mockElement)
        }}
      >
        Select
      </button>
      <button onClick={clearSelection}>Clear</button>
    </div>
  )
}

describe('SelectionContext', () => {
  it('provides selection context to children', () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    )

    expect(screen.getByTestId('selected-info')).toHaveTextContent('none')
  })

  it('allows selecting an element', () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Select'))
    expect(screen.getByTestId('selected-info')).toHaveTextContent('circle')
  })

  it('allows clearing selection', () => {
    render(
      <SelectionProvider>
        <TestComponent />
      </SelectionProvider>
    )

    fireEvent.click(screen.getByText('Select'))
    expect(screen.getByTestId('selected-info')).toHaveTextContent('circle')

    fireEvent.click(screen.getByText('Clear'))
    expect(screen.getByTestId('selected-info')).toHaveTextContent('none')
  })
})

