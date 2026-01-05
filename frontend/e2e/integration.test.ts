// Basic integration test to verify core functionality
import { test, expect, Page } from '@playwright/test';

test.describe('Chat-Dashboard Integration Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should create task in dashboard and see it in chat', async () => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');

    // Wait for page to load
    await page.waitForSelector('text=Dashboard');

    // Click add task button
    await page.click('button:has-text("Add New Task")');

    // Fill in task details
    await page.fill('input[placeholder="Enter task title"]', 'Test task from dashboard');
    await page.fill('textarea[placeholder="Enter task description"]', 'This is a test task created from dashboard');

    // Submit the task
    await page.click('button:has-text("Create Task")');

    // Wait for task to be created
    await page.waitForSelector('text=Test task from dashboard');

    // Navigate to chat
    await page.goto('/chat');

    // Wait for chat to load
    await page.waitForSelector('text=AI Task Assistant');

    // Verify the task appears in chat context (this would depend on how tasks are integrated)
    // This is a simplified test - actual implementation may vary
    await expect(page.locator('text=Test task from dashboard')).toBeVisible();
  });

  test('should verify WebSocket connection status', async () => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');

    // Wait for page to load
    await page.waitForSelector('text=Dashboard');

    // Check for WebSocket status indicator (this would be visible in the UI)
    const websocketIndicator = page.locator('[data-testid="websocket-status"]');
    await expect(websocketIndicator).toBeVisible();

    // Verify it shows connected status
    await expect(websocketIndicator).toContainText('Synced');
  });

  test('should verify minimized chat widget appears', async () => {
    // Navigate to dashboard
    await page.goto('/new-dashboard');

    // Wait for page to load
    await page.waitForTimeout(1000); // Allow for widget to initialize

    // Check for minimized chat widget in bottom-right corner
    const chatWidget = page.locator('div').filter({ has: page.locator('[aria-label="Open chat widget"]') });
    await expect(chatWidget).toBeVisible();
  });
});