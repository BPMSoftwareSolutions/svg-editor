import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Multi-Selection Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Upload test SVG
    const filePath = path.join(__dirname, 'fixtures', 'test.svg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    // Wait for SVG to load
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should select single element on click', async ({ page }) => {
    // Click on first rectangle
    const rect1 = page.locator('#rect1');
    await rect1.click();
    
    // Verify selection overlay is visible
    await expect(page.locator('.selection-overlay')).toBeVisible();
    
    // Verify element inspector shows element info
    await expect(page.locator('.element-inspector')).toContainText('rect');
  });

  test('should select multiple elements with Ctrl+Click', async ({ page }) => {
    // Click first element
    await page.locator('#rect1').click();
    
    // Ctrl+Click second element
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    
    // Verify selection count indicator shows 2
    await expect(page.locator('.selection-count')).toContainText('2');
    
    // Verify element inspector shows multi-selection info
    await expect(page.locator('.element-inspector')).toContainText('2 elements selected');
  });

  test('should toggle element selection with Ctrl+Click', async ({ page }) => {
    // Select first element
    await page.locator('#rect1').click();
    
    // Add second element
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    await expect(page.locator('.selection-count')).toContainText('2');
    
    // Toggle off first element
    await page.locator('#rect1').click({ modifiers: ['Control'] });
    await expect(page.locator('.selection-count')).toContainText('1');
  });

  test('should select all elements with Ctrl+A', async ({ page }) => {
    // Press Ctrl+A
    await page.keyboard.press('Control+a');
    
    // Verify all 5 elements are selected
    await expect(page.locator('.selection-count')).toContainText('5');
    await expect(page.locator('.element-inspector')).toContainText('5 elements selected');
  });

  test('should clear selection with Escape', async ({ page }) => {
    // Select multiple elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    await expect(page.locator('.selection-count')).toContainText('2');
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Verify selection is cleared
    await expect(page.locator('.selection-count')).not.toBeVisible();
  });

  test('should select elements with marquee drag', async ({ page }) => {
    // Get the SVG container
    const container = page.locator('.viewer-container');
    const box = await container.boundingBox();
    
    if (!box) throw new Error('Container not found');
    
    // Drag from top-left to bottom-right to select multiple elements
    await page.mouse.move(box.x + 40, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 250, { steps: 10 });
    
    // Verify marquee rectangle is visible during drag
    await expect(page.locator('.marquee-selection')).toBeVisible();
    
    await page.mouse.up();
    
    // Verify multiple elements are selected
    const selectionCount = page.locator('.selection-count');
    await expect(selectionCount).toBeVisible();
    const count = await selectionCount.textContent();
    expect(parseInt(count?.match(/\d+/)?.[0] || '0')).toBeGreaterThan(1);
  });

  test('should move multiple selected elements together', async ({ page }) => {
    // Select two elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    
    // Get initial positions
    const rect1 = page.locator('#rect1');
    const initialX = await rect1.getAttribute('x');
    
    // Press arrow key to move
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // Verify position changed
    const newX = await rect1.getAttribute('x');
    expect(parseInt(newX || '0')).toBeGreaterThan(parseInt(initialX || '0'));
  });

  test('should delete multiple selected elements', async ({ page }) => {
    // Select two elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    await expect(page.locator('.selection-count')).toContainText('2');
    
    // Press Delete key
    await page.keyboard.press('Delete');
    
    // Verify elements are removed
    await expect(page.locator('#rect1')).not.toBeVisible();
    await expect(page.locator('#circle1')).not.toBeVisible();
    
    // Verify selection is cleared
    await expect(page.locator('.selection-count')).not.toBeVisible();
  });

  test('should show multi-selection visual indicators', async ({ page }) => {
    // Select multiple elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    
    // Verify selection overlay shows multiple outlines
    const outlines = page.locator('.multi-selection-outline');
    await expect(outlines).toHaveCount(2);
    
    // Verify combined bounding box is visible
    await expect(page.locator('.selection-box')).toBeVisible();
  });

  test('should apply z-order operations to all selected elements', async ({ page }) => {
    // Select multiple elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    
    // Click "To Front" button in toolbar
    const toFrontButton = page.locator('button').filter({ hasText: 'To Front' });
    await toFrontButton.click();
    
    // Verify elements are still selected
    await expect(page.locator('.selection-count')).toContainText('2');
  });

  test('should show type breakdown in inspector for multi-selection', async ({ page }) => {
    // Select different types of elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    await page.locator('#ellipse1').click({ modifiers: ['Control'] });
    
    // Verify inspector shows type breakdown
    const inspector = page.locator('.element-inspector');
    await expect(inspector).toContainText('rect');
    await expect(inspector).toContainText('circle');
    await expect(inspector).toContainText('ellipse');
  });

  test('should highlight selected elements in tree panel', async ({ page }) => {
    // Select multiple elements
    await page.locator('#rect1').click();
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    
    // Verify tree panel highlights both elements
    const treePanel = page.locator('.tree-panel');
    const selectedNodes = treePanel.locator('.tree-node.selected');
    await expect(selectedNodes).toHaveCount(2);
  });

  test('should support Ctrl+Click in tree panel', async ({ page }) => {
    // Click first element in tree
    const treePanel = page.locator('.tree-panel');
    const firstNode = treePanel.locator('.tree-node').first();
    await firstNode.click();
    
    // Ctrl+Click second element in tree
    const secondNode = treePanel.locator('.tree-node').nth(1);
    await secondNode.click({ modifiers: ['Control'] });
    
    // Verify multiple elements are selected
    await expect(page.locator('.selection-count')).toContainText('2');
  });

  test('should support additive marquee selection with Ctrl+drag', async ({ page }) => {
    // Select one element first
    await page.locator('#rect1').click();
    await expect(page.locator('.selection-count')).toContainText('1');
    
    // Ctrl+drag to add more elements
    const container = page.locator('.viewer-container');
    const box = await container.boundingBox();
    
    if (!box) throw new Error('Container not found');
    
    await page.keyboard.down('Control');
    await page.mouse.move(box.x + 200, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 250, { steps: 10 });
    await page.mouse.up();
    await page.keyboard.up('Control');
    
    // Verify more elements are selected (original + new ones)
    const selectionCount = page.locator('.selection-count');
    const count = await selectionCount.textContent();
    expect(parseInt(count?.match(/\d+/)?.[0] || '0')).toBeGreaterThan(1);
  });

  test('should move selected elements with Shift+Arrow for larger steps', async ({ page }) => {
    // Select element
    await page.locator('#rect1').click();
    
    // Get initial position
    const rect1 = page.locator('#rect1');
    const initialX = await rect1.getAttribute('x');
    
    // Press Shift+Arrow to move 10px
    await page.keyboard.press('Shift+ArrowRight');
    
    // Verify position changed by 10px
    const newX = await rect1.getAttribute('x');
    expect(parseInt(newX || '0')).toBe(parseInt(initialX || '0') + 10);
  });

  test('should maintain selection when switching between single and multi-selection', async ({ page }) => {
    // Select one element
    await page.locator('#rect1').click();
    
    // Add another element
    await page.locator('#circle1').click({ modifiers: ['Control'] });
    await expect(page.locator('.selection-count')).toContainText('2');
    
    // Click on empty space (should clear selection)
    const container = page.locator('.viewer-container');
    const box = await container.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 10, box.y + 10);
    }
    
    // Verify selection is cleared
    await expect(page.locator('.selection-count')).not.toBeVisible();
  });
});

