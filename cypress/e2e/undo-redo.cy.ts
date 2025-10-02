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
        
        // Select and move
        cy.get('.svg-content svg rect').first().click()
        cy.get('body').type('{rightarrow}{rightarrow}{rightarrow}')
        
        // Verify transform changed
        cy.get('.svg-content svg rect').first().should('not.have.attr', 'transform', initialTransform)
        
        // Undo
        cy.contains('button', 'Undo').click()
        
        // Verify transform is restored
        if (initialTransform) {
          cy.get('.svg-content svg rect').first().should('have.attr', 'transform', initialTransform)
        } else {
          cy.get('.svg-content svg rect').first().should('not.have.attr', 'transform')
        }
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
      
      // Open z-order dropdown and bring to front
      cy.contains('button', 'Z-Order').trigger('mouseover')
      cy.contains('Bring to Front').click()
      
      // Undo button should be enabled
      cy.contains('button', 'Undo').should('not.be.disabled')
    })

    it('should restore z-order on undo', () => {
      // Get initial order
      cy.get('.svg-content svg').children().then($children => {
        const firstChild = $children[0]
        
        // Select first element and bring to front
        cy.wrap(firstChild).click()
        cy.contains('button', 'Z-Order').trigger('mouseover')
        cy.contains('Bring to Front').click()
        
        // Verify it's now last
        cy.get('.svg-content svg').children().last().should('equal', firstChild)
        
        // Undo
        cy.contains('button', 'Undo').click()
        
        // Verify it's back to first
        cy.get('.svg-content svg').children().first().should('equal', firstChild)
      })
    })
  })

  describe('Multiple Operations', () => {
    it('should handle multiple undo operations', () => {
      // Perform multiple operations
      cy.get('.svg-content svg rect').first().click()
      cy.get('body').type('{rightarrow}')
      
      cy.get('.svg-content svg rect').eq(1).click()
      cy.get('body').type('{downarrow}')
      
      cy.get('.svg-content svg rect').eq(2).click()
      cy.get('body').type('{del}')
      
      // Undo all operations
      cy.contains('button', 'Undo').click()
      cy.contains('button', 'Undo').click()
      cy.contains('button', 'Undo').click()
      
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
    it('should enable undo after editing text', () => {
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

