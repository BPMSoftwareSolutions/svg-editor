describe('Copy/Paste Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Basic Copy/Paste', () => {
    it('should copy and paste a single element', () => {
      // Load a test SVG
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      // Wait for SVG to load
      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-rect').should('exist')

      // Select the rect
      cy.get('.svg-content #test-rect').click({ force: true })
      
      // Wait for selection
      cy.wait(300)

      // Copy with Ctrl+C
      cy.get('body').type('{ctrl}c')
      
      // Wait a bit
      cy.wait(300)

      // Paste with Ctrl+V
      cy.get('body').type('{ctrl}v')

      // Wait for paste
      cy.wait(500)

      // Should now have 2 rect elements
      cy.get('.svg-content rect').should('have.length', 2)

      // The pasted element should have a different ID
      cy.get('.svg-content rect').then($rects => {
        const ids = $rects.map((i, el) => el.id).get()
        expect(ids).to.have.length(2)
        expect(ids[0]).to.equal('test-rect')
        expect(ids[1]).to.not.equal('test-rect')
        expect(ids[1]).to.match(/^pasted-/)
      })
    })

    it('should copy and paste multiple elements', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="rect1" x="50" y="50" width="100" height="80" fill="red" /><circle id="circle1" cx="250" cy="90" r="40" fill="blue" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select all with Ctrl+A
      cy.get('body').type('{ctrl}a')
      cy.wait(300)

      // Copy
      cy.get('body').type('{ctrl}c')
      cy.wait(300)

      // Paste
      cy.get('body').type('{ctrl}v')
      cy.wait(500)

      // Should have 4 elements total (2 original + 2 pasted)
      cy.get('.svg-content rect').should('have.length', 2)
      cy.get('.svg-content circle').should('have.length', 2)
    })

    it('should apply position offset to pasted elements', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Get original position
      cy.get('.svg-content #test-rect').then($rect => {
        const originalX = parseFloat($rect.attr('x') || '0')
        const originalY = parseFloat($rect.attr('y') || '0')

        // Select, copy, paste
        cy.get('.svg-content #test-rect').click({ force: true })
        cy.wait(300)
        cy.get('body').type('{ctrl}c')
        cy.wait(300)
        cy.get('body').type('{ctrl}v')
        cy.wait(500)

        // Check pasted element has offset
        cy.get('.svg-content rect').eq(1).then($pastedRect => {
          const pastedX = parseFloat($pastedRect.attr('x') || '0')
          const pastedY = parseFloat($pastedRect.attr('y') || '0')

          expect(pastedX).to.be.greaterThan(originalX)
          expect(pastedY).to.be.greaterThan(originalY)
        })
      })
    })
  })

  describe('Undo/Redo for Copy/Paste', () => {
    it('should undo paste operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Copy and paste
      cy.get('.svg-content #test-rect').click({ force: true })
      cy.wait(300)
      cy.get('body').type('{ctrl}c')
      cy.wait(300)
      cy.get('body').type('{ctrl}v')
      cy.wait(500)

      // Should have 2 elements
      cy.get('.svg-content rect').should('have.length', 2)

      // Undo with Ctrl+Z
      cy.get('body').type('{ctrl}z')
      cy.wait(500)

      // Should be back to 1 element
      cy.get('.svg-content rect').should('have.length', 1)
    })

    it('should redo paste operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Copy, paste, undo
      cy.get('.svg-content #test-rect').click({ force: true })
      cy.wait(300)
      cy.get('body').type('{ctrl}c')
      cy.wait(300)
      cy.get('body').type('{ctrl}v')
      cy.wait(500)
      cy.get('body').type('{ctrl}z')
      cy.wait(500)

      // Should have 1 element
      cy.get('.svg-content rect').should('have.length', 1)

      // Redo with Ctrl+Shift+Z
      cy.get('body').type('{ctrl}{shift}z')
      cy.wait(500)

      // Should have 2 elements again
      cy.get('.svg-content rect').should('have.length', 2)
    })
  })

  describe('Multiple Paste Operations', () => {
    it('should apply incremental offset for multiple pastes', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Copy once
      cy.get('.svg-content #test-rect').click({ force: true })
      cy.wait(300)
      cy.get('body').type('{ctrl}c')
      cy.wait(300)

      // Paste 3 times
      cy.get('body').type('{ctrl}v')
      cy.wait(500)
      cy.get('body').type('{ctrl}v')
      cy.wait(500)
      cy.get('body').type('{ctrl}v')
      cy.wait(500)

      // Should have 4 elements total
      cy.get('.svg-content rect').should('have.length', 4)

      // Each pasted element should have increasing offset
      cy.get('.svg-content rect').then($rects => {
        const positions = $rects.map((i, el) => ({
          x: parseFloat(el.getAttribute('x') || '0'),
          y: parseFloat(el.getAttribute('y') || '0'),
        })).get()

        expect(positions[1].x).to.be.greaterThan(positions[0].x)
        expect(positions[2].x).to.be.greaterThan(positions[1].x)
        expect(positions[3].x).to.be.greaterThan(positions[2].x)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should not paste when clipboard is empty', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Try to paste without copying
      cy.get('body').type('{ctrl}v')
      cy.wait(500)

      // Should still have only 1 element
      cy.get('.svg-content rect').should('have.length', 1)
    })

    it('should not copy when nothing is selected', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect id="test-rect" x="50" y="50" width="100" height="80" fill="red" /></svg>'
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Try to copy without selecting
      cy.get('body').type('{ctrl}c')
      cy.wait(300)
      cy.get('body').type('{ctrl}v')
      cy.wait(500)

      // Should still have only 1 element
      cy.get('.svg-content rect').should('have.length', 1)
    })
  })
})

