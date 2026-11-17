import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/ui/pages/HomePage';
import { ReservationPage } from '../../src/ui/pages/ReservationPage';
import { faker } from '@faker-js/faker';
import * as allure from 'allure-js-commons';
import { DataFactory } from '../../src/utils/data.factory';

const RESERVATION_BUG =
  'BUG-007 – reservation page hangs on a 500 error. Remove this line once the page loads again.';

test.describe('UI – Guest Booking', () => {
  test('should load home page and show booking controls + rooms', async ({
    page,
  }) => {
    await allure.epic('UI');
    await allure.feature('Guest Booking');
    await allure.severity('critical');
    await allure.tags('smoke', 'guest');

    const home = new HomePage(page);
    await home.goto();

    // Hero content
    await expect(
      page.getByRole('heading', { name: /shady meadows|welcome/i }).first()
    ).toBeVisible();

    // Availability widget
    await expect(
      page.getByText(/check availability|book your stay/i).first()
    ).toBeVisible();

    // Rooms section is present
    await home.expectRoomsVisible();
    // Shared demo site: admins can add rooms, so don't assert an exact count
    expect(await home.roomCards.count()).toBeGreaterThanOrEqual(1);
  });

  test('should navigate to a room reservation page from Book now', async ({
    page,
  }) => {
    test.fixme(true, RESERVATION_BUG);

    await allure.epic('UI');
    await allure.feature('Guest Booking');
    await allure.severity('critical');
    await allure.tags('guest', 'booking');

    const home = new HomePage(page);
    await home.goto();

    // Click the first "Book now" on a room card
    const bookLink = page
      .locator('.room-card')
      .first()
      .getByRole('link', { name: /Book now/i });

    await expect(bookLink).toBeVisible();
    await bookLink.click();

    // Should land on a reservation URL
    await expect(page).toHaveURL(/\/reservation\/\d+/);

    // Reservation form fields should eventually appear
    // (site can be slow – give it time)
    const reservation = new ReservationPage(page);
    await expect(reservation.firstnameInput).toBeVisible({ timeout: 20_000 });
  });

  test('should complete a booking with valid guest details', async ({
    page,
  }) => {
    test.fixme(true, RESERVATION_BUG);

    await allure.epic('UI');
    await allure.feature('Guest Booking');
    await allure.severity('critical');
    await allure.tags('guest', 'happy-path');

    // Randomised future dates so runs never go stale or clash with earlier bookings
    const offset = 30 + Math.floor(Math.random() * 300);
    const { checkin, checkout } = DataFactory.bookingDates(offset, 2);
    await page.goto(
      `/reservation/1?checkin=${checkin}&checkout=${checkout}`
    );

    const reservation = new ReservationPage(page);

    // Wait for form (site can be slow or flaky)
    await expect(reservation.firstnameInput).toBeVisible({ timeout: 25_000 });

    const guest = {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      phone: '01234567890', // simple UK-style number the site accepts
    };

    await reservation.fillGuestDetails(guest);
    await reservation.submit();

    await expect(
      page.getByRole('heading', { name: /booking confirmed/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});
