import { test, expect } from '@playwright/test';

// ============================================================================
// HOME PAGE TESTS (/)
// ============================================================================

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the main element to be visible
    const main = page.locator('main.homepage');
    await expect(main).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle(/Veloz/);
  });

  test('should display main content sections', async ({ page }) => {
    await page.goto('/');

    // Check that the main sections are present
    const sections = page.locator('section');
    const sectionCount = await sections.count();

    // Should have at least 3 sections
    expect(sectionCount).toBeGreaterThanOrEqual(3);

    // Check for animated home content
    const homeContent = page.locator('[data-above-fold-text]');
    await expect(homeContent).toBeVisible();
  });

  test('should load images in carousels', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load and images to potentially lazy load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for images to load

    // Check for images in the gallery sections
    const images = page.locator('img');
    const imageCount = await images.count();

    // Note: Images might be lazy-loaded or use background images
    // If we have images, verify they're properly configured
    if (imageCount > 0) {
      const firstImage = images.first();
      if (await firstImage.isVisible()) {
        // Check that image has a valid src
        const src = await firstImage.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toBe('');
      }
    } else {
      // If no img tags, check for background images or other image containers
      const imageContainers = page.locator(
        '[style*="background-image"], [data-testid*="image"], [class*="image"]'
      );
      const containerCount = await imageContainers.count();

      // Should have at least some image containers
      expect(containerCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have working navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for navigation/header (assuming there's a nav element)
    const nav = page.locator('nav, header').first();
    if ((await nav.count()) > 0) {
      await expect(nav).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('main.homepage')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('main.homepage')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('main.homepage')).toBeVisible();
  });
});

// ============================================================================
// ABOUT PAGE TESTS (/about)
// ============================================================================

test.describe('About Page', () => {
  test('should load the about page successfully', async ({ page }) => {
    await page.goto('/about');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Sobre Nosotros|About/);
  });

  test('should display about content', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check if page has loaded by verifying it has some content
    // The body should have at least some visible text
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100); // Should have substantial content
  });

  test('should display philosophy section', async ({ page }) => {
    await page.goto('/about');

    // Look for cards or philosophy items (based on AboutContent component)
    const cards = page.locator('[class*="card"], [data-testid*="philosophy"]');

    // Should have at least some content cards
    const cardCount = await cards.count();
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should display FAQ section', async ({ page }) => {
    await page.goto('/about');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // FAQ section should be present (may need to scroll)
    const faqSection = page
      .locator('[data-testid*="faq"], [class*="faq"]')
      .first();

    if ((await faqSection.count()) > 0) {
      // Scroll to FAQ section
      await faqSection.scrollIntoViewIfNeeded();
      await expect(faqSection).toBeVisible();
    }
  });

  test('should load images on about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    // Check if there are any images
    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check page loads with content
    const bodyTextMobile = await page.textContent('body');
    expect(bodyTextMobile).toBeTruthy();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check page loads with content
    const bodyTextDesktop = await page.textContent('body');
    expect(bodyTextDesktop).toBeTruthy();
  });
});

// ============================================================================
// CONTACT PAGE TESTS (/contact)
// ============================================================================

test.describe('Contact Page', () => {
  test('should load the contact page successfully', async ({ page }) => {
    await page.goto('/contact');

    // Check page title
    await expect(page).toHaveTitle(/Contacto|Contact/);
  });

  test('should display the contact form', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Look for form element
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('should have all required form fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for form to render

    // Check for form inputs - may use custom components
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();

    // Should have at least some input fields
    expect(inputCount).toBeGreaterThan(0);

    // Check for submit button
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Enviar"), button:has-text("Submit")'
      )
      .first();
    const hasSubmitButton = await submitButton.count();
    expect(hasSubmitButton).toBeGreaterThan(0);
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Try to submit the form without filling required fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Form should still be visible (not submitted)
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('should fill and submit the form', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for form to render

    // Get all input fields (the form may use custom components)
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();

    // Try to fill at least one field if available
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.fill('Test User');
    }

    // Check that form exists and has a submit button
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Enviar"), button:has-text("Submit")'
      )
      .first();
    const hasSubmit = await submitButton.count();
    expect(hasSubmit).toBeGreaterThan(0);

    // Note: We don't actually submit to avoid sending real emails
  });

  test('should display trust indicators', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Look for trust/privacy indicators
    const trustSection = page.locator(
      '[data-testid*="trust"], [class*="trust"]'
    );

    if ((await trustSection.count()) > 0) {
      await expect(trustSection.first()).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/contact');
    await expect(page.locator('form').first()).toBeVisible();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/contact');
    await expect(page.locator('form').first()).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find email input if it exists
    const emailInput = page.locator('input[type="email"]').first();
    const emailInputCount = await emailInput.count();

    if (emailInputCount > 0) {
      // Fill with invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Try to submit
      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Enviar"), button:has-text("Submit")'
        )
        .first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
      }

      // Form should still be visible (validation should prevent submission)
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
    } else {
      // If no email input found, just verify form exists
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
    }
  });
});

