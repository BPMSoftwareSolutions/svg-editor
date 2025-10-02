# Testing Guide

This document provides comprehensive information about testing in the SVG Editor project.

## Table of Contents

- [Overview](#overview)
- [Unit Testing](#unit-testing)
- [E2E Testing](#e2e-testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The SVG Editor uses a multi-layered testing approach:

1. **Unit Tests**: Test individual components and functions in isolation using Vitest
2. **E2E Tests**: Test complete user workflows using Playwright
3. **CI/CD**: Automated testing on every push and pull request

## Unit Testing

### Technology Stack

- **Vitest**: Fast unit test framework built on Vite
- **React Testing Library**: Component testing utilities
- **jsdom**: Browser environment simulation

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm test -- --coverage
```

### Unit Test Structure

Unit tests are located alongside the source files:

```
src/
├── components/
│   ├── FileUploader.tsx
│   └── FileUploader.test.tsx
├── contexts/
│   ├── SelectionContext.tsx
│   ├── SelectionContext.test.tsx
│   └── SelectionContext.multiselection.test.tsx
```

### Example Unit Test

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## E2E Testing

### Technology Stack

- **Playwright**: Modern E2E testing framework
- **Chromium**: Browser for running tests

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- multi-selection.spec.ts

# Run tests matching a pattern
npm run test:e2e -- --grep "should select"
```

### E2E Test Structure

E2E tests are located in the `e2e/` directory:

```
e2e/
├── fixtures/
│   └── test.svg              # Test SVG file
├── basic-functionality.spec.ts
└── multi-selection.spec.ts
```

### Test Coverage

#### Basic Functionality Tests (14 tests)
- Application loading
- SVG file upload
- Tree panel display
- Pan and zoom
- Element selection
- Element movement
- Element deletion
- Z-order operations
- Save functionality

#### Multi-Selection Tests (16 tests)
- Single element selection
- Ctrl+Click multi-selection
- Toggle selection
- Select all (Ctrl+A)
- Clear selection (Escape)
- Marquee drag selection
- Move multiple elements
- Delete multiple elements
- Visual indicators
- Z-order for multiple elements
- Type breakdown in inspector
- Tree panel highlighting
- Additive marquee selection
- Shift+Arrow movement

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('should select element on click', async ({ page }) => {
  await page.goto('/');
  
  // Upload SVG
  const filePath = path.join(__dirname, 'fixtures', 'test.svg');
  await page.locator('input[type="file"]').setInputFiles(filePath);
  
  // Click element
  await page.locator('#rect1').click();
  
  // Verify selection
  await expect(page.locator('.selection-overlay')).toBeVisible();
});
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline runs automatically on:
- Push to `main` branch
- Push to `feature/**`, `bugfix/**`, `hotfix/**` branches
- Pull requests to `main`

### CI Jobs

1. **Lint** (runs in parallel)
   - Checks code quality with ESLint
   - Fails on any linting errors

2. **Unit Tests** (runs in parallel)
   - Runs all Vitest unit tests
   - Uploads coverage reports

3. **E2E Tests** (runs in parallel)
   - Installs Playwright browsers
   - Runs all E2E tests in headless Chromium
   - Uploads test reports and screenshots

4. **Build** (runs after lint and unit tests)
   - Builds production bundle
   - Uploads build artifacts

5. **Test Summary** (runs after all jobs)
   - Aggregates results from all jobs
   - Fails if any job failed

### Viewing CI Results

1. Go to the [Actions tab](https://github.com/BPMSoftwareSolutions/svg-editor/actions)
2. Click on a workflow run
3. View job results and logs
4. Download artifacts (reports, coverage, build)

### CI Artifacts

All artifacts are retained for 30 days:

- **unit-test-coverage**: Code coverage reports
- **playwright-report**: HTML report with test results
- **playwright-results**: Screenshots and traces
- **dist**: Production build output

## Writing Tests

### Best Practices

#### Unit Tests

1. **Test behavior, not implementation**
   ```typescript
   // Good
   expect(screen.getByText('2 elements selected')).toBeInTheDocument();
   
   // Bad
   expect(component.state.selectedElements.length).toBe(2);
   ```

2. **Use descriptive test names**
   ```typescript
   // Good
   it('should show multi-selection info when multiple elements are selected', () => {});
   
   // Bad
   it('test multi-selection', () => {});
   ```

3. **Arrange-Act-Assert pattern**
   ```typescript
   it('should toggle element selection', () => {
     // Arrange
     const element = document.createElement('rect');
     
     // Act
     toggleElement(element);
     
     // Assert
     expect(isSelected(element)).toBe(true);
   });
   ```

#### E2E Tests

1. **Use page object pattern for complex interactions**
   ```typescript
   class SVGEditorPage {
     async uploadSVG(filePath: string) {
       await this.page.locator('input[type="file"]').setInputFiles(filePath);
       await expect(this.page.locator('svg')).toBeVisible();
     }
   }
   ```

2. **Wait for elements properly**
   ```typescript
   // Good
   await expect(page.locator('.selection-overlay')).toBeVisible();
   
   // Bad
   await page.waitForTimeout(1000);
   ```

3. **Use beforeEach for common setup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await uploadTestSVG(page);
   });
   ```

### Adding New Tests

#### Adding a Unit Test

1. Create a test file next to the source file: `MyComponent.test.tsx`
2. Import testing utilities and the component
3. Write test cases using `describe` and `it`
4. Run tests to verify

#### Adding an E2E Test

1. Create a test file in `e2e/`: `my-feature.spec.ts`
2. Import Playwright test utilities
3. Add `beforeEach` hook for common setup
4. Write test cases using `test` and `expect`
5. Run tests locally before committing

## Troubleshooting

### Unit Tests

**Problem**: Tests fail with "Cannot find module"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
```

**Problem**: Tests timeout
```typescript
// Solution: Increase timeout
it('slow test', async () => {
  // test code
}, { timeout: 10000 });
```

### E2E Tests

**Problem**: Browser not found
```bash
# Solution: Install Playwright browsers
npx playwright install --with-deps chromium
```

**Problem**: Tests fail in CI but pass locally
```typescript
// Solution: Add explicit waits
await expect(page.locator('.element')).toBeVisible();
// Instead of assuming element is immediately available
```

**Problem**: Need to debug failing test
```bash
# Run in debug mode
npm run test:e2e:debug

# Or run in headed mode to see browser
npm run test:e2e:headed
```

### CI/CD

**Problem**: CI fails but tests pass locally
- Check Node.js version matches CI (18.x)
- Ensure all dependencies are in package.json
- Check for environment-specific issues

**Problem**: E2E tests timeout in CI
- Increase timeout in playwright.config.ts
- Check if dev server starts properly
- Review CI logs for errors

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

