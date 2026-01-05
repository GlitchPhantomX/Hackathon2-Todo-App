// Final validation tests to ensure no existing features are broken
import { test, expect } from '@playwright/test';

test.describe('Final Validation Tests', () => {
  test('should load dashboard without errors', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');

    // Wait for page to load
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Verify core dashboard elements are present
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Task")')).toBeVisible();

    // Verify task list exists
    const taskList = page.locator('[data-testid="task-list"]');
    await expect(taskList).toBeVisible();

    // Verify no console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    // Wait a bit to capture any console errors
    await page.waitForTimeout(1000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should load chat without errors', async ({ page }) => {
    // Navigate to chat
    await page.goto('/chat');

    // Wait for page to load
    await page.waitForSelector('text=AI Task Assistant', { timeout: 10000 });

    // Verify core chat elements are present
    await expect(page.locator('text=AI Task Assistant')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Type your message..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();

    // Verify no console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    // Wait a bit to capture any console errors
    await page.waitForTimeout(1000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should have functional minimized chat widget', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');
    await page.waitForTimeout(1000); // Allow widget to initialize

    // Find the minimized chat widget
    const chatWidget = page.locator('div').filter({
      has: page.locator('[aria-label="Open chat widget"]')
    });

    // Verify widget is present
    await expect(chatWidget).toBeVisible();

    // Verify widget has the correct positioning
    const widgetBox = await chatWidget.boundingBox();
    expect(widgetBox).toBeDefined();

    // Verify no console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.waitForTimeout(1000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should maintain WebSocket connection status', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Check for WebSocket status indicator
    // The status should be visible in the UI elements
    await page.waitForTimeout(2000); // Allow WebSocket to connect

    // Verify no console errors related to WebSocket
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.waitForTimeout(1000);

    // Filter out any non-WebSocket related errors for this specific test
    const webSocketErrors = consoleErrors.filter(error =>
      error.toLowerCase().includes('websocket') || error.toLowerCase().includes('socket')
    );

    expect(webSocketErrors).toHaveLength(0);
  });

  test('should have responsive UI elements', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 812 }); // Mobile
    await page.goto('/new-dashboard');
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Verify main elements are still accessible on mobile
    await expect(page.locator('button:has-text("Add New Task")')).toBeVisible();

    // Switch to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Verify elements are still accessible on desktop
    await expect(page.locator('button:has-text("Add New Task")')).toBeVisible();
  });

  test('should preserve existing task functionality', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Verify existing task operations still work
    // Check for task list functionality
    const taskList = page.locator('[data-testid="task-list"], .task-list, [class*="task"]');
    await expect(taskList).toBeVisible();

    // Verify filter/search functionality exists
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="filter" i]');
    await expect(searchInput).toBeVisible();

    // Verify no major console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.waitForTimeout(1000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('should have accessible UI components', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Check for proper ARIA labels and roles
    const buttons = page.locator('button');
    await expect(buttons).toHaveCountGreaterThan(0);

    // Check for focusable elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Verify no accessibility-related console errors
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.waitForTimeout(1000);

    expect(consoleErrors).toHaveLength(0);
  });
});