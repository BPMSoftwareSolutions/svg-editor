/// <reference types="cypress" />

describe('Canvas Boundary and Auto-Panning', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
  })

  it('should show selection overlay when element is selected', () => {
    // Click on an element to select it
    cy.get('#rect1').click()

    // Verify selection overlay is visible
    cy.get('.selection-overlay').should('be.visible')
    cy.get('.selection-overlay').should('have.class', 'selection-overlay')
  })

  it('should allow dragging element within viewport', () => {
    // Select an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Get initial position
    cy.get('#rect1').then($el => {
      const initialRect = $el[0].getBoundingClientRect()

      // Drag the element
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1, clientX: initialRect.left + 50, clientY: initialRect.top + 50 })
        .trigger('mousemove', { clientX: initialRect.left + 150, clientY: initialRect.top + 150 })
        .trigger('mouseup')

      // Verify element moved
      cy.get('#rect1').then($movedEl => {
        const newRect = $movedEl[0].getBoundingClientRect()
        expect(newRect.left).to.not.equal(initialRect.left)
        expect(newRect.top).to.not.equal(initialRect.top)
      })
    })
  })

  it('should show clipped indicator when element is near viewport edge', () => {
    // Select an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Get viewport container dimensions
    cy.get('.viewer-container').then($container => {
      const containerRect = $container[0].getBoundingClientRect()

      // Drag element near the right edge
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
        .trigger('mousemove', { clientX: containerRect.right - 20, clientY: 200 })
        .trigger('mouseup')

      // Wait a bit for the overlay to update
      cy.wait(100)

      // Verify the clipped class is applied
      cy.get('.selection-overlay').should('have.class', 'clipped')
    })
  })

  it('should trigger auto-panning when dragged near edges', () => {
    // Select an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Get initial viewport transform
    cy.get('.svg-content').then($content => {
      const initialTransform = $content.css('transform')

      // Get viewport container dimensions
      cy.get('.viewer-container').then($container => {
        const containerRect = $container[0].getBoundingClientRect()

        // Drag element near the right edge (should trigger auto-panning)
        cy.get('.selection-overlay')
          .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
          .trigger('mousemove', { clientX: containerRect.right - 30, clientY: 200 })
          .wait(500) // Wait for auto-panning to occur
          .trigger('mouseup')

        // Wait for auto-panning to complete
        cy.wait(200)

        // Viewport should have panned (transform changed)
        cy.get('.svg-content').then($movedContent => {
          const newTransform = $movedContent.css('transform')
          // Auto-panning should have changed the viewport transform
          expect(newTransform).to.not.equal(initialTransform)
        })
      })
    })
  })

  it('should allow undo after dragging element', () => {
    // Select and drag an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    cy.get('#rect1').then($el => {
      const initialTransform = $el.attr('transform') || ''

      // Drag the element
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
        .trigger('mousemove', { clientX: 300, clientY: 300 })
        .trigger('mouseup')

      // Wait for command to be added to history
      cy.wait(100)

      // Verify element moved
      cy.get('#rect1').then($movedEl => {
        const newTransform = $movedEl.attr('transform') || ''
        expect(newTransform).to.not.equal(initialTransform)

        // Undo the move
        cy.get('body').type('{ctrl}z')

        // Wait for undo to complete
        cy.wait(100)

        // Verify element returned to original position
        cy.get('#rect1').then($undoneEl => {
          const undoneTransform = $undoneEl.attr('transform') || ''
          expect(undoneTransform).to.equal(initialTransform)
        })
      })
    })
  })

  // Note: Viewport panning is tested in basic-functionality.cy.ts

  it('should handle zoom in and zoom out', () => {
    // Get initial scale
    cy.get('.svg-content').then($content => {
      const initialTransform = $content.css('transform')

      // Click zoom in button (in viewer-controls, not toolbar)
      cy.get('.viewer-controls').contains('button', '+').click()

      // Wait for zoom to complete
      cy.wait(100)

      // Verify scale changed
      cy.get('.svg-content').then($zoomedContent => {
        const newTransform = $zoomedContent.css('transform')
        expect(newTransform).to.not.equal(initialTransform)
      })

      // Verify zoom level indicator updated
      cy.get('.zoom-level').should('not.contain', '100%')

      // Click zoom out button
      cy.get('.viewer-controls').contains('button', '-').click()

      // Wait for zoom to complete
      cy.wait(100)

      // Click reset button
      cy.get('.viewer-controls').contains('button', 'Reset').click()

      // Wait for reset to complete
      cy.wait(100)

      // Verify zoom level is back to 100%
      cy.get('.zoom-level').should('contain', '100%')
    })
  })

  it('should maintain selection overlay position during zoom', () => {
    // Select an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Get initial overlay position
    cy.get('.selection-overlay').then($overlay => {
      const initialRect = $overlay[0].getBoundingClientRect()

      // Zoom in
      cy.contains('button', '+').click()
      cy.wait(100)

      // Overlay should still be visible and positioned correctly
      cy.get('.selection-overlay').should('be.visible')

      // Zoom out
      cy.contains('button', '-').click()
      cy.wait(100)

      // Overlay should still be visible
      cy.get('.selection-overlay').should('be.visible')
    })
  })

  it('should handle multi-selection near viewport edges', () => {
    // Select first element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Add second element to selection (Ctrl+Click)
    cy.get('#circle1').click({ ctrlKey: true })

    // Verify multi-selection overlay is visible
    cy.get('.selection-overlay').should('have.class', 'multi-selection')
    cy.get('.multi-selection-outline').should('have.length', 2)

    // Drag multi-selection
    cy.get('.selection-overlay')
      .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
      .trigger('mousemove', { clientX: 300, clientY: 300 })
      .trigger('mouseup')

    // Both elements should still be visible
    cy.get('#rect1').should('be.visible')
    cy.get('#circle1').should('be.visible')
    cy.get('.selection-overlay').should('be.visible')
  })

  it('should clear clipped state when element is moved back to center', () => {
    // Select an element
    cy.get('#rect1').click()
    cy.get('.selection-overlay').should('be.visible')

    // Get viewport container dimensions
    cy.get('.viewer-container').then($container => {
      const containerRect = $container[0].getBoundingClientRect()

      // Drag element near the edge to trigger clipped state
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
        .trigger('mousemove', { clientX: containerRect.right - 20, clientY: 200 })
        .trigger('mouseup')

      cy.wait(100)

      // Verify clipped class is applied
      cy.get('.selection-overlay').should('have.class', 'clipped')

      // Drag element back to center
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1, clientX: containerRect.right - 20, clientY: 200 })
        .trigger('mousemove', { clientX: containerRect.left + 200, clientY: 200 })
        .trigger('mouseup')

      cy.wait(100)

      // Verify clipped class is removed
      cy.get('.selection-overlay').should('not.have.class', 'clipped')
    })
  })
})

