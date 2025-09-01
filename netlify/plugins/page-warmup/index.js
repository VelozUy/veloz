// Netlify Build Plugin: Page Warmup
// Runs after deploy success to prime CDN/browser caches for key pages

const { spawn } = require('child_process');

module.exports = {
  name: 'page-warmup',
  onSuccess: async ({ utils }) => {
    try {
      if (process.env.ENABLE_PAGE_WARMUP !== 'true') {
        console.log('Page warmup skipped (ENABLE_PAGE_WARMUP != true).');
        return;
      }

      const baseUrl = process.env.DEPLOY_URL || process.env.URL;
      if (!baseUrl) {
        console.log('Page warmup skipped: DEPLOY_URL/URL not set.');
        return;
      }

      console.log(`Starting page warmup for ${baseUrl} ...`);

      await new Promise((resolve, reject) => {
        const child = spawn(
          process.execPath,
          ['scripts/warmup-pages.js', baseUrl],
          { stdio: 'inherit' }
        );
        child.on('close', code => {
          if (code === 0) return resolve();
          reject(new Error(`Warmup script exited with code ${code}`));
        });
      });

      console.log('Page warmup finished successfully.');
    } catch (err) {
      console.warn('Page warmup failed:', err.message);
      // Do not fail the build/deploy on warmup issues
      utils.status.show({ title: 'Page warmup failed', summary: err.message });
    }
  },
};
