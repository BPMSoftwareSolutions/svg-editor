/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Extend Cypress Chainable interface
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to upload an SVG file
       * @example cy.uploadSVG('test.svg')
       */
      uploadSVG(fileName: string): Chainable<void>
      /**
       * Custom command to drag a resize handle
       * @example cy.get('.selection-handle.bottom-right').dragHandle(50, 50)
       */
      dragHandle(deltaX: number, deltaY: number): Chainable<void>
    }
  }
}

Cypress.Commands.add('uploadSVG', (fileName: string) => {
  cy.fixture(fileName).then((fileContent) => {
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'image/svg+xml',
    }, { force: true }) // Force because input is hidden
  })
})

Cypress.Commands.add('dragHandle', { prevSubject: 'element' }, (subject, deltaX: number, deltaY: number) => {
  return cy.wrap(subject).then($handle => {
    const handle = $handle[0]
    const rect = handle.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2
    const endX = startX + deltaX
    const endY = startY + deltaY

    // Dispatch mousedown on the handle
    cy.wrap(handle).trigger('mousedown', {
      clientX: startX,
      clientY: startY,
      button: 0,
      force: true,
      bubbles: true,
    })

    // Wait for React to process the event
    cy.wait(100)

    // Dispatch mousemove on document
    cy.document().then(doc => {
      cy.wrap(doc).trigger('mousemove', {
        clientX: endX,
        clientY: endY,
        force: true,
        bubbles: true,
      })
    })

    // Wait for React to process the move
    cy.wait(100)

    // Dispatch mouseup on document
    cy.document().then(doc => {
      cy.wrap(doc).trigger('mouseup', {
        clientX: endX,
        clientY: endY,
        force: true,
        bubbles: true,
      })
    })
  })
})

export {}

