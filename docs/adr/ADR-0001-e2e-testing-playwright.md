# ADR-0001: E2E Testing with Playwright

## Status
Accepted

## Context
The SVG Editor application requires comprehensive end-to-end (E2E) testing to ensure that user workflows function correctly across the entire application stack. We need to choose an E2E testing framework that:

1. Provides reliable, fast test execution
2. Supports modern web technologies (React, TypeScript, Vite)
3. Offers good developer experience with debugging tools
4. Integrates well with CI/CD pipelines
5. Has strong community support and documentation

### Options Considered

#### 1. Playwright
**Pros:**
- Modern, actively maintained by Microsoft
- Fast and reliable test execution
- Built-in auto-waiting reduces flaky tests
- Excellent debugging tools (UI mode, trace viewer)
- Native TypeScript support
- Parallel test execution
- Cross-browser support (Chromium, Firefox, WebKit)
- Great CI/CD integration
- Powerful selectors and assertions

**Cons:**
- Relatively newer than Cypress (but mature enough)
- Smaller ecosystem compared to Selenium

#### 2. Cypress
**Pros:**
- Popular and well-established
- Good documentation and community
- Time-travel debugging
- Real-time reloading

**Cons:**
- Slower test execution
- Runs inside the browser (architectural limitation)
- More complex CI setup
- Limited cross-browser support in free tier
- Can be flaky with timing issues

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
We will use **Playwright** for E2E testing.

### Rationale

1. **Performance**: Playwright's architecture allows for faster test execution compared to Cypress and Selenium. Tests run in parallel by default.

2. **Reliability**: Built-in auto-waiting and smart assertions reduce flaky tests. Playwright waits for elements to be actionable before interacting with them.

3. **Developer Experience**: 
   - UI mode provides interactive test development
   - Trace viewer helps debug failures
   - TypeScript support out of the box
   - Clear, modern API

4. **CI/CD Integration**: 
   - Simple setup with GitHub Actions
   - Built-in reporters for CI environments
   - Automatic artifact generation (screenshots, traces)

5. **Future-Proof**: 
   - Actively maintained by Microsoft
   - Regular updates and improvements
   - Growing community adoption

6. **Project Fit**:
   - Works seamlessly with Vite dev server
   - TypeScript support matches our stack
   - Chromium-only testing sufficient for internal tool
   - Can easily add Firefox/WebKit if needed

## Implementation

### Test Structure
```
e2e/
├── fixtures/           # Test data (SVG files)
├── *.spec.ts          # Test files
playwright.config.ts   # Playwright configuration
```

### Configuration Highlights
- **Browser**: Chromium (can add more browsers later)
- **Base URL**: http://localhost:5173 (Vite dev server)
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 on CI (stability), unlimited locally (speed)
- **Reporter**: GitHub reporter on CI, HTML locally

### Test Coverage
- Basic functionality (file upload, pan/zoom, selection)
- Multi-selection features (Ctrl+Click, marquee selection)
- Keyboard shortcuts
- Element manipulation (move, delete, z-order)
- Tree panel interactions

### CI Integration
- Runs on every push and PR
- Parallel execution with unit tests and linting
- Uploads test reports and screenshots as artifacts
- Fails build if tests fail

## Consequences

### Positive
- **Confidence**: Comprehensive E2E tests catch integration issues
- **Documentation**: Tests serve as living documentation of user workflows
- **Regression Prevention**: Automated tests prevent breaking existing features
- **Fast Feedback**: Quick test execution provides rapid feedback
- **Debugging**: Excellent tools for investigating failures

### Negative
- **Maintenance**: E2E tests require maintenance as UI changes
- **Flakiness Risk**: Even with Playwright, some flakiness possible
- **CI Time**: E2E tests add time to CI pipeline (mitigated by parallelization)
- **Learning Curve**: Team needs to learn Playwright API

### Mitigation Strategies
1. **Flakiness**: Use Playwright's built-in waiting and retry mechanisms
2. **Maintenance**: Keep tests focused on user workflows, not implementation
3. **CI Time**: Run E2E tests in parallel with other jobs
4. **Learning**: Provide documentation and examples (TESTING.md)

## Alternatives Considered and Rejected

### Cypress
Rejected because:
- Slower test execution
- More complex CI setup
- Architectural limitations (runs in browser)
- Our team prefers Playwright's API

### Selenium
Rejected because:
- Older technology
- More verbose and complex
- Slower and more prone to flakiness
- Playwright provides better DX

### No E2E Testing
Rejected because:
- Manual testing is time-consuming and error-prone
- Risk of regressions increases without automated tests
- Multi-selection feature is complex and needs E2E coverage
- CI/CD pipeline incomplete without E2E tests

## Related Decisions
- Unit testing with Vitest (existing)
- CI/CD with GitHub Actions (implemented in this ADR)
- TypeScript for all code (existing)

## References
- [Playwright Documentation](https://playwright.dev/)
- [Playwright vs Cypress Comparison](https://playwright.dev/docs/why-playwright)
- [GitHub Actions Integration](https://playwright.dev/docs/ci-intro)
- Issue #17: Multi-Selection Feature (requires E2E testing)

## Notes
- Initial implementation uses Chromium only
- Can add Firefox and WebKit browsers if cross-browser testing needed
- Test suite includes 30 E2E tests covering all major features
- All tests passing in CI and locally

## Date
2025-10-02

## Author
Sidney Jones (with Augment AI assistance)

