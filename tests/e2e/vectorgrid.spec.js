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

test('fires one mouseover while applying hover style to a feature', async ({ page }) => {
	await page.goto('/?hover=true&strict=true');
	const feature = page.locator('.leaflet-interactive').first();
	await expect(feature).toBeVisible();
	const bounds = await feature.boundingBox();
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

	await expect.poll(() => page.evaluate(() => window.fixtureMouseovers)).toBe(1);
	await expect(page.locator('.leaflet-tooltip')).toHaveText('Browser test polygon');
	await page.waitForTimeout(100);
	await expect.poll(() => page.evaluate(() => window.fixtureMouseovers)).toBe(1);
	await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await expect(page.locator('.leaflet-popup-content'))
		.toContainText('Browser test polygon');
	await expect(page.getByTestId('selected-feature'))
		.toHaveText('Selected: Browser test polygon');
});

test('drags the map over a non-interactive vector grid', async ({ page }) => {
	await page.goto('/?interactive=false');
	await expect(page.getByTestId('map-center')).toHaveText('0.00,0.00');

	const map = page.locator('.leaflet-container');
	const bounds = await map.boundingBox();
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(bounds.x + bounds.width / 2 - 150, bounds.y + bounds.height / 2, { steps: 10 });
	await page.mouse.up();

	await expect.poll(() => page.evaluate(() => {
		const center = window.fixtureMap?.getCenter();
		return center ? `${center.lat.toFixed(2)},${center.lng.toFixed(2)}` : 'unknown';
	})).not.toBe('0.00,0.00');
});
