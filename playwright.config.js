const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.js',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		browserName: 'chromium',
		headless: true
	},
	webServer: {
		command: 'npm run test:e2e:build && node tests/e2e/server.js',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
