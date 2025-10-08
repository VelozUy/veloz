# E2E Tests for Veloz

This directory contains end-to-end (E2E) tests for the Veloz website using Playwright with Chrome/Chromium.

## Overview

The test suite covers the following pages and functionality:

- **Home Page (/)** - UI, images, carousels, and navigation
- **About Page (/about)** - Content, philosophy section, FAQs, and images
- **Contact Page (/contact)** - Form functionality, validation, and submission
- **Our Work Page (/our-work)** - Gallery, portfolio items, and images

## Test Files

### `homepage.spec.ts`

Original homepage tests covering:

- Main content rendering
- Analytics consent banner
- Analytics tracking
- API endpoint security (Dropbox/Google Drive integration)

### `pages.spec.ts`

Comprehensive page tests covering:

#### Home Page Tests

- ✅ Page loads successfully with proper title
- ✅ Main content sections display correctly
- ✅ Images load in carousels
- ✅ Navigation elements work
- ✅ Responsive design (mobile, tablet, desktop)

#### About Page Tests

- ✅ Page loads successfully
- ✅ About content displays
- ✅ Philosophy section renders
- ✅ FAQ section is present
- ✅ Images load properly
- ✅ Responsive across devices

#### Contact Page Tests

- ✅ Page loads with proper title
- ✅ Contact form displays
- ✅ All required form fields are present (name, email, location, etc.)
- ✅ Form validation works (required fields, email format)
- ✅ Form can be filled and submitted
- ✅ Trust indicators display
- ✅ Responsive design

#### Our Work Page Tests

- ✅ Page loads successfully
- ✅ Gallery/portfolio content displays
- ✅ Portfolio images load
- ✅ Project/category items render
- ✅ Contact widget is present
- ✅ Lazy loading works for images
- ✅ Handles image errors gracefully
- ✅ Responsive design

#### Cross-Page Tests

- ✅ Navigation between pages works
- ✅ Consistent navigation across pages

#### Performance Tests

- ✅ Pages load within reasonable time (<10s)
- ✅ Images have proper performance attributes

#### Accessibility Tests

- ✅ Proper heading hierarchy on all pages
- ✅ Forms have proper labels
- ✅ Images have alt text

## Prerequisites

### 1. Install Playwright Browsers

Before running the tests for the first time, install Playwright browsers:

```bash
npx playwright install --with-deps chromium
```

Or to install all browsers (Chrome, Firefox, WebKit):

```bash
npx playwright install --with-deps
```

### 2. Build the Application

The tests expect the application to be built:

```bash
npm run build
```

## Running the Tests

### Run all E2E tests

```bash
npm run e2e
```

### Run tests in headed mode (see the browser)

```bash
npx playwright test --headed
```

### Run tests in UI mode (interactive)

```bash
npx playwright test --ui
```

### Run specific test file

```bash
npx playwright test tests/e2e/pages.spec.ts
```

### Run specific test by name

```bash
npx playwright test -g "should load the home page"
```

### Run tests in debug mode

```bash
npx playwright test --debug
```

### Run tests with trace

```bash
npx playwright test --trace on
```

## Configuration

The Playwright configuration is defined in `playwright.config.ts` at the root of the project:

- **Base URL**: `http://127.0.0.1:3000` (or `E2E_BASE_URL` env variable)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries in CI, 0 in local
- **Browser**: Chromium (Desktop Chrome configuration)
- **Web Server**: Automatically builds and starts the app if not running

## Test Structure

Each test follows this pattern:

```typescript
test.describe('Page Name', () => {
  test('should test something specific', async ({ page }) => {
    // 1. Navigate to page
    await page.goto('/path');

    // 2. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 3. Perform actions and assertions
    const element = page.locator('selector');
    await expect(element).toBeVisible();
  });
});
```

## Best Practices

1. **Wait for network idle**: Use `await page.waitForLoadState('networkidle')` before assertions
2. **Check element existence**: Use `if ((await element.count()) > 0)` before interacting with optional elements
3. **Responsive testing**: Test multiple viewport sizes (mobile, tablet, desktop)
4. **Error handling**: Tests gracefully handle missing or optional elements
5. **Performance**: Tests include performance checks (load time, image attributes)
6. **Accessibility**: Tests check for proper ARIA attributes, labels, and alt text

## Debugging Failed Tests

### 1. View Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### 2. Check Screenshots

Failed tests automatically capture screenshots in `test-results/`

### 3. View Traces

If traces are enabled, view them with:

```bash
npx playwright show-trace trace.zip
```

### 4. Run in Headed Mode

See what's happening in the browser:

```bash
npx playwright test --headed --workers=1
```

### 5. Use Inspector

Step through tests interactively:

```bash
npx playwright test --debug
```

## CI/CD Integration

The tests are configured to run in CI with:

- 2 retries on failure
- GitHub Actions reporter
- Automatic screenshot and video capture on failure
- Trace capture on first retry

Example GitHub Actions workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Build Application
  run: npm run build

- name: Run E2E Tests
  run: npm run e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Issues

### Issue: "Executable doesn't exist"

**Solution**: Run `npx playwright install`

### Issue: Tests timing out

**Solution**:

- Check if the dev server is running
- Increase timeout in `playwright.config.ts`
- Check network connectivity

### Issue: Element not found

**Solution**:

- Check if the element selector is correct
- Ensure the page has fully loaded
- Check if the element is in an iframe
- Verify viewport size (responsive design)

### Issue: Tests pass locally but fail in CI

**Solution**:

- Check environment variables
- Ensure build artifacts are present
- Verify browser versions match
- Check for timing issues (add explicit waits)

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add appropriate waits for dynamic content
4. Test for both success and error cases
5. Include responsive design tests
6. Add accessibility checks where applicable
7. Document any special setup requirements

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)
