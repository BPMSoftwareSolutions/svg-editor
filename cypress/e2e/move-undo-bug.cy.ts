/**
 * E2E test specifically for the move undo bug
 * 
 * Bug: When moving an element and then clicking undo, it only moves back partially
 * Expected: Element should return to its exact original position
 */

describe('Move Undo Bug Fix', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Load a test SVG file
    cy.fixture('test.svg').then((svgContent) => {
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svgContent),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml'
      }, { force: true })
    })
    
    // Wait for SVG to load
    cy.get('.svg-content svg').should('exist')
  })

  it('should fully restore element position after drag and undo', () => {
    // Select the first rect element
    cy.get('.svg-content svg rect').first().then($rect => {
      // Get the initial transform attribute (or lack thereof)
      const initialTransform = $rect.attr('transform') || null
      const initialBBox = $rect[0].getBBox()
      const initialX = initialBBox.x
      const initialY = initialBBox.y
      
      console.log('Initial state:', {
        transform: initialTransform,
        x: initialX,
        y: initialY
      })
      
      // Click to select the element
      cy.get('.svg-content svg rect').first().click()
      
      // Verify selection overlay appears
      cy.get('.selection-overlay').should('exist')
      
      // Drag the element by a significant amount
      cy.get('.selection-overlay')
        .trigger('mousedown', { button: 0, clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 200 })
        .trigger('mouseup', { force: true })
      
      // Wait a bit for the command to be added to history
      cy.wait(100)
      
      // Verify the element has moved
      cy.get('.svg-content svg rect').first().then($movedRect => {
        const movedTransform = $movedRect.attr('transform')
        const movedBBox = $movedRect[0].getBBox()
        
        console.log('After move:', {
          transform: movedTransform,
          x: movedBBox.x,
          y: movedBBox.y
        })
        
        // The transform should have changed (or been added)
        expect(movedTransform).to.not.equal(initialTransform)
        
        // Click undo button
        cy.contains('button', 'Undo').click()
        
        // Wait for undo to complete
        cy.wait(100)
        
        // Verify the element is back to its original position
        cy.get('.svg-content svg rect').first().then($undoneRect => {
          const undoneTransform = $undoneRect.attr('transform') || null
          const undoneBBox = $undoneRect[0].getBBox()
          
          console.log('After undo:', {
            transform: undoneTransform,
            x: undoneBBox.x,
            y: undoneBBox.y
          })
          
          // The transform should match the initial state
          if (initialTransform === null) {
            expect(undoneTransform).to.be.null
          } else {
            expect(undoneTransform).to.equal(initialTransform)
          }
          
          // The position should be very close to the original (within 1 pixel tolerance)
          expect(Math.abs(undoneBBox.x - initialX)).to.be.lessThan(1)
          expect(Math.abs(undoneBBox.y - initialY)).to.be.lessThan(1)
        })
      })
    })
  })

  it('should handle multiple move operations with undo/redo', () => {
    // Select an element
    cy.get('.svg-content svg rect').first().then($rect => {
      const initialTransform = $rect.attr('transform') || null
      
      // First move
      cy.get('.svg-content svg rect').first().click()
      cy.get('.selection-overlay')
        .trigger('mousedown', { button: 0, clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 150, clientY: 150 })
        .trigger('mouseup', { force: true })
      
      cy.wait(100)
      
      // Second move
      cy.get('.selection-overlay')
        .trigger('mousedown', { button: 0, clientX: 150, clientY: 150 })
        .trigger('mousemove', { clientX: 200, clientY: 200 })
        .trigger('mouseup', { force: true })
      
      cy.wait(100)
      
      // Undo second move
      cy.contains('button', 'Undo').click()
      cy.wait(100)
      
      // Undo first move
      cy.contains('button', 'Undo').click()
      cy.wait(100)
      
      // Should be back to original position
      cy.get('.svg-content svg rect').first().then($undoneRect => {
        const undoneTransform = $undoneRect.attr('transform') || null
        
        if (initialTransform === null) {
          expect(undoneTransform).to.be.null
        } else {
          expect(undoneTransform).to.equal(initialTransform)
        }
      })
      
      // Redo first move
      cy.contains('button', 'Redo').click()
      cy.wait(100)
      
      // Redo second move
      cy.contains('button', 'Redo').click()
      cy.wait(100)
      
      // Should be at final position again
      cy.get('.svg-content svg rect').first().then($redoneRect => {
        const redoneTransform = $redoneRect.attr('transform')
        expect(redoneTransform).to.exist
        expect(redoneTransform).to.not.equal(initialTransform)
      })
    })
  })

  it('should handle keyboard arrow key moves with undo', () => {
    // Select an element
    cy.get('.svg-content svg rect').first().then($rect => {
      const initialTransform = $rect.attr('transform') || null
      
      // Click to select
      cy.get('.svg-content svg rect').first().click()
      
      // Move with arrow keys (each creates a separate command)
      cy.get('body').type('{rightarrow}')
      cy.wait(50)
      cy.get('body').type('{rightarrow}')
      cy.wait(50)
      cy.get('body').type('{downarrow}')
      cy.wait(50)
      
      // Verify element has moved
      cy.get('.svg-content svg rect').first().then($movedRect => {
        const movedTransform = $movedRect.attr('transform')
        expect(movedTransform).to.not.equal(initialTransform)
        
        // Undo all three moves
        cy.contains('button', 'Undo').click()
        cy.wait(50)
        cy.contains('button', 'Undo').click()
        cy.wait(50)
        cy.contains('button', 'Undo').click()
        cy.wait(50)
        
        // Should be back to original
        cy.get('.svg-content svg rect').first().then($undoneRect => {
          const undoneTransform = $undoneRect.attr('transform') || null
          
          if (initialTransform === null) {
            expect(undoneTransform).to.be.null
          } else {
            expect(undoneTransform).to.equal(initialTransform)
          }
        })
      })
    })
  })

  it('should use Ctrl+Z keyboard shortcut for undo after drag', () => {
    // Select and move an element
    cy.get('.svg-content svg rect').first().then($rect => {
      const initialTransform = $rect.attr('transform') || null
      
      cy.get('.svg-content svg rect').first().click()
      cy.get('.selection-overlay')
        .trigger('mousedown', { button: 0, clientX: 100, clientY: 100 })
        .trigger('mousemove', { clientX: 200, clientY: 200 })
        .trigger('mouseup', { force: true })
      
      cy.wait(100)
      
      // Use Ctrl+Z to undo
      cy.get('body').type('{ctrl}z')
      cy.wait(100)
      
      // Should be back to original
      cy.get('.svg-content svg rect').first().then($undoneRect => {
        const undoneTransform = $undoneRect.attr('transform') || null
        
        if (initialTransform === null) {
          expect(undoneTransform).to.be.null
        } else {
          expect(undoneTransform).to.equal(initialTransform)
        }
      })
    })
  })
})

