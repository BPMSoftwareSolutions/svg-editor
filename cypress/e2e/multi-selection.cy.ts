/// <reference types="cypress" />

describe('Multi-Selection Features', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    
    // Wait for SVG to load
    cy.get('svg').should('be.visible')
  })

  it('should select single element on click', () => {
    // Click on first rectangle
    cy.get('#rect1').click()
    
    // Verify selection overlay is visible
    cy.get('.selection-overlay').should('be.visible')
    
    // Verify element inspector shows element info
    cy.get('.element-inspector').should('contain', 'rect')
  })

  it('should select multiple elements with Ctrl+Click', () => {
    // Click first element
    cy.get('#rect1').click()
    
    // Ctrl+Click second element
    cy.get('#circle1').click({ ctrlKey: true })
    
    // Verify selection count indicator shows 2
    cy.get('.selection-count').should('contain', '2')
    
    // Verify element inspector shows multi-selection info
    cy.get('.element-inspector').should('contain', '2 elements selected')
  })

  it('should toggle element selection with Ctrl+Click', () => {
    // Select first element
    cy.get('#rect1').click()
    
    // Add second element
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '2')
    
    // Toggle off first element
    cy.get('#rect1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '1')
  })

  it('should select all elements with Ctrl+A', () => {
    // Press Ctrl+A
    cy.get('body').type('{ctrl}a')
    
    // Verify all 5 elements are selected
    cy.get('.selection-count').should('contain', '5')
    cy.get('.element-inspector').should('contain', '5 elements selected')
  })

  it('should clear selection with Escape', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '2')
    
    // Press Escape
    cy.get('body').type('{esc}')
    
    // Verify selection is cleared
    cy.get('.selection-count').should('not.be.visible')
  })

  it('should select elements with marquee drag', () => {
    // Drag from top-left to bottom-right to select multiple elements
    cy.get('.viewer-container')
      .trigger('mousedown', { which: 1, clientX: 40, clientY: 40 })
      .trigger('mousemove', { clientX: 300, clientY: 250 })
    
    // Verify marquee rectangle is visible during drag
    cy.get('.marquee-selection').should('be.visible')
    
    cy.get('.viewer-container').trigger('mouseup')
    
    // Verify multiple elements are selected
    cy.get('.selection-count').should('be.visible')
    cy.get('.selection-count').invoke('text').then((text) => {
      const count = parseInt(text.match(/\d+/)?.[0] || '0')
      expect(count).to.be.greaterThan(1)
    })
  })

  it('should add to selection with Ctrl+Marquee drag', () => {
    // Select first element
    cy.get('#rect1').click()
    cy.get('.selection-count').should('contain', '1')
    
    // Ctrl+Drag to add more elements
    cy.get('.viewer-container')
      .trigger('mousedown', { which: 1, clientX: 200, clientY: 80, ctrlKey: true })
      .trigger('mousemove', { clientX: 300, clientY: 120, ctrlKey: true })
      .trigger('mouseup', { ctrlKey: true })
    
    // Verify selection count increased
    cy.get('.selection-count').invoke('text').then((text) => {
      const count = parseInt(text.match(/\d+/)?.[0] || '0')
      expect(count).to.be.greaterThan(1)
    })
  })

  it('should show visual indicators for multi-selection', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    
    // Verify selection overlay shows multi-selection styling
    cy.get('.selection-overlay').should('have.class', 'multi-selection')
    
    // Verify selection count badge is visible
    cy.get('.selection-count').should('be.visible')
  })

  it('should move multiple elements together', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    
    // Get initial positions
    cy.get('#rect1').then(($rect) => {
      const initialRectX = $rect.attr('x')
      
      cy.get('#circle1').then(($circle) => {
        const initialCircleX = $circle.attr('cx')
        
        // Press arrow key to move
        cy.get('body').type('{rightarrow}')
        
        // Verify both elements moved
        cy.get('#rect1').should(($newRect) => {
          expect($newRect.attr('x')).not.to.equal(initialRectX)
        })
        
        cy.get('#circle1').should(($newCircle) => {
          expect($newCircle.attr('cx')).not.to.equal(initialCircleX)
        })
      })
    })
  })

  it('should delete multiple elements', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '2')
    
    // Press Delete key
    cy.get('body').type('{del}')
    
    // Verify both elements are removed
    cy.get('#rect1').should('not.exist')
    cy.get('#circle1').should('not.exist')
  })

  it('should show element type breakdown in inspector', () => {
    // Select multiple elements of different types
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('#ellipse1').click({ ctrlKey: true })
    
    // Verify element inspector shows type breakdown
    cy.get('.element-inspector').should('contain', '3 elements selected')
    cy.get('.element-inspector').should('contain', 'rect')
    cy.get('.element-inspector').should('contain', 'circle')
    cy.get('.element-inspector').should('contain', 'ellipse')
  })

  it('should highlight all selected elements in tree panel', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    
    // Verify both elements are highlighted in tree panel
    cy.get('.tree-panel').contains('rect1').parent().should('have.class', 'selected')
    cy.get('.tree-panel').contains('circle1').parent().should('have.class', 'selected')
  })

  it('should select multiple elements from tree panel with Ctrl+Click', () => {
    // Click first tree node
    cy.get('.tree-panel').contains('rect1').click()
    
    // Ctrl+Click second tree node
    cy.get('.tree-panel').contains('circle1').click({ ctrlKey: true })
    
    // Verify selection count shows 2
    cy.get('.selection-count').should('contain', '2')
  })

  it('should show green bounding box for multi-selection', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    
    // Verify selection overlay has green stroke for multi-selection
    cy.get('.selection-overlay rect').should('have.attr', 'stroke', '#4ade80')
  })

  it('should maintain selection when clicking on already selected element', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '2')
    
    // Click on already selected element without Ctrl
    cy.get('#rect1').click()
    
    // Verify only that element is now selected
    cy.get('.selection-count').should('contain', '1')
  })

  it('should clear multi-selection when clicking on empty space', () => {
    // Select multiple elements
    cy.get('#rect1').click()
    cy.get('#circle1').click({ ctrlKey: true })
    cy.get('.selection-count').should('contain', '2')
    
    // Click on empty space
    cy.get('.viewer-container').click(10, 10)
    
    // Verify selection is cleared
    cy.get('.selection-count').should('not.be.visible')
  })
})

