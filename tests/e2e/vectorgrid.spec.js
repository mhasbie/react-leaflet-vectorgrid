const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'VectorGrid fixture' })).toBeVisible();
});

test('renders a local vector feature with its configured style', async ({ page }) => {
	const feature = page.locator('.leaflet-interactive').first();
	await expect(feature).toBeVisible();
	await expect(feature).toHaveAttribute('fill', '#336699');
	await expect(feature).toHaveAttribute('fill-opacity', '0.6');
});

test('selects a feature when it is clicked', async ({ page }) => {
	const feature = page.locator('.leaflet-interactive').first();
	await expect(feature).toBeVisible();
	const bounds = await feature.boundingBox();
	await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

	await expect(page.getByTestId('selected-feature'))
		.toHaveText('Selected: Browser test polygon');
	await expect(page.locator('.leaflet-interactive').first()).toBeVisible();
});
