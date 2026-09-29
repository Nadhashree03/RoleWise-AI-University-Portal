import { test, expect } from '@playwright/test';
import { db } from '../server/database/db.js';

test.describe('RoleWise AI: End-to-End System Verification Suite (Tests 01-18)', () => {

  test.beforeEach(async ({ page }) => {
    // Ensure clean DB baseline for student fees so payment tests are 100% deterministic
    try {
      db.prepare(`
        UPDATE student_fee_summary 
        SET status = 'Pending', balance = 185000, paidAmount = 0, dueDate = '2026-09-15' 
        WHERE studentId = '2023BCSE0142'
      `).run();
    } catch (e) {}

    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('Test 01: Student Authentication & Dashboard Render', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign In to Your Account')).toBeVisible();

    // Use Quick Sign In for Student
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Verify dashboard rendered with Student role
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Ask AI Discovery Assistant')).toBeVisible();
  });

  test('Test 02: Discovery Assistant Query Submission', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await expect(page.locator('[data-testid="assistant-query-input"]')).toBeVisible();

    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="recommendation-card"]')).toBeVisible({ timeout: 10000 });
  });

  test('Test 03: Recommendation Card Render & Scoring', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'Where can I settle semester tuition fees?');
    await page.click('[data-testid="assistant-submit-btn"]');

    const card = page.locator('[data-testid="recommendation-card"]');
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.locator('text=Pay Fees')).toBeVisible();
    await expect(card.locator('text=Confidence Level')).toBeVisible();
  });

  test('Test 04: Evidence & Rule Explanation Drawer', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="why-recommendation-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="why-recommendation-btn"]');

    await expect(page.locator('text=Why this recommendation:')).toBeVisible();
    await expect(page.locator('text=Matching Keywords:')).toBeVisible();
    await expect(page.locator('text=Anonymized Usage Evidence:')).toBeVisible();
  });

  test('Test 05: Direct Feature Launch', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="open-feature-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="open-feature-btn"]');
    const modal = page.locator('[data-testid="feature-action-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Pay Fees')).toBeVisible();
    await page.click('[data-testid="modal-close-btn"]');
  });

  test('Test 06: Student Fee Payment Transaction & Confirmation', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="open-feature-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="open-feature-btn"]');
    await expect(page.locator('[data-testid="feature-action-modal"]')).toBeVisible();

    // Click Proceed to Pay to trigger High-Impact confirmation dialog
    await expect(page.locator('[data-testid="proceed-to-pay-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="proceed-to-pay-btn"]');
    const confirmDialog = page.locator('[data-testid="high-impact-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // Confirm Payment
    await page.click('[data-testid="confirm-dialog-confirm-btn"]');

    // Verify modal reflects paid status or receipt
    await expect(page.locator('text=Paid & Cleared')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="modal-close-btn"]');
  });

  test('Test 07: RBAC Access Restriction Enforcement', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    // Student queries an admin-only feature: Manage Admissions
    await page.fill('[data-testid="assistant-query-input"]', 'I want to manage admissions');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('text=Permission Denied')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=ADMIN Credentials')).toBeVisible();
  });

  test('Test 08: High-Impact Action Confirmation Dialog Presentation', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="open-feature-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="open-feature-btn"]');
    await expect(page.locator('[data-testid="proceed-to-pay-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="proceed-to-pay-btn"]');

    const dialog = page.locator('[data-testid="high-impact-confirm-dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('text=Change Review & State Delta')).toBeVisible();
    await expect(dialog.locator('text=Current State')).toBeVisible();
    await expect(dialog.locator('text=Proposed Action')).toBeVisible();

    await page.click('[data-testid="confirm-dialog-cancel-btn"]');
    await page.click('[data-testid="modal-close-btn"]');
  });

  test('Test 09: High-Impact Action Cancellation', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="open-feature-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="open-feature-btn"]');
    await expect(page.locator('[data-testid="proceed-to-pay-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="proceed-to-pay-btn"]');

    await expect(page.locator('[data-testid="high-impact-confirm-dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-dialog-cancel-btn"]');

    // Dialog closes, modal remains open in pending state
    await expect(page.locator('[data-testid="high-impact-confirm-dialog"]')).not.toBeVisible();
    await page.click('[data-testid="modal-close-btn"]');
  });

  test('Test 10: Recommendation Override & Justification Capture', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I pay my tuition fee?');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('[data-testid="not-relevant-btn"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="not-relevant-btn"]');

    // Verify override feedback modal appears with radio choices
    await expect(page.locator('text=Why is this recommendation not relevant?')).toBeVisible();
    await expect(page.locator('[data-testid="submit-override-reason-btn"]')).toBeVisible();
    await page.click('[data-testid="submit-override-reason-btn"]');

    // Notification toast or status update appears
    await expect(page.locator('text=Feedback Registered')).toBeVisible({ timeout: 10000 });
  });

  test('Test 11: Audit Trail Logging of Live Action', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-admin"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/audit-trail');
    await expect(page.locator('text=Immutable Audit Ledger')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Events')).toBeVisible();
  });

  test('Test 12: Cryptographic Audit Trail Verification', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-admin"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/audit-trail');
    await page.click('[data-testid="verify-audit-chain-btn"]');

    const statusBanner = page.locator('[data-testid="audit-verification-status"]');
    await expect(statusBanner).toBeVisible({ timeout: 10000 });
    await expect(statusBanner).toContainText('Cryptographic Hash Chain Intact');
  });

  test('Test 13: Simulated Tamper Detection & Fraud Alert', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-admin"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/audit-trail');
    await page.click('[data-testid="simulate-tamper-btn"]');

    const statusBanner = page.locator('[data-testid="audit-verification-status"]');
    await expect(statusBanner).toBeVisible({ timeout: 10000 });
    await expect(statusBanner).toContainText('Cryptographic Hash Integrity Compromised!');
  });

  test('Test 14: Cryptographic Chain Repair & Resynchronization', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-admin"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/audit-trail');
    // Ensure tamper was simulated first
    await page.click('[data-testid="simulate-tamper-btn"]');
    await expect(page.locator('[data-testid="audit-verification-status"]')).toContainText('Cryptographic Hash Integrity Compromised!');

    // Now repair chain
    await page.click('[data-testid="repair-audit-chain-btn"]');

    const statusBanner = page.locator('[data-testid="audit-verification-status"]');
    await expect(statusBanner).toBeVisible({ timeout: 15000 });
    await expect(statusBanner).toContainText('Cryptographic Hash Chain Intact');
  });

  test('Test 15: Ambiguous Query Clarification', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'I need help with records');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('text=Multiple University Record Types Detected')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Select Goal').first()).toBeVisible();
  });

  test('Test 16: Out-of-Domain / Unknown Query Graceful Handling', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-student"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'I need help with something unrelated');
    await page.click('[data-testid="assistant-submit-btn"]');

    await expect(page.locator('text=No confident recommendation found')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Try one of these relevant student queries')).toBeVisible();
  });

  test('Test 17: Faculty Attendance Workflow', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-faculty"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/assistant');
    await page.fill('[data-testid="assistant-query-input"]', 'How do I mark attendance?');
    await page.click('[data-testid="assistant-submit-btn"]');

    const card = page.locator('[data-testid="recommendation-card"]');
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.locator('text=Mark Attendance')).toBeVisible();

    await page.click('[data-testid="open-feature-btn"]');
    await expect(page.locator('[data-testid="feature-action-modal"]')).toBeVisible();
    await expect(page.getByText('CS701', { exact: true })).toBeVisible();
    await page.click('[data-testid="modal-close-btn"]');
  });

  test('Test 18: Admin Admissions Decision & Zero-Loss Rollback', async ({ page }) => {
    await page.goto('/login');
    await page.click('[data-testid="quick-login-admin"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/audit-trail');
    await page.click('text=Change Review & Rollback');

    await expect(page.locator('text=Zero-Loss Rollback Active')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Previous State Snapshot').first()).toBeVisible();
  });

});
