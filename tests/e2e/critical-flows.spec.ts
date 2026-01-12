import { test, expect } from '@playwright/test';

/**
 * Critical Path E2E Tests for Life World OS
 * 
 * Tests core user flows to ensure application stability
 */

test.describe('Home & Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Life World OS/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Life World OS');
    
    // Check Choose Your Mode button/section is visible
    await expect(page.getByText('Choose Your Mode')).toBeVisible();
  });

  test('should navigate to Choose Plane page', async ({ page }) => {
    await page.goto('/');
    await page.goto('/choose-plane');
    
    // Verify we're on the choose plane page
    await expect(page).toHaveURL(/choose-plane/);
    await expect(page.locator('h1')).toContainText('Life World OS');
    
    // Check for Available Now section
    await expect(page.getByRole('heading', { name: 'Available Now' })).toBeVisible();
    
    // Check Systems and Artifacts are visible
    await expect(page.getByRole('heading', { name: 'Systems', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Artifacts' })).toBeVisible();
  });

  test('should highlight current page in breadcrumb', async ({ page }) => {
    await page.goto('/choose-plane');
    
    // "Choose your mode" should be highlighted (blue background)
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    
    // The active breadcrumb should have blue background
    const activeCrumb = breadcrumb.locator('.bg-blue-600');
    await expect(activeCrumb).toContainText('Choose your mode');
    
    // Home should be a link (not highlighted)
    const homeLink = breadcrumb.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();
  });
});

test.describe('Systems View', () => {
  test('should navigate to Systems/Tiers page', async ({ page }) => {
    await page.goto('/tiers');
    
    // Check page loaded
    await expect(page).toHaveURL(/tiers/);
    await expect(page.getByRole('heading', { name: 'System Tiers', exact: true })).toBeVisible();
    
    // Check tier view tabs
    await expect(page.getByRole('button', { name: 'Tier View' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'List View' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'System Tree' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Artifacts' })).toBeVisible();
  });

  test('should display tier hierarchy', async ({ page }) => {
    await page.goto('/tiers');
    
    // Check all 5 tiers are visible
    await expect(page.getByRole('heading', { name: /Tier 0: Survival/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tier 1: Stability/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tier 2: Growth/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tier 3: Leverage/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tier 4: Expression/ })).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    await page.goto('/tiers');
    
    // Click List View
    await page.getByRole('button', { name: 'List View' }).click();
    // Check that we see system cards in list format
    await expect(page.getByRole('heading', { name: 'Finance' })).toBeVisible();
    
    // Click Artifacts
    await page.getByRole('button', { name: 'Artifacts' }).click();
    // Check artifacts view loaded
    await expect(page.getByText('Artifacts')).toBeVisible();
    await expect(page.getByText('Tools and concepts that support your systems')).toBeVisible();
    
    // Click System Tree
    await page.getByRole('button', { name: 'System Tree' }).click();
    // Check tree view loaded
    await expect(page.getByRole('heading', { name: 'Reality' })).toBeVisible();
  });
});

test.describe('System Tree & Reality Hierarchy', () => {
  test('should load System Tree with fallback data', async ({ page }) => {
    await page.goto('/systems/tree');
    
    // Check tree view is displayed
    await expect(page.getByRole('heading', { name: 'Reality' })).toBeVisible();
    
    // Check for fallback warning or real data
    const fallbackWarning = page.getByRole('heading', { name: 'Using Fallback Data' });
    const hasWarning = await fallbackWarning.isVisible().catch(() => false);
    
    if (hasWarning) {
      // Fallback mode - check fallback data is shown
      await expect(page.getByText('CONSTRAINTS OF REALITY')).toBeVisible();
    } else {
      // Real data mode - check expand/collapse buttons
      await expect(page.getByRole('button', { name: 'Expand All' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Collapse All' })).toBeVisible();
    }
  });

  test('should expand and collapse tree nodes', async ({ page }) => {
    await page.goto('/systems/tree');
    
    // Wait for tree to load
    await page.waitForSelector('text=CONSTRAINTS OF REALITY', { timeout: 10000 });
    
    // Find an expandable node
    const constraintsNode = page.getByText('CONSTRAINTS OF REALITY').first();
    await expect(constraintsNode).toBeVisible();
    
    // Click to expand (if collapsed)
    await constraintsNode.click();
    
    // Check if child nodes appear (Laws, Principles, or Frameworks)
    await expect(
      page.getByText('LAWS').or(page.getByText('PRINCIPLES')).or(page.getByText('FRAMEWORKS'))
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Artifacts View', () => {
  test('should load artifacts page', async ({ page }) => {
    await page.goto('/tiers');
    await page.getByRole('button', { name: 'Artifacts' }).click();
    
    // Check artifacts are displayed
    await expect(page.getByText('Artifacts')).toBeVisible();
    
    // Check category buttons
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resources' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stats' })).toBeVisible();
  });

  test('should filter artifacts by category', async ({ page }) => {
    await page.goto('/tiers');
    await page.getByRole('button', { name: 'Artifacts' }).click();
    
    // Click Resources category
    await page.getByRole('button', { name: 'Resources' }).click();
    
    // Check that Energy artifact is visible (it's a Resource)
    await expect(page.getByText('Energy')).toBeVisible();
    
    // Click Stats category
    await page.getByRole('button', { name: 'Stats' }).click();
    
    // Check that Capacity artifact is visible (it's a Stat)
    await expect(page.getByText('Capacity')).toBeVisible();
  });

  test('should search artifacts', async ({ page }) => {
    await page.goto('/tiers');
    await page.getByRole('button', { name: 'Artifacts' }).click();
    
    // Find and use the search input
    const searchInput = page.getByPlaceholder(/Search artifacts/);
    await searchInput.fill('energy');
    
    // Check Energy artifact is visible
    await expect(page.getByText('Energy')).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    
    // Check multiple artifacts are visible again
    await expect(page.getByText('Energy')).toBeVisible();
    await expect(page.getByText('Capacity')).toBeVisible();
  });
});

test.describe('Plane Labels Design', () => {
  test('should display styled plane labels', async ({ page }) => {
    await page.goto('/choose-plane');
    
    // Check Systems plane has "Operate" badge
    const systemsCard = page.locator('text=Systems').locator('..');
    await expect(systemsCard.getByText('Operate')).toBeVisible();
    
    // Check Artifacts plane has "Collect" badge  
    const artifactsCard = page.locator('text=Artifacts').locator('..');
    await expect(artifactsCard.getByText('Collect')).toBeVisible();
    
    // Check badges have proper styling (rounded, colored)
    const operateBadge = page.getByText('Operate').first();
    await expect(operateBadge).toHaveClass(/rounded-full/);
  });
});

test.describe('Backend Health', () => {
  test('should have healthy backend', async ({ request }) => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const response = await request.get(`${backendUrl}/api/health`);
    
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health.status).toBe('ok');
    expect(health.database.status).toBe('connected');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check page still loads
    await expect(page).toHaveTitle(/Life World OS/);
    await expect(page.locator('h1')).toContainText('Life World OS');
    
    // Navigation should still work
    await page.goto('/choose-plane');
    await expect(page.getByRole('heading', { name: 'Systems' })).toBeVisible();
  });
});

