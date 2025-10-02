describe('Undo/Redo System', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Load a test SVG file
    cy.fixture('test.svg').then((svgContent) => {
      // Create a file from the fixture
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const file = new File([blob], 'test.svg', { type: 'image/svg+xml' })
      
      // Trigger file upload
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(svgContent),
        fileName: 'test.svg',
        mimeType: 'image/svg+xml'
      }, { force: true })
    })
    
    // Wait for SVG to load
    cy.get('.svg-content svg').should('exist')
  })

  describe('Header Toolbar', () => {
    it('should display undo/redo buttons in header', () => {
      cy.get('.header-toolbar').should('exist')
      cy.contains('button', 'Undo').should('exist')
      cy.contains('button', 'Redo').should('exist')
    })

    it('should have undo/redo buttons disabled initially', () => {
      cy.contains('button', 'Undo').should('be.disabled')
      cy.contains('button', 'Redo').should('be.disabled')
    })

    it('should display delete button in header', () => {
      cy.contains('button', 'Delete').should('exist')
    })

    it('should display z-order dropdown in header', () => {
      cy.contains('button', 'Z-Order').should('exist')
    })

    it('should display save and clear buttons in header', () => {
      cy.contains('button', 'Save').should('exist')
      cy.contains('button', 'Clear').should('exist')
    })
  })

  describe('Delete and Undo', () => {
    it('should enable undo after deleting an element', () => {
      // Select an element
      cy.get('.svg-content svg rect').first().click()
      
      // Delete it using keyboard
      cy.get('body').type('{del}')
      
      // Undo button should be enabled
      cy.contains('button', 'Undo').should('not.be.disabled')
    })

    it('should restore deleted element on undo', () => {
      // Count initial elements
      cy.get('.svg-content svg rect').then($rects => {
        const initialCount = $rects.length
        
        // Select and delete first rect
        cy.get('.svg-content svg rect').first().click()
        cy.get('body').type('{del}')
        
        // Verify element is deleted
        cy.get('.svg-content svg rect').should('have.length', initialCount - 1)
        
        // Undo
        cy.contains('button', 'Undo').click()
        
        // Verify element is restored
        cy.get('.svg-content svg rect').should('have.length', initialCount)
      })
    })

    it('should enable redo after undo', () => {
      // Delete an element
      cy.get('.svg-content svg rect').first().click()
      cy.get('body').type('{del}')
      
      // Undo
      cy.contains('button', 'Undo').click()
      
      // Redo button should be enabled
      cy.contains('button', 'Redo').should('not.be.disabled')
    })

    it('should redo delete operation', () => {
      cy.get('.svg-content svg rect').then($rects => {
        const initialCount = $rects.length
        
        // Delete, undo, then redo
        cy.get('.svg-content svg rect').first().click()
        cy.get('body').type('{del}')
        cy.contains('button', 'Undo').click()
        cy.contains('button', 'Redo').click()
        
        // Element should be deleted again
        cy.get('.svg-content svg rect').should('have.length', initialCount - 1)
      })
    })
  })

  describe('Move and Undo', () => {
    it('should enable undo after moving an element', () => {
      // Select an element
      cy.get('.svg-content svg rect').first().click()
      
      // Move it with arrow keys
      cy.get('body').type('{rightarrow}{rightarrow}{downarrow}')
      
      // Undo button should be enabled
      cy.contains('button', 'Undo').should('not.be.disabled')
    })

    it('should restore element position on undo', () => {
      // Select an element and get its initial transform
      cy.get('.svg-content svg rect').first().then($rect => {
        const initialTransform = $rect.attr('transform') || ''

        // Select and move (single arrow key press = single command)
        cy.get('.svg-content svg rect').first().click()
        cy.get('body').type('{rightarrow}')

        // Wait for command to be processed
        cy.wait(100)

        // Verify transform changed
        cy.get('.svg-content svg rect').first().then($movedRect => {
          const movedTransform = $movedRect.attr('transform') || ''
          expect(movedTransform).to.not.equal(initialTransform)
          expect(movedTransform).to.include('translate')
        })

        // Undo (should restore to initial position)
        cy.contains('button', 'Undo').click()

        // Wait for undo to complete
        cy.wait(100)

        // Verify transform is restored to initial value
        cy.get('.svg-content svg rect').first().then($undoneRect => {
          const undoneTransform = $undoneRect.attr('transform') || ''
          expect(undoneTransform).to.equal(initialTransform)
        })
      })
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should undo with Ctrl+Z', () => {
      // Delete an element
      cy.get('.svg-content svg rect').first().click()
      cy.get('body').type('{del}')
      
      // Undo with Ctrl+Z
      cy.get('body').type('{ctrl}z')
      
      // Element should be restored
      cy.get('.svg-content svg rect').should('exist')
    })

    it('should redo with Ctrl+Y', () => {
      cy.get('.svg-content svg rect').then($rects => {
        const initialCount = $rects.length
        
        // Delete and undo
        cy.get('.svg-content svg rect').first().click()
        cy.get('body').type('{del}')
        cy.get('body').type('{ctrl}z')
        
        // Redo with Ctrl+Y
        cy.get('body').type('{ctrl}y')
        
        // Element should be deleted again
        cy.get('.svg-content svg rect').should('have.length', initialCount - 1)
      })
    })
  })

  describe('Z-Order and Undo', () => {
    it('should enable undo after changing z-order', () => {
      // Select an element
      cy.get('.svg-content svg rect').first().click()

      // Hover over the dropdown container to show menu
      cy.get('.dropdown').trigger('mouseenter')

      // Click on "Bring to Front" option
      cy.contains('.dropdown-item', 'Bring to Front').click({ force: true })

      // Wait for command to be processed
      cy.wait(100)

      // Undo button should be enabled
      cy.contains('button', 'Undo').should('not.be.disabled')
    })

    it('should restore z-order on undo', () => {
      // Get initial order
      cy.get('.svg-content svg').children().then($children => {
        const firstChildId = $children[0].id

        // Select first element and bring to front
        cy.get(`#${firstChildId}`).click()

        // Hover over the dropdown container to show menu
        cy.get('.dropdown').trigger('mouseenter')

        // Click on "Bring to Front" option
        cy.contains('.dropdown-item', 'Bring to Front').click({ force: true })

        // Wait for command to be processed
        cy.wait(100)

        // Verify it's now last
        cy.get('.svg-content svg').children().last().should('have.id', firstChildId)

        // Undo
        cy.contains('button', 'Undo').click()

        // Wait for undo to complete
        cy.wait(100)

        // Verify it's back to first
        cy.get('.svg-content svg').children().first().should('have.id', firstChildId)
      })
    })
  })

  describe('Multiple Operations', () => {
    it('should handle multiple undo operations', () => {
      // Perform multiple operations (test.svg has 2 rects, 2 circles, 1 ellipse)
      cy.get('.svg-content svg rect').first().click()
      cy.get('body').type('{rightarrow}')
      cy.wait(100)

      cy.get('.svg-content svg circle').first().click()
      cy.get('body').type('{downarrow}')
      cy.wait(100)

      cy.get('.svg-content svg rect').eq(1).click()
      cy.get('body').type('{del}')
      cy.wait(100)

      // Verify one rect was deleted (should have 1 rect left)
      cy.get('.svg-content svg rect').should('have.length', 1)

      // Undo all operations
      cy.contains('button', 'Undo').click()
      cy.wait(100)

      // Rect should be restored (back to 2 rects)
      cy.get('.svg-content svg rect').should('have.length', 2)

      cy.contains('button', 'Undo').click()
      cy.wait(100)

      cy.contains('button', 'Undo').click()
      cy.wait(100)

      // Undo button should be disabled
      cy.contains('button', 'Undo').should('be.disabled')
    })

    it('should clear redo history when new operation is performed', () => {
      // Delete and undo
      cy.get('.svg-content svg rect').first().click()
      cy.get('body').type('{del}')
      cy.contains('button', 'Undo').click()
      
      // Redo should be enabled
      cy.contains('button', 'Redo').should('not.be.disabled')
      
      // Perform new operation
      cy.get('.svg-content svg rect').eq(1).click()
      cy.get('body').type('{rightarrow}')
      
      // Redo should be disabled
      cy.contains('button', 'Redo').should('be.disabled')
    })
  })

  describe('Text Editing and Undo', () => {
    it.skip('should enable undo after editing text', () => {
      // Skip this test as test.svg doesn't contain text elements
      // TODO: Add a test SVG with text elements or create text element programmatically

      // Select a text element (if exists)
      cy.get('.svg-content svg text').first().then($text => {
        if ($text.length > 0) {
          // Click to select
          cy.wrap($text).click()

          // Edit text in inspector
          cy.get('.text-editor').clear().type('New text')
          cy.get('.text-editor').blur()

          // Undo button should be enabled
          cy.contains('button', 'Undo').should('not.be.disabled')
        }
      })
    })
  })
})

