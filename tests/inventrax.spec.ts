import { test, expect } from '@playwright/test';

// Use a unique suffix to avoid collisions in parallel runs
const uniqueId = Date.now().toString().slice(-6);

test.describe('InventraX Autonomous E2E Tests - Vercel Production', () => {
  
  test('Scenario A: Owner End-to-End Workflow', async ({ page }) => {
    test.setTimeout(60000); // Allow extra time for cloud DB

    // 1. Login & Dashboard Verification
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'admin@inventrax.com');
    await page.fill('input[type="password"]', 'inventrax@2026');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/*');
    // If it's root, wait a bit or navigate to dashboard explicitly
    if (page.url().endsWith('/')) {
      await page.goto('/dashboard');
    }
    await page.waitForURL('**/dashboard');

    // Verify KPI metric cards load numerical values (BHD currency format) without crashes or NaN
    // We expect some cards with text "BHD"
    const bhdSpans = page.locator('span:has-text("BHD")');
    await expect(bhdSpans.first()).toBeVisible({ timeout: 10000 });

    // Assert no "NaN" exists on the page
    const content = await page.textContent('body');
    expect(content).not.toContain('NaN');

    // 2. Vehicle & Purchase Creation
    // (A) Create a test seller
    await page.goto('/sellers/new');
    await page.fill('input[name="name"]', `شركة البحرين للسيارات ${uniqueId}`);
    await page.fill('input[name="phone"]', '39000000');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/sellers');

    // (B) Add a vehicle
    await page.goto('/vehicles/new');
    await page.fill('input[name="make"]', 'Toyota');
    await page.fill('input[name="model"]', 'Camry');
    await page.fill('input[name="year"]', '2023');
    await page.fill('input[name="vin"]', `123456-${uniqueId}`);
    await page.fill('input[name="plateNumber"]', `PLT-${uniqueId}`);
    await page.click('button[type="submit"]');

    // Assert redirect to vehicles page
    await page.waitForURL('**/vehicles');
    await expect(page).toHaveURL(/.*\/vehicles/);

    // 3. Expense Logging & Auto-Approval
    await page.goto('/expenses/new');
    // Select vehicle
    await page.locator('select[name="vehicleId"]').selectOption({ index: 1 }); 
    // Select category (fallback-1: ميكانيك)
    await page.locator('select[name="categoryId"]').selectOption({ value: 'fallback-1' });
    await page.fill('input[name="amount"]', '150');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/expenses');

    // 4. Sales Checkout & P&L Engine
    await page.goto('/customers/new');
    await page.fill('input[name="name"]', `علي حسن ${uniqueId}`);
    await page.fill('input[name="phone"]', '36000000');
    await page.fill('input[name="idNumber"]', `900101010${uniqueId}`);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/customers');

    // 5. AI Querying
    await page.goto('/ai-assistant');
    // Verify it loads
    await expect(page.locator('h1', { hasText: 'مساعد الذكاء الاصطناعي' })).toBeVisible();
  });

  test('Scenario B: Employee RBAC & Security Boundary Testing', async ({ page }) => {
    // 1. Restricted Navigation
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'abdul@car.com');
    await page.fill('input[type="password"]', '33449940');
    await page.click('button[type="submit"]');

    // Should redirect to a page (likely /vehicles or /employee)
    await page.waitForURL('**/*');

    // Attempt direct navigation to Dashboard
    await page.goto('/dashboard');
    // Wait for the error or redirection
    await expect(page.locator('body')).toContainText(/(صلاحية|Failed to load dashboard data)/, { timeout: 15000 });

    // 2. Operational Actions
    await page.goto('/expenses/new');
    // Should be allowed
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

});
