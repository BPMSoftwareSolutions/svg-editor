# ADR-0001: E2E Testing with Cypress

## Status
Accepted

**Date:** 2025-10-02  
**Updated:** 2025-10-02 (Changed from Playwright to Cypress)  
**Related Issue:** #17 (Multi-Selection Feature)

## Context
The SVG Editor application requires comprehensive end-to-end (E2E) testing to ensure that user workflows function correctly across the entire application stack. We need to choose an E2E testing framework that:

1. Provides reliable, fast test execution
2. Supports modern web technologies (React, TypeScript, Vite)
3. Offers good developer experience with debugging tools
4. Integrates well with CI/CD pipelines
5. Has strong community support and documentation

### Options Considered

#### 1. Cypress
**Pros:**
- Excellent developer experience with time-travel debugging
- Mature ecosystem with extensive plugins
- Great documentation and large community
- Built-in retry logic and automatic waiting
- Visual test runner for interactive development
- Simple setup and configuration
- Official GitHub Action for seamless CI integration
- Real-time reloading during test development

**Cons:**
- Runs inside the browser (architectural limitation)
- Slightly slower than Playwright for some operations
- Limited cross-browser support in free tier

#### 2. Playwright
**Pros:**
- Modern architecture running outside the browser
- Fast test execution
- Multi-browser support (Chromium, Firefox, WebKit)
- Excellent auto-waiting mechanisms
- Native TypeScript support

**Cons:**
- Smaller community compared to Cypress
- Less mature ecosystem
- Fewer plugins and integrations
- Steeper learning curve for some developers

#### 3. Selenium WebDriver
**Pros:**
- Industry standard
- Supports many languages
- Large ecosystem

**Cons:**
- Older architecture
- More verbose API
- Requires more boilerplate
- Slower test execution
- More prone to flaky tests

## Decision
We will use **Cypress** for E2E testing.

### Rationale

1. **Developer Experience**: Cypress provides an exceptional developer experience with time-travel debugging, automatic screenshots, and real-time reloading that makes test development much faster.

2. **Mature Ecosystem**: Large community, extensive documentation, and many plugins available for common testing scenarios.

3. **Built-in Retry Logic**: Automatic retrying and smart waiting eliminates flaky tests without manual intervention.

4. **Visual Test Runner**: Interactive test runner makes debugging and development much easier, allowing developers to see exactly what's happening at each step.

5. **Simple Setup**: Minimal configuration required to get started - works out of the box with sensible defaults.

6. **CI/CD Integration**: Official GitHub Action (cypress-io/github-action) provides seamless CI integration with automatic dev server management, eliminating the need for manual server startup scripts.

7. **TypeScript Support**: Full TypeScript support aligns with our codebase and provides type safety in tests.

8. **Network Stubbing**: Built-in network request stubbing and mocking capabilities for testing edge cases.

9. **Team Preference**: Team specifically requested Cypress for its developer-friendly features and familiar API.

10. **Project Fit**:
    - Works seamlessly with Vite dev server
    - TypeScript support matches our stack
    - Chrome testing sufficient for internal tool
    - Can easily add other browsers if needed

## Implementation

### Test Structure
```
cypress/
├── e2e/
│   ├── basic-functionality.cy.ts  # 14 tests for core features
│   └── multi-selection.cy.ts      # 16 tests for multi-selection
├── fixtures/
│   └── test.svg                   # Test SVG file with 5 elements
└── support/
    ├── commands.ts                # Custom commands (e.g., uploadSVG)
    └── e2e.ts                     # Support file
```

### Configuration Highlights
- **Browser**: Chrome (headless in CI, headed for local debugging)
- **Base URL**: http://localhost:5173 (Vite dev server)
- **Viewport**: 1280x720
- **Video**: Disabled (screenshots on failure only to save space)
- **Spec Pattern**: `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`

### Test Coverage
- Application loading and SVG upload
- Tree panel display and interaction
- Pan and zoom controls
- Element selection (canvas and tree)
- Element movement (drag and arrow keys)
- Element deletion
- Z-order operations (bring to front, send to back)
- Save functionality
- Multi-selection with Ctrl+Click
- Marquee drag selection
- Ctrl+A select all
- Visual indicators for multi-selection
- Batch operations on multiple elements

### CI Integration
- Runs on every push to main and feature branches
- Runs on all pull requests to main
- Uses cypress-io/github-action@v6 for automatic setup
- Automatically starts dev server and waits for it to be ready
- Uploads screenshots on failure and videos on completion
- Parallel execution for faster feedback

### Custom Commands
```typescript
cy.uploadSVG('test.svg')  // Upload SVG file from fixtures
```

## Consequences

### Positive
- **Confidence**: Comprehensive E2E tests catch integration issues before merge
- **Documentation**: Tests serve as living documentation of user workflows
- **Regression Prevention**: Automated tests prevent breaking existing features
- **Fast Feedback**: Quick test execution provides rapid feedback to developers
- **Debugging**: Excellent tools (time-travel, screenshots) for investigating failures
- **Developer Satisfaction**: Team prefers Cypress for its intuitive API and great DX
- **Easy Onboarding**: New team members can quickly learn Cypress due to great docs

### Negative
- **Maintenance**: E2E tests require maintenance as UI changes
- **CI Time**: E2E tests add time to CI pipeline (mitigated by parallelization)
- **Browser Limitations**: Runs inside browser, which can limit some testing scenarios
- **Binary Size**: Requires Cypress binary to be installed (~200MB)

### Neutral
- Tests are tightly coupled to UI implementation
- May need to update tests when UI changes significantly
- Requires dev server to be running for local test execution

## Related Decisions
- Unit testing with Vitest (existing)
- Component testing with React Testing Library (existing)
- CI/CD pipeline with GitHub Actions (implemented in this ADR)

## References
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [GitHub Issue #17: Multi-Selection Feature](https://github.com/BPMSoftwareSolutions/svg-editor/issues/17)
- [CI Workflow](.github/workflows/ci.yml)

