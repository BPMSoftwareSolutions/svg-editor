import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Basic SVG Editor Functionality', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Verify main components are visible
    await expect(page.locator('.svg-viewer')).toBeVisible();
    await expect(page.locator('.file-uploader')).toBeVisible();
  });

  test('should upload SVG file', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Wait for SVG to load
    await expect(page.locator('svg')).toBeVisible();
    
    // Verify SVG elements are present
    await expect(page.locator('#rect1')).toBeVisible();
    await expect(page.locator('#circle1')).toBeVisible();
  });

  test('should show tree panel with SVG structure', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Verify tree panel is visible
    const treePanel = page.locator('.tree-panel');
    await expect(treePanel).toBeVisible();
    
    // Verify tree nodes are present
    const treeNodes = treePanel.locator('.tree-node');
    await expect(treeNodes).toHaveCount(5); // 5 elements in test.svg
  });

  test('should pan viewport with mouse drag', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Get container
    const container = page.locator('.viewer-container');
    const box = await container.boundingBox();
    
    if (!box) throw new Error('Container not found');
    
    // Drag to pan
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 5 });
    await page.mouse.up();
    
    // Verify viewport has panned (transform changed)
    const svgContent = page.locator('.svg-content');
    const transform = await svgContent.getAttribute('style');
    expect(transform).toContain('translate');
  });

  test('should zoom in and out', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Click zoom in button
    const zoomInButton = page.locator('.viewer-controls button').filter({ hasText: '+' });
    await zoomInButton.click();
    
    // Verify zoom level increased
    const zoomLevel = page.locator('.zoom-level');
    const zoomText = await zoomLevel.textContent();
    expect(parseInt(zoomText || '0')).toBeGreaterThan(100);
    
    // Click zoom out button
    const zoomOutButton = page.locator('.viewer-controls button').filter({ hasText: '-' });
    await zoomOutButton.click();
    await zoomOutButton.click();
    
    // Verify zoom level decreased
    const newZoomText = await zoomLevel.textContent();
    expect(parseInt(newZoomText || '0')).toBeLessThan(parseInt(zoomText || '0'));
  });

  test('should reset viewport', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Zoom in
    const zoomInButton = page.locator('.viewer-controls button').filter({ hasText: '+' });
    await zoomInButton.click();
    await zoomInButton.click();
    
    // Click reset button
    const resetButton = page.locator('.viewer-controls button').filter({ hasText: 'Reset' });
    await resetButton.click();
    
    // Verify zoom is back to 100%
    const zoomLevel = page.locator('.zoom-level');
    await expect(zoomLevel).toContainText('100%');
  });

  test('should select element from tree panel', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Click element in tree panel
    const treePanel = page.locator('.tree-panel');
    const firstNode = treePanel.locator('.tree-node').first();
    await firstNode.click();
    
    // Verify element is selected
    await expect(page.locator('.selection-overlay')).toBeVisible();
    await expect(firstNode).toHaveClass(/selected/);
  });

  test('should show element inspector when element is selected', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Select element
    await page.locator('#rect1').click();
    
    // Verify inspector shows element info
    const inspector = page.locator('.element-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('rect');
    await expect(inspector).toContainText('rect1');
  });

  test('should move element with arrow keys', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Select element
    await page.locator('#rect1').click();
    
    // Get initial position
    const rect1 = page.locator('#rect1');
    const initialX = await rect1.getAttribute('x');
    const initialY = await rect1.getAttribute('y');
    
    // Move with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    
    // Verify position changed
    const newX = await rect1.getAttribute('x');
    const newY = await rect1.getAttribute('y');
    expect(parseInt(newX || '0')).toBeGreaterThan(parseInt(initialX || '0'));
    expect(parseInt(newY || '0')).toBeGreaterThan(parseInt(initialY || '0'));
  });

  test('should delete element with Delete key', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Select element
    await page.locator('#rect1').click();
    
    // Press Delete key
    await page.keyboard.press('Delete');
    
    // Verify element is removed
    await expect(page.locator('#rect1')).not.toBeVisible();
  });

  test('should apply z-order operations', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Select element
    await page.locator('#rect1').click();
    
    // Click "To Front" button
    const toolbar = page.locator('.toolbar');
    const toFrontButton = toolbar.locator('button').filter({ hasText: 'To Front' });
    await toFrontButton.click();
    
    // Verify element is still selected (operation completed)
    await expect(page.locator('.selection-overlay')).toBeVisible();
  });

  test('should toggle tree panel visibility', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Find toggle button
    const treePanel = page.locator('.tree-panel');
    await expect(treePanel).toBeVisible();
    
    // Click toggle button to hide
    const toggleButton = page.locator('.tree-panel-toggle');
    await toggleButton.click();
    
    // Verify panel is collapsed
    await expect(treePanel).toHaveClass(/collapsed/);
  });

  test('should save SVG file', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click save button
    const saveButton = page.locator('button').filter({ hasText: /Save SVG/i });
    await saveButton.click();
    
    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.svg');
  });

  test('should handle keyboard shortcut Ctrl+S for save', async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await expect(page.locator('svg')).toBeVisible();
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Press Ctrl+S
    await page.keyboard.press('Control+s');
    
    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.svg');
  });
});

