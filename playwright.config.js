const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  retries:  2 ,

  workers:  3 ,

  reporter: 'html',
});
