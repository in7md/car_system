# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventrax.spec.ts >> InventraX Autonomous E2E Tests - Vercel Production >> Scenario A: Owner End-to-End Workflow
- Location: tests\inventrax.spec.ts:8:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 60000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/vehicles" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - alert [ref=f2e2]
  - generic [ref=f2e3]:
    - generic [ref=f2e4]:
      - heading "I InventraX" [level=1] [ref=f2e6]:
        - generic [ref=f2e7]: I
        - text: InventraX
      - generic [ref=f2e9]:
        - generic [ref=f2e10]: القائمة الرئيسية
        - link "الرئيسية" [ref=f2e11] [cursor=pointer]:
          - /url: /dashboard
        - link "السيارات" [ref=f2e18] [cursor=pointer]:
          - /url: /vehicles
        - link "المصروفات" [ref=f2e25] [cursor=pointer]:
          - /url: /expenses
        - link "المساعد الذكي" [ref=f2e30] [cursor=pointer]:
          - /url: /ai-assistant
        - link "التقارير" [ref=f2e35] [cursor=pointer]:
          - /url: /reports
        - link "موافقات معلقة" [ref=f2e40] [cursor=pointer]:
          - /url: /expenses/pending
        - link "المشتريات" [ref=f2e45] [cursor=pointer]:
          - /url: /purchases
        - link "المبيعات" [ref=f2e49] [cursor=pointer]:
          - /url: /sales
        - link "الموردين" [ref=f2e54] [cursor=pointer]:
          - /url: /sellers
        - link "العملاء" [ref=f2e61] [cursor=pointer]:
          - /url: /customers
        - link "الإعدادات" [ref=f2e68] [cursor=pointer]:
          - /url: /settings/general
      - button "تسجيل الخروج" [ref=f2e74]
    - generic [ref=f2e79]:
      - banner [ref=f2e80]:
        - textbox "بحث (Ctrl+K)..." [ref=f2e86]
        - generic [ref=f2e87]:
          - button [ref=f2e88]
          - generic [ref=f2e95] [cursor=pointer]:
            - generic [ref=f2e96]: م
            - generic [ref=f2e97]:
              - generic [ref=f2e98]: مستخدم
              - generic [ref=f2e99]: OWNER
      - main [ref=f2e100]:
        - generic [ref=f2e101]:
          - generic [ref=f2e102]:
            - heading "إضافة سيارة جديدة" [level=1] [ref=f2e103]
            - link "العودة للقائمة" [ref=f2e104] [cursor=pointer]:
              - /url: /vehicles
          - generic [ref=f2e106]:
            - generic [ref=f2e107]:
              - generic [ref=f2e108]:
                - generic [ref=f2e109]: الماركة (Make) *
                - textbox [ref=f2e110]
              - generic [ref=f2e111]:
                - generic [ref=f2e112]: الموديل (Model) *
                - textbox [ref=f2e113]
              - generic [ref=f2e114]:
                - generic [ref=f2e115]: سنة الصنع (Year)
                - spinbutton [ref=f2e116]
              - generic [ref=f2e117]:
                - generic [ref=f2e118]: رقم اللوحة (Plate Number)
                - textbox [ref=f2e119]
              - generic [ref=f2e120]:
                - generic [ref=f2e121]: رقم الهيكل (VIN)
                - textbox [ref=f2e122]
              - generic [ref=f2e123]:
                - generic [ref=f2e124]: اللون (Color)
                - textbox [ref=f2e125]
              - generic [ref=f2e126]:
                - generic [ref=f2e127]: الممشى (Mileage)
                - spinbutton [ref=f2e128]
              - generic [ref=f2e129]:
                - generic [ref=f2e130]: الحالة (Status)
                - combobox [ref=f2e131]:
                  - option "جاهز (Available)" [selected]
                  - option "تحت الإصلاح (Maintenance)"
                  - option "مباع (Sold)"
            - generic [ref=f2e132]:
              - generic [ref=f2e133]: ملاحظات (Notes)
              - textbox [ref=f2e134]
            - button "إضافة السيارة" [ref=f2e135]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Use a unique suffix to avoid collisions in parallel runs
  4   | const uniqueId = Date.now().toString().slice(-6);
  5   | 
  6   | test.describe('InventraX Autonomous E2E Tests - Vercel Production', () => {
  7   |   
  8   |   test('Scenario A: Owner End-to-End Workflow', async ({ page }) => {
  9   |     test.setTimeout(60000); // Allow extra time for cloud DB
  10  | 
  11  |     // 1. Login & Dashboard Verification
  12  |     await page.goto('/auth/signin');
  13  |     await page.fill('input[type="email"]', 'admin@inventrax.com');
  14  |     await page.fill('input[type="password"]', 'inventrax@2026');
  15  |     await page.click('button[type="submit"]');
  16  | 
  17  |     // Wait for redirect
  18  |     await page.waitForURL('**/*');
  19  |     // If it's root, wait a bit or navigate to dashboard explicitly
  20  |     if (page.url().endsWith('/')) {
  21  |       await page.goto('/dashboard');
  22  |     }
  23  |     await page.waitForURL('**/dashboard');
  24  | 
  25  |     // Verify KPI metric cards load numerical values (BHD currency format) without crashes or NaN
  26  |     // We expect some cards with text "BHD"
  27  |     const bhdSpans = page.locator('span:has-text("BHD")');
  28  |     await expect(bhdSpans.first()).toBeVisible({ timeout: 10000 });
  29  | 
  30  |     // Assert no "NaN" exists on the page
  31  |     const content = await page.textContent('body');
  32  |     expect(content).not.toContain('NaN');
  33  | 
  34  |     // 2. Vehicle & Purchase Creation
  35  |     // (A) Create a test seller
  36  |     await page.goto('/sellers/new');
  37  |     await page.fill('input[name="name"]', `شركة البحرين للسيارات ${uniqueId}`);
  38  |     await page.fill('input[name="phone"]', '39000000');
  39  |     await page.click('button[type="submit"]');
  40  |     await page.waitForURL('**/sellers');
  41  | 
  42  |     // (B) Add a vehicle
  43  |     await page.goto('/vehicles/new');
  44  |     await page.fill('input[name="make"]', 'Toyota');
  45  |     await page.fill('input[name="model"]', 'Camry');
  46  |     await page.fill('input[name="year"]', '2023');
  47  |     await page.fill('input[name="vin"]', `123456-${uniqueId}`);
  48  |     await page.fill('input[name="plateNumber"]', `PLT-${uniqueId}`);
  49  |     await page.click('button[type="submit"]');
  50  | 
  51  |     // Assert redirect to vehicles page
> 52  |     await page.waitForURL('**/vehicles');
      |                ^ Error: page.waitForURL: Test timeout of 60000ms exceeded.
  53  |     await expect(page).toHaveURL(/.*\/vehicles/);
  54  | 
  55  |     // 3. Expense Logging & Auto-Approval
  56  |     await page.goto('/expenses/new');
  57  |     // Select vehicle
  58  |     await page.locator('select[name="vehicleId"]').selectOption({ index: 1 }); 
  59  |     // Select category (fallback-1: ميكانيك)
  60  |     await page.locator('select[name="categoryId"]').selectOption({ value: 'fallback-1' });
  61  |     await page.fill('input[name="amount"]', '150');
  62  |     await page.click('button[type="submit"]');
  63  | 
  64  |     await page.waitForURL('**/expenses');
  65  | 
  66  |     // 4. Sales Checkout & P&L Engine
  67  |     await page.goto('/customers/new');
  68  |     await page.fill('input[name="name"]', `علي حسن ${uniqueId}`);
  69  |     await page.fill('input[name="phone"]', '36000000');
  70  |     await page.fill('input[name="idNumber"]', `900101010${uniqueId}`);
  71  |     await page.click('button[type="submit"]');
  72  |     await page.waitForURL('**/customers');
  73  | 
  74  |     // 5. AI Querying
  75  |     await page.goto('/ai-assistant');
  76  |     // Verify it loads
  77  |     await expect(page.locator('h1', { hasText: 'مساعد الذكاء الاصطناعي' })).toBeVisible();
  78  |   });
  79  | 
  80  |   test('Scenario B: Employee RBAC & Security Boundary Testing', async ({ page }) => {
  81  |     // 1. Restricted Navigation
  82  |     await page.goto('/auth/signin');
  83  |     await page.fill('input[type="email"]', 'abdul@car.com');
  84  |     await page.fill('input[type="password"]', '33449940');
  85  |     await page.click('button[type="submit"]');
  86  | 
  87  |     // Should redirect to a page (likely /vehicles or /employee)
  88  |     await page.waitForURL('**/*');
  89  | 
  90  |     // Attempt direct navigation to Dashboard
  91  |     await page.goto('/dashboard');
  92  |     // Wait for the error or redirection
  93  |     await expect(page.locator('body')).toContainText(/(صلاحية|Failed to load dashboard data)/, { timeout: 15000 });
  94  | 
  95  |     // 2. Operational Actions
  96  |     await page.goto('/expenses/new');
  97  |     // Should be allowed
  98  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  99  |   });
  100 | 
  101 | });
  102 | 
```