/// <reference types="cypress" />

describe('Group Element Resizing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Basic Group Resize', () => {
    it('should resize a group element with no existing transform', () => {
      // Create two simple SVG files
      const svg1 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>'
      const svg2 = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="10" y="10" width="80" height="80" fill="blue" /></svg>'

      // Upload multiple files to create groups
      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg1), fileName: 'circle.svg', mimeType: 'image/svg+xml' },
        { contents: Cypress.Buffer.from(svg2), fileName: 'rect.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      // Wait for assets to load
      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content [data-asset-id]').should('have.length', 2)

      // Get the first group element
      cy.get('.svg-content [data-asset-id]').first().then($group => {
        const initialTransform = $group.attr('transform')

        // Click to select the group (use force to bypass coverage check)
        cy.get('.svg-content [data-asset-id]').first().click({ force: true })

        // Verify selection overlay appears
        cy.get('.selection-overlay', { timeout: 2000 }).should('be.visible')
        cy.get('.resize-handle').should('have.length.at.least', 4)

        // Get initial bounding box
        cy.get('.svg-content [data-asset-id]').first().then($el => {
          const initialRect = $el[0].getBoundingClientRect()

          // Simulate resize by dragging bottom-right handle
          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: initialRect.right + 50, clientY: initialRect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          // Wait for resize to complete
          cy.wait(200)

          // Verify the transform has changed
          cy.get('.svg-content [data-asset-id]').first().then($resizedGroup => {
            const newTransform = $resizedGroup.attr('transform')
            expect(newTransform).to.not.equal(initialTransform)

            // Verify transform contains scale
            expect(newTransform).to.match(/scale\([^)]+\)/)
          })
        })
      })
    })

    it('should maintain child element proportions during resize', () => {
      // Create an SVG with multiple child elements
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle id="c1" cx="50" cy="50" r="30" fill="red" /><rect id="r1" x="100" y="100" width="50" height="50" fill="blue" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'multi.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content [data-asset-id]').should('have.length', 1)

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // Get initial positions of child elements
      cy.get('.svg-content #c1').then($circle => {
        const initialCx = parseFloat($circle.attr('cx') || '0')
        const initialCy = parseFloat($circle.attr('cy') || '0')

        cy.get('.svg-content #r1').then($rect => {
          const initialX = parseFloat($rect.attr('x') || '0')
          const initialY = parseFloat($rect.attr('y') || '0')

          // Perform resize
          cy.get('.svg-content [data-asset-id]').first().then($el => {
            const rect = $el[0].getBoundingClientRect()

            cy.get('.resize-handle.bottom-right')
              .trigger('mousedown', { button: 0, force: true })
              .trigger('mousemove', { clientX: rect.right + 100, clientY: rect.bottom + 100, force: true })
              .trigger('mouseup', { force: true })

            cy.wait(200)

            // Verify proportions are maintained (child elements don't change, but group scale does)
            cy.get('.svg-content #c1').then($newCircle => {
              const newCx = parseFloat($newCircle.attr('cx') || '0')
              const newCy = parseFloat($newCircle.attr('cy') || '0')

              // Child element attributes should remain the same
              expect(newCx).to.equal(initialCx)
              expect(newCy).to.equal(initialCy)
            })

            // Verify the group has a scale transform
            cy.get('.svg-content [data-asset-id]').first().should('have.attr', 'transform').and('match', /scale\([^)]+\)/)
          })
        })
      })
    })
  })

  describe('Group Resize with Existing Transforms', () => {
    it('should compose scale with existing transforms', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="green" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'test.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // Get initial transform
      cy.get('.svg-content [data-asset-id]').first().then($group => {
        const initialTransform = $group.attr('transform') || ''

        // Verify it has translate and scale
        expect(initialTransform).to.match(/translate\([^)]+\)/)
        expect(initialTransform).to.match(/scale\([^)]+\)/)

        // Parse initial scale value
        const scaleMatch = initialTransform.match(/scale\(([^)]+)\)/)
        const initialScale = scaleMatch ? parseFloat(scaleMatch[1].split(',')[0].trim()) : 1

        // Perform resize
        cy.get('.svg-content [data-asset-id]').first().then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 50, clientY: rect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(200)

          // Verify transform is composed correctly
          cy.get('.svg-content [data-asset-id]').first().then($resizedGroup => {
            const newTransform = $resizedGroup.attr('transform') || ''

            // Should still have translate
            expect(newTransform).to.match(/translate\([^)]+\)/)

            // Should have scale (composed)
            expect(newTransform).to.match(/scale\([^)]+\)/)

            // Parse new scale value
            const newScaleMatch = newTransform.match(/scale\(([^)]+)\)/)
            const newScale = newScaleMatch ? parseFloat(newScaleMatch[1].split(',')[0].trim()) : 1

            // New scale should be greater than initial scale
            expect(newScale).to.be.greaterThan(initialScale)

            // Should not have multiple scale transforms
            const scaleCount = (newTransform.match(/scale\(/g) || []).length
            expect(scaleCount).to.equal(1)
          })
        })
      })
    })

    it('should preserve position and rotation during resize', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="10" y="10" width="80" height="80" fill="purple" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'test.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // Get initial transform components
      cy.get('.svg-content [data-asset-id]').first().then($group => {
        const initialTransform = $group.attr('transform') || ''

        // Extract translate values
        const translateMatch = initialTransform.match(/translate\(([^)]+)\)/)
        const initialTranslate = translateMatch ? translateMatch[1] : '0, 0'

        // Perform resize
        cy.get('.svg-content [data-asset-id]').first().then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 30, clientY: rect.bottom + 30, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(200)

          // Verify translate is preserved
          cy.get('.svg-content [data-asset-id]').first().then($resizedGroup => {
            const newTransform = $resizedGroup.attr('transform') || ''
            const newTranslateMatch = newTransform.match(/translate\(([^)]+)\)/)
            const newTranslate = newTranslateMatch ? newTranslateMatch[1] : '0, 0'

            // Translate should be the same
            expect(newTranslate).to.equal(initialTranslate)
          })
        })
      })
    })
  })

  describe('Undo/Redo for Group Resize', () => {
    it('should undo group resize operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="orange" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'test.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // Store initial transform
      cy.get('.svg-content [data-asset-id]').first().then($group => {
        const initialTransform = $group.attr('transform')

        // Perform resize
        cy.get('.svg-content [data-asset-id]').first().then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 50, clientY: rect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(200)

          // Verify transform changed
          cy.get('.svg-content [data-asset-id]').first().then($resized => {
            const resizedTransform = $resized.attr('transform')
            expect(resizedTransform).to.not.equal(initialTransform)

            // Undo the resize
            cy.get('body').type('{ctrl}z')
            cy.wait(200)

            // Verify transform is restored
            cy.get('.svg-content [data-asset-id]').first().should('have.attr', 'transform', initialTransform)
          })
        })
      })
    })

    it('should redo group resize operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect x="20" y="20" width="60" height="60" fill="cyan" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'test.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // Perform resize
      cy.get('.svg-content [data-asset-id]').first().then($el => {
        const rect = $el[0].getBoundingClientRect()

        cy.get('.resize-handle.bottom-right')
          .trigger('mousedown', { button: 0, force: true })
          .trigger('mousemove', { clientX: rect.right + 40, clientY: rect.bottom + 40, force: true })
          .trigger('mouseup', { force: true })

        cy.wait(200)

        // Store resized transform
        cy.get('.svg-content [data-asset-id]').first().then($resized => {
          const resizedTransform = $resized.attr('transform')

          // Undo
          cy.get('body').type('{ctrl}z')
          cy.wait(200)

          // Redo
          cy.get('body').type('{ctrl}y')
          cy.wait(200)

          // Verify transform is back to resized state
          cy.get('.svg-content [data-asset-id]').first().should('have.attr', 'transform', resizedTransform)
        })
      })
    })
  })

  describe('Multiple Resize Operations', () => {
    it('should handle multiple consecutive resize operations', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="yellow" /></svg>'

      cy.get('input[type="file"]').selectFile([
        { contents: Cypress.Buffer.from(svg), fileName: 'test.svg', mimeType: 'image/svg+xml' },
      ], { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')

      // Select the group
      cy.get('.svg-content [data-asset-id]').first().click({ force: true })
      cy.wait(200)

      // First resize
      cy.get('.svg-content [data-asset-id]').first().then($el => {
        const rect1 = $el[0].getBoundingClientRect()

        cy.get('.resize-handle.bottom-right')
          .trigger('mousedown', { button: 0, force: true })
          .trigger('mousemove', { clientX: rect1.right + 30, clientY: rect1.bottom + 30, force: true })
          .trigger('mouseup', { force: true })

        cy.wait(200)

        // Second resize
        cy.get('.svg-content [data-asset-id]').first().then($el2 => {
          const rect2 = $el2[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect2.right + 20, clientY: rect2.bottom + 20, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(200)

          // Verify transform is properly composed (should have single scale)
          cy.get('.svg-content [data-asset-id]').first().then($final => {
            const finalTransform = $final.attr('transform') || ''

            // Should have only one scale transform
            const scaleCount = (finalTransform.match(/scale\(/g) || []).length
            expect(scaleCount).to.equal(1)

            // Should have scale value greater than 1
            const scaleMatch = finalTransform.match(/scale\(([^)]+)\)/)
            if (scaleMatch) {
              const scaleValue = parseFloat(scaleMatch[1].split(',')[0].trim())
              expect(scaleValue).to.be.greaterThan(1)
            }
          })
        })
      })
    })
  })
})

