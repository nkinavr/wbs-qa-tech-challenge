import { Page, Locator, expect } from '@playwright/test';

/**
 * Admin login + panel
 * https://automationintesting.online/admin
 */
export class AdminPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;
  readonly frontPageLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: /^Login$/i });
    this.logoutButton = page.getByRole('button', { name: /Logout/i }).or(
      page.getByRole('link', { name: /Logout/i })
    );
    this.frontPageLink = page.getByRole('link', { name: /Front Page/i });
    this.errorMessage = page.getByText(/invalid credentials/i);
  }

  async goto() {
    await this.page.goto('/admin');
  }

  async login(username = 'admin', password = 'password') {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Login state is checked by URL and the login form, NOT the Logout button:
   * Logout is visible even when logged out (see BUGS.md BUG-005).
   */
  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/admin\/.+/, { timeout: 10_000 });
    await expect(this.loginButton).toBeHidden();
  }

  async expectLoginRejected() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(/\/admin\/?$/);
  }

  async expectLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
