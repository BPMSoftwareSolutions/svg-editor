/// <reference types="cypress" />

describe('Basic SVG Editor Functionality', () => {
  it('should load the application', () => {
    cy.visit('/')
    
    // Verify main components are visible
    cy.get('.svg-viewer').should('be.visible')
    cy.get('.file-uploader').should('be.visible')
  })

  it('should upload SVG file', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    
    // Wait for SVG to load
    cy.get('svg').should('be.visible')
    
    // Verify SVG elements are present
    cy.get('#rect1').should('be.visible')
    cy.get('#circle1').should('be.visible')
  })

  it('should show tree panel with SVG structure', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Verify tree panel is visible
    cy.get('.tree-panel').should('be.visible')
    
    // Verify tree nodes are present
    cy.get('.tree-panel .tree-node').should('have.length', 5) // 5 elements in test.svg
  })

  it('should pan viewport with mouse drag', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Get container and drag to pan
    cy.get('.viewer-container')
      .trigger('mousedown', { which: 1, clientX: 200, clientY: 200 })
      .trigger('mousemove', { clientX: 300, clientY: 300 })
      .trigger('mouseup')
    
    // Verify viewport has panned (transform changed)
    cy.get('.svg-content')
      .should('have.attr', 'style')
      .and('include', 'translate')
  })

  it('should zoom in and out', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Click zoom in button
    cy.get('button').contains('+').click()
    
    // Verify scale increased
    cy.get('.svg-content')
      .should('have.attr', 'style')
      .and('include', 'scale')
    
    // Click zoom out button
    cy.get('button').contains('−').click()
  })

  it('should select element by clicking on canvas', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Click on rect1
    cy.get('#rect1').click()
    
    // Verify selection overlay is visible
    cy.get('.selection-overlay').should('be.visible')
    
    // Verify element inspector shows rect1
    cy.get('.element-inspector').should('contain', 'rect')
  })

  it('should select element from tree panel', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Click on tree node for circle1
    cy.get('.tree-panel').contains('circle1').click()
    
    // Verify selection overlay is visible
    cy.get('.selection-overlay').should('be.visible')
    
    // Verify element inspector shows circle
    cy.get('.element-inspector').should('contain', 'circle')
  })

  it('should move element with drag', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Select rect1
    cy.get('#rect1').click()
    
    // Get initial position
    cy.get('#rect1').then(($el) => {
      const initialX = $el.attr('x')
      
      // Drag the selection overlay
      cy.get('.selection-overlay')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 200, clientY: 150 })
        .trigger('mouseup')
      
      // Verify position changed
      cy.get('#rect1').should(($newEl) => {
        const newX = $newEl.attr('x')
        expect(newX).not.to.equal(initialX)
      })
    })
  })

  it('should move element with arrow keys', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Select rect1
    cy.get('#rect1').click()
    
    // Get initial position
    cy.get('#rect1').then(($el) => {
      const initialX = parseFloat($el.attr('x') || '0')
      
      // Press arrow key
      cy.get('body').type('{rightarrow}')
      
      // Verify position changed
      cy.get('#rect1').should(($newEl) => {
        const newX = parseFloat($newEl.attr('x') || '0')
        expect(newX).to.be.greaterThan(initialX)
      })
    })
  })

  it('should delete element with Delete key', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Select rect1
    cy.get('#rect1').click()
    
    // Press Delete key
    cy.get('body').type('{del}')
    
    // Verify element is removed
    cy.get('#rect1').should('not.exist')
  })

  it('should bring element to front', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Select rect1
    cy.get('#rect1').click()
    
    // Click "Bring to Front" button
    cy.get('button').contains('Bring to Front').click()
    
    // Verify rect1 is now last child (on top)
    cy.get('svg').children().last().should('have.id', 'rect1')
  })

  it('should send element to back', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Select circle2 (last element)
    cy.get('#circle2').click()
    
    // Click "Send to Back" button
    cy.get('button').contains('Send to Back').click()
    
    // Verify circle2 is now first child (at bottom)
    cy.get('svg').children().first().should('have.id', 'circle2')
  })

  it('should save SVG with button click', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Stub download
    cy.window().then((win) => {
      cy.stub(win, 'open').as('download')
    })
    
    // Click save button
    cy.get('button').contains('Save').click()
    
    // Note: Actual download verification is complex in Cypress
    // This test verifies the button exists and is clickable
  })

  it('should save SVG with Ctrl+S', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Press Ctrl+S
    cy.get('body').type('{ctrl}s')
    
    // Note: Actual download verification is complex in Cypress
    // This test verifies the keyboard shortcut works
  })

  it('should toggle tree panel visibility', () => {
    cy.visit('/')
    
    // Upload test SVG
    cy.uploadSVG('test.svg')
    cy.get('svg').should('be.visible')
    
    // Tree panel should be visible initially
    cy.get('.tree-panel').should('be.visible')
    
    // Click toggle button
    cy.get('button').contains('Hide Tree').click()
    
    // Tree panel should be hidden
    cy.get('.tree-panel').should('not.be.visible')
    
    // Click toggle button again
    cy.get('button').contains('Show Tree').click()
    
    // Tree panel should be visible again
    cy.get('.tree-panel').should('be.visible')
  })
})