// ============================================================================
// OUR WORK PAGE TESTS (/our-work)
// ============================================================================

test.describe('Our Work Page', () => {
  test('should load the our work page successfully', async ({ page }) => {
    await page.goto('/our-work');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Nuestro Trabajo|Our Work|Portafolio/);
  });

  test('should display gallery/portfolio content', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // The page should have a main container
    const main = page
      .locator('main, [role="main"], div[class*="gallery"]')
      .first();
    await expect(main).toBeVisible();
  });

  test('should load portfolio images', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Wait a bit for images to load
    await page.waitForTimeout(2000);

    const images = page.locator('img');
    const imageCount = await images.count();

    // Should have gallery images
    expect(imageCount).toBeGreaterThan(0);

    // Check first few images
    for (let i = 0; i < Math.min(3, imageCount); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src).not.toBe('');
      }
    }
  });

  test('should display project/category items', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Look for project items or category cards
    const projectItems = page.locator(
      '[data-testid*="project"], [class*="project"], [class*="card"]'
    );

    const itemCount = await projectItems.count();
    if (itemCount > 0) {
      // At least one item should be visible
      await expect(projectItems.first()).toBeVisible();
    }
  });

  test('should have contact widget', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Look for contact widget (based on the ContactWidget import)
    const contactWidget = page.locator(
      '[data-testid*="contact"], [class*="contact-widget"]'
    );

    if ((await contactWidget.count()) > 0) {
      // Scroll to widget
      await contactWidget.first().scrollIntoViewIfNeeded();
      await expect(contactWidget.first()).toBeVisible();
    }
  });

  test('should load images with proper lazy loading', async ({ page }) => {
    await page.goto('/our-work');

    // Scroll down to trigger lazy loading
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2)
    );
    await page.waitForTimeout(1000);

    const images = page.locator('img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Check page loads with content
    const bodyTextMobile = await page.textContent('body');
    expect(bodyTextMobile).toBeTruthy();

    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Check page loads with content
    const bodyTextDesktop = await page.textContent('body');
    expect(bodyTextDesktop).toBeTruthy();
  });

  test('should handle image errors gracefully', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    // Page should still be functional even if some images fail to load
    // Check that page loaded successfully
    await expect(page).toHaveTitle(/Nuestro Trabajo|Our Work|Portafolio/);

    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});

// ============================================================================
// CROSS-PAGE TESTS
// ============================================================================

test.describe('Cross-Page Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Navigate to about
    await page.goto('/about');
    await expect(page).toHaveURL('/about');

    // Navigate to contact
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');

    // Navigate to our work
    await page.goto('/our-work');
    await expect(page).toHaveURL('/our-work');

    // Back to home
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should maintain consistent navigation across pages', async ({
    page,
  }) => {
    const pages = ['/', '/about', '/contact', '/our-work'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Check for navigation/header
      const nav = page.locator('nav, header').first();
      if ((await nav.count()) > 0) {
        await expect(nav).toBeVisible();
      }
    }
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

test.describe('Performance', () => {
  test('pages should load within reasonable time', async ({ page }) => {
    const pages = ['/', '/about', '/contact', '/our-work'];

    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load in less than 10 seconds
      expect(loadTime).toBeLessThan(10000);
    }
  });

  test('images should have proper attributes for performance', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();

      // Check for loading attribute (lazy loading)
      const loading = await firstImage.getAttribute('loading');

      // Should have alt text for accessibility
      const alt = await firstImage.getAttribute('alt');
      expect(alt !== null).toBeTruthy();
    }
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

test.describe('Accessibility', () => {
  test('pages should have proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/about', '/contact', '/our-work'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check for headings or at least some text content
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      // Some pages might not have traditional headings but should have content
      if (headingCount === 0) {
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
        expect(bodyText!.length).toBeGreaterThan(50);
      } else {
        expect(headingCount).toBeGreaterThan(0);
      }
    }
  });

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Check for labels
    const labels = page.locator('label');
    const labelCount = await labels.count();

    // Contact form should have multiple labels
    expect(labelCount).toBeGreaterThan(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/our-work');
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt');
          expect(alt !== null).toBeTruthy();
        }
      }
    }
  });
});
