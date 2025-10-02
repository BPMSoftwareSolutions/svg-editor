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
    }
  }
}

Cypress.Commands.add('uploadSVG', (fileName: string) => {
  cy.fixture(fileName).then((fileContent) => {
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'image/svg+xml',
    })
  })
})

export {}

