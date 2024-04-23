// tests/feedback_form.spec.ts
import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.describe('FeedbackForm Component', () => {
  const isReportIssueEnabled = !!process.env.VITE_ENABLE_REPORT_ISSUE;
  test.skip(!isReportIssueEnabled, 'Skipping tests if report issues are disabled');
  test.skip(({ isMobile }) => isMobile, 'report issue test only supported on desktop');
  test.beforeEach(async ({ page }) => {
    const roomUrl = `${baseURL}room/test`;
    await page.goto(`${roomUrl}?bypass=true`);
  });

  test('renders the form fields correctly', async ({ page }) => {
    await page.waitForSelector('.publisher', { state: 'visible' });
    // check for the report issue button
    const reportIssueButton = await page.getByTestId('report-issue-button');
    await expect(reportIssueButton).toBeVisible();

    await reportIssueButton.click();
    // Check for the title input field
    const titleInput = await page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();

    // Check for the name input field
    const nameInput = await page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Check for the issue textarea field
    const issueTextarea = await page.locator('textarea[name="issue"]');
    await expect(issueTextarea).toBeVisible();

    // Check for the submit button
    const submitButton = await page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('shows validation error messages when fields are empty', async ({ page }) => {
    const reportIssueButton = await page.getByTestId('report-issue-button');
    await expect(reportIssueButton).toBeVisible();
    await reportIssueButton.click();
    // Attempt to submit the form with empty fields
    await page.locator('button[type="submit"]').click();

    // Check for error messages
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Your name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});
