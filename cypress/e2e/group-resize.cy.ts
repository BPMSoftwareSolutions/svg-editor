/// <reference types="cypress" />

describe('Group Element Resizing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Basic Group Resize', () => {
    it('should resize a group element with no existing transform', () => {
      // Create an SVG with a group containing multiple elements
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><circle cx="50" cy="50" r="40" fill="red" /><rect x="100" y="10" width="80" height="80" fill="blue" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      // Wait for SVG to load and be fully rendered
      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Get initial transform (should be null or empty)
      cy.get('.svg-content #test-group').invoke('attr', 'transform').then((initialTransform) => {

        // Select the group programmatically by clicking on it in the tree panel
        cy.get('.tree-panel').should('be.visible')
        cy.get('.tree-node-content').contains('test-group').click()

        // Wait for selection to be processed
        cy.wait(500)

        // Verify selection overlay appears
        cy.get('.selection-overlay', { timeout: 5000 }).should('be.visible')

        // Verify resize handles appear
        cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

        // Get initial bounding box
        cy.get('.svg-content #test-group').then($el => {
          const initialRect = $el[0].getBoundingClientRect()
          const initialWidth = initialRect.width
          const initialHeight = initialRect.height

          // Simulate resize by dragging bottom-right handle
          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: initialRect.right + 50, clientY: initialRect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          // Wait for resize to complete
          cy.wait(500)

          // Verify the transform has changed
          cy.get('.svg-content #test-group').invoke('attr', 'transform').then((newTransform) => {
            expect(newTransform).to.not.equal(initialTransform || '')

            // Verify transform contains scale
            expect(newTransform).to.match(/scale\([^)]+\)/)
          })

          // Verify the bounding box has changed
          cy.get('.svg-content #test-group').then($el2 => {
            const newRect = $el2[0].getBoundingClientRect()
            expect(newRect.width).to.be.greaterThan(initialWidth)
            expect(newRect.height).to.be.greaterThan(initialHeight)
          })
        })
      })
    })

    it('should maintain child element proportions during resize', () => {
      // Create an SVG with a group containing multiple child elements
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><circle id="c1" cx="50" cy="50" r="30" fill="red" /><rect id="r1" x="100" y="100" width="50" height="50" fill="blue" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'multi.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('be.visible')
      cy.get('.tree-node-content').contains('test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // Get initial positions of child elements
      cy.get('.svg-content #c1').then($circle => {
        const initialCx = parseFloat($circle.attr('cx') || '0')
        const initialCy = parseFloat($circle.attr('cy') || '0')

        cy.get('.svg-content #r1').then($rect => {
          const initialX = parseFloat($rect.attr('x') || '0')
          const initialY = parseFloat($rect.attr('y') || '0')

          // Perform resize
          cy.get('.svg-content #test-group').then($el => {
            const rect = $el[0].getBoundingClientRect()

            cy.get('.resize-handle.bottom-right')
              .trigger('mousedown', { button: 0, force: true })
              .trigger('mousemove', { clientX: rect.right + 100, clientY: rect.bottom + 100, force: true })
              .trigger('mouseup', { force: true })

            cy.wait(500)

            // Verify proportions are maintained (child elements don't change, but group scale does)
            cy.get('.svg-content #c1').then($newCircle => {
              const newCx = parseFloat($newCircle.attr('cx') || '0')
              const newCy = parseFloat($newCircle.attr('cy') || '0')

              // Child element attributes should remain the same
              expect(newCx).to.equal(initialCx)
              expect(newCy).to.equal(initialCy)
            })

            cy.get('.svg-content #r1').then($newRect => {
              const newX = parseFloat($newRect.attr('x') || '0')
              const newY = parseFloat($newRect.attr('y') || '0')

              // Child element attributes should remain the same
              expect(newX).to.equal(initialX)
              expect(newY).to.equal(initialY)
            })

            // Verify the group has a scale transform
            cy.get('.svg-content #test-group').should('have.attr', 'transform').and('match', /scale\([^)]+\)/)
          })
        })
      })
    })
  })

  describe('Group Resize with Existing Transforms', () => {
    it('should compose scale with existing transforms', () => {
      // Create a group with an existing transform
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group" transform="translate(50, 50) scale(1.5)"><circle cx="50" cy="50" r="40" fill="green" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('exist')
      cy.get('.tree-node').contains('#test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // Get initial transform
      cy.get('.svg-content #test-group').then($group => {
        const initialTransform = $group.attr('transform') || ''

        // Verify it has translate and scale
        expect(initialTransform).to.match(/translate\([^)]+\)/)
        expect(initialTransform).to.match(/scale\([^)]+\)/)

        // Parse initial scale value
        const scaleMatch = initialTransform.match(/scale\(([^,)]+)/)
        const initialScale = scaleMatch ? parseFloat(scaleMatch[1].trim()) : 1

        // Perform resize
        cy.get('.svg-content #test-group').then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 50, clientY: rect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(500)

          // Verify transform is composed correctly
          cy.get('.svg-content #test-group').then($resizedGroup => {
            const newTransform = $resizedGroup.attr('transform') || ''

            // Should still have translate
            expect(newTransform).to.match(/translate\([^)]+\)/)

            // Should have scale (composed)
            expect(newTransform).to.match(/scale\([^)]+\)/)

            // Parse new scale value
            const newScaleMatch = newTransform.match(/scale\(([^,)]+)/)
            const newScale = newScaleMatch ? parseFloat(newScaleMatch[1].trim()) : 1

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
      // Create a group with translate and rotate transforms
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group" transform="translate(100, 80) rotate(15)"><rect x="10" y="10" width="80" height="80" fill="purple" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('be.visible')
      cy.get('.tree-node-content').contains('test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // Get initial transform components
      cy.get('.svg-content #test-group').then($group => {
        const initialTransform = $group.attr('transform') || ''

        // Extract translate values
        const translateMatch = initialTransform.match(/translate\(([^)]+)\)/)
        const initialTranslate = translateMatch ? translateMatch[1] : '0, 0'

        // Extract rotate value
        const rotateMatch = initialTransform.match(/rotate\(([^)]+)\)/)
        const initialRotate = rotateMatch ? rotateMatch[1] : '0'

        // Perform resize
        cy.get('.svg-content #test-group').then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 30, clientY: rect.bottom + 30, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(500)

          // Verify translate and rotate are preserved
          cy.get('.svg-content #test-group').then($resizedGroup => {
            const newTransform = $resizedGroup.attr('transform') || ''

            const newTranslateMatch = newTransform.match(/translate\(([^)]+)\)/)
            const newTranslate = newTranslateMatch ? newTranslateMatch[1] : '0, 0'

            const newRotateMatch = newTransform.match(/rotate\(([^)]+)\)/)
            const newRotate = newRotateMatch ? newRotateMatch[1] : '0'

            // Translate and rotate should be the same
            expect(newTranslate).to.equal(initialTranslate)
            expect(newRotate).to.equal(initialRotate)

            // Should have scale added
            expect(newTransform).to.match(/scale\([^)]+\)/)
          })
        })
      })
    })
  })

  describe('Undo/Redo for Group Resize', () => {
    it('should undo group resize operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><circle cx="50" cy="50" r="40" fill="orange" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('be.visible')
      cy.get('.tree-node-content').contains('test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // Store initial transform
      cy.get('.svg-content #test-group').then($group => {
        const initialTransform = $group.attr('transform') || ''

        // Perform resize
        cy.get('.svg-content #test-group').then($el => {
          const rect = $el[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect.right + 50, clientY: rect.bottom + 50, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(500)

          // Verify transform changed
          cy.get('.svg-content #test-group').then($resized => {
            const resizedTransform = $resized.attr('transform') || ''
            expect(resizedTransform).to.not.equal(initialTransform)

            // Undo the resize
            cy.get('body').type('{ctrl}z')
            cy.wait(500)

            // Verify transform is restored
            cy.get('.svg-content #test-group').invoke('attr', 'transform').then((undoneTransform) => {
              expect(undoneTransform || '').to.equal(initialTransform)
            })
          })
        })
      })
    })

    it('should redo group resize operation', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><rect x="20" y="20" width="60" height="60" fill="cyan" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('be.visible')
      cy.get('.tree-node-content').contains('test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // Perform resize
      cy.get('.svg-content #test-group').then($el => {
        const rect = $el[0].getBoundingClientRect()

        cy.get('.resize-handle.bottom-right')
          .trigger('mousedown', { button: 0, force: true })
          .trigger('mousemove', { clientX: rect.right + 40, clientY: rect.bottom + 40, force: true })
          .trigger('mouseup', { force: true })

        cy.wait(500)

        // Store resized transform
        cy.get('.svg-content #test-group').then($resized => {
          const resizedTransform = $resized.attr('transform') || ''

          // Undo
          cy.get('body').type('{ctrl}z')
          cy.wait(500)

          // Redo
          cy.get('body').type('{ctrl}y')
          cy.wait(500)

          // Verify transform is back to resized state
          cy.get('.svg-content #test-group').invoke('attr', 'transform').then((redoneTransform) => {
            expect(redoneTransform || '').to.equal(resizedTransform)
          })
        })
      })
    })
  })

  describe('Multiple Resize Operations', () => {
    it('should handle multiple consecutive resize operations', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><g id="test-group"><circle cx="50" cy="50" r="40" fill="yellow" /></g></svg>'

      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svg),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml',
      }, { force: true })

      cy.get('.svg-content svg', { timeout: 5000 }).should('exist')
      cy.get('.svg-content #test-group', { timeout: 5000 }).should('exist').and('be.visible')

      // Wait for click handlers to be attached
      cy.wait(500)

      // Select the group via tree panel
      cy.get('.tree-panel').should('be.visible')
      cy.get('.tree-node-content').contains('test-group').click()
      cy.wait(500)

      // Verify resize handles appear
      cy.get('.resize-handle', { timeout: 5000 }).should('be.visible').and('have.length.at.least', 4)

      // First resize
      cy.get('.svg-content #test-group').then($el => {
        const rect1 = $el[0].getBoundingClientRect()

        cy.get('.resize-handle.bottom-right')
          .trigger('mousedown', { button: 0, force: true })
          .trigger('mousemove', { clientX: rect1.right + 30, clientY: rect1.bottom + 30, force: true })
          .trigger('mouseup', { force: true })

        cy.wait(500)

        // Second resize
        cy.get('.svg-content #test-group').then($el2 => {
          const rect2 = $el2[0].getBoundingClientRect()

          cy.get('.resize-handle.bottom-right')
            .trigger('mousedown', { button: 0, force: true })
            .trigger('mousemove', { clientX: rect2.right + 20, clientY: rect2.bottom + 20, force: true })
            .trigger('mouseup', { force: true })

          cy.wait(500)

          // Verify transform is properly composed (should have single scale)
          cy.get('.svg-content #test-group').then($final => {
            const finalTransform = $final.attr('transform') || ''

            // Should have only one scale transform
            const scaleCount = (finalTransform.match(/scale\(/g) || []).length
            expect(scaleCount).to.equal(1)

            // Should have scale value greater than 1
            const scaleMatch = finalTransform.match(/scale\(([^,)]+)/)
            if (scaleMatch) {
              const scaleValue = parseFloat(scaleMatch[1].trim())
              expect(scaleValue).to.be.greaterThan(1)
            }
          })
        })
      })
    })
  })
})

