import { Page, Locator, expect } from '@playwright/test';

/**
 * Home / Landing page of Shady Meadows B&B
 * https://automationintesting.online
 */
export class HomePage {
  readonly page: Page;

  // Navigation
  readonly adminLink: Locator;
  readonly contactLink: Locator;
  readonly roomsLink: Locator;
  readonly bookingLink: Locator;

  // Hero / booking widget
  readonly bookNowButton: Locator;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly checkAvailabilityButton: Locator;

  // Rooms section
  readonly roomCards: Locator;
  readonly singleRoomBookLink: Locator;

  constructor(page: Page) {
    this.page = page;

    const nav = page.locator('#navbarNav');
    this.adminLink = nav.getByRole('link', { name: /^Admin$/i });
    this.contactLink = nav.getByRole('link', { name: /^Contact$/i });
    this.roomsLink = nav.getByRole('link', { name: /^Rooms$/i });
    this.bookingLink = nav.getByRole('link', { name: /^Booking$/i });

    this.bookNowButton = page.getByRole('link', { name: /Book Now/i }).first();
    // Date inputs in the availability card (no stable name/id)
    this.checkInInput = page.locator('.booking-card input').first();
    this.checkOutInput = page.locator('.booking-card input').nth(1);
    this.checkAvailabilityButton = page.getByRole('button', {
      name: /Check Availability/i,
    });

    this.roomCards = page.locator('.room-card');
    this.singleRoomBookLink = page
      .locator('.room-card')
      .filter({ hasText: /Single/i })
      .getByRole('link', { name: /Book now/i });
  }

  async goto() {
    await this.page.goto('/');
    await this.dismissWelcomeModalIfPresent();
  }

  /** The site sometimes shows a "Let me hack!" welcome modal */
  async dismissWelcomeModalIfPresent() {
    const modalBtn = this.page.getByRole('button', { name: /Let me hack/i });
    if (await modalBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await modalBtn.click();
    }
  }

  async openAdmin() {
    await this.adminLink.click();
  }

  async scrollToContact() {
    await this.contactLink.click();
  }

  async checkAvailability() {
    await this.checkAvailabilityButton.click();
  }

  async expectRoomsVisible() {
    await expect(this.roomCards.first()).toBeVisible({ timeout: 10_000 });
  }
}
