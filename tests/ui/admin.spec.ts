import { test, expect } from '@playwright/test';
import { AdminPage } from '../../src/ui/pages/AdminPage';
import { HomePage } from '../../src/ui/pages/HomePage';
import * as allure from 'allure-js-commons';

test.describe('UI – Admin', () => {
  test('should login to admin panel with valid credentials', async ({
    page,
  }) => {
    await allure.epic('UI');
    await allure.feature('Admin');
    await allure.severity('high');
    await allure.tags('smoke', 'admin');

    const admin = new AdminPage(page);
    await admin.goto();
    await admin.expectLoginFormVisible();

    await admin.login('admin', 'password');
    await admin.expectLoggedIn();
  });

  test('should reject invalid credentials', {
    annotation: { type: 'bug', description: 'BUG-005 – Logout visible when not logged in' },
  }, async ({ page }) => {
    await allure.epic('UI');
    await allure.feature('Admin');
    await allure.severity('high');
    await allure.tags('negative', 'admin');

    const admin = new AdminPage(page);
    await admin.goto();
    await admin.login('admin', 'wrong-password');

    await admin.expectLoginRejected();
  });

  test('should reach admin from the front-page navigation', async ({
    page,
  }) => {
    await allure.epic('UI');
    await allure.feature('Admin');
    await allure.severity('medium');
    await allure.tags('navigation');

    const home = new HomePage(page);
    await home.goto();
    await home.openAdmin();

    await expect(page).toHaveURL(/\/admin/);
    const admin = new AdminPage(page);
    await admin.expectLoginFormVisible();
  });
});
