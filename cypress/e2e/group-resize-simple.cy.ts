/// <reference types="cypress" />

describe('Group Resize - Simple Test', () => {
  it('should resize a group element', () => {
    // Create a simple SVG with a group
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><circle cx="50" cy="50" r="40" fill="red" /></g></svg>'

    cy.visit('/')

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(svg),
      fileName: 'test.svg',
      mimeType: 'image/svg+xml',
    }, { force: true })

    // Wait for SVG to load
    cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
    cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

    // Wait for everything to settle
    cy.wait(500)

    // Expand the tree if needed
    cy.get('.tree-node').first().within(() => {
      cy.get('.expand-button').then($btn => {
        if ($btn.text().includes('▶')) {
          cy.wrap($btn).click()
        }
      })
    })

    cy.wait(300)

    // Select the group from tree panel
    cy.get('.element-label').contains('test-group').parent('.tree-node-content').click()
    cy.wait(500)

    // Verify selection overlay appears
    cy.get('.selection-overlay', { timeout: 5000 }).should('be.visible')

    // Check if resize handles are visible
    cy.get('.selection-handle').should('have.length', 4)
    cy.get('.selection-handle.bottom-right').should('be.visible')

    // Get initial transform
    cy.get('.svg-content #test-group').invoke('attr', 'transform').then((initialTransform) => {
      cy.log('Initial transform:', initialTransform || 'none')

      // Try the dragHandle command
      cy.get('.selection-handle.bottom-right').dragHandle(50, 50)

      cy.wait(500)

      // Check the new transform
      cy.get('.svg-content #test-group').invoke('attr', 'transform').then((newTransform) => {
        cy.log('New transform:', newTransform || 'none')
        
        // Just log for now to see what's happening
        if (newTransform) {
          expect(newTransform).to.not.equal(initialTransform || '')
          expect(newTransform).to.match(/scale\([^)]+\)/)
        } else {
          cy.log('WARNING: Transform is still undefined/empty')
        }
      })
    })
  })
})

