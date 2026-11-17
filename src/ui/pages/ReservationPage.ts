import { Page, Locator, expect } from '@playwright/test';

export interface GuestDetails {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

/**
 * Room reservation form
 * /reservation/{roomId}?checkin=...&checkout=...
 *
 * Note: the live site can be slow or occasionally fail to render;
 * tests should use generous timeouts and soft navigation.
 */
export class ReservationPage {
  readonly page: Page;
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly reserveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Common field patterns used by RBP
    this.firstnameInput = page
      .locator('#firstname, input[name="firstname"], input[placeholder*="irst" i]')
      .first();
    this.lastnameInput = page
      .locator('#lastname, input[name="lastname"], input[placeholder*="ast" i]')
      .first();
    this.emailInput = page
      .locator('#email, input[name="email"], input[type="email"]')
      .first();
    this.phoneInput = page
      .locator('#phone, input[name="phone"], input[type="tel"]')
      .first();
    this.reserveButton = page.getByRole('button', {
      name: /reserve|book|submit|confirm/i,
    });
  }

  async fillGuestDetails(details: GuestDetails) {
    await this.firstnameInput.fill(details.firstname);
    await this.lastnameInput.fill(details.lastname);
    await this.emailInput.fill(details.email);
    await this.phoneInput.fill(details.phone);
  }

  async submit() {
    await this.reserveButton.click();
  }

  async expectBookingConfirmed() {
    await expect(
      this.page.getByText(/booking confirmed|reservation successful|thank you|success/i).first()
    ).toBeVisible({ timeout: 15_000 });
  }
}