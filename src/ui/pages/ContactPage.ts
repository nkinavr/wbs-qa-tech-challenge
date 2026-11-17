import { Page, Locator, expect } from '@playwright/test';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * Contact section on the home page (#contact)
 */
export class ContactPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.subjectInput = page.locator('#subject');
    this.messageInput = page.locator('#description');
    this.submitButton = page.getByRole('button', { name: /^Submit$/i });
    this.errorAlert = page.locator('.alert-danger');
    this.successMessage = page.getByText(/thanks for getting in touch/i);
  }

  async fill(data: ContactFormData) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.subjectInput.fill(data.subject);
    await this.messageInput.fill(data.message);
  }

  async submit() {
    await this.submitButton.click();
  }

  async fillAndSubmit(data: ContactFormData) {
    await this.fill(data);
    await this.submit();
  }

  /** Success feedback the site shows after a valid submission */
  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Waits for the validation alert to APPEAR, then confirms no success message.
   * Asserting only "success not visible" would pass instantly and prove nothing.
   */
  async expectValidationErrors(expectedText?: RegExp) {
    await expect(this.errorAlert).toBeVisible({ timeout: 10_000 });
    if (expectedText) {
      await expect(this.errorAlert).toContainText(expectedText);
    }
    await expect(this.successMessage).toBeHidden();
  }
}