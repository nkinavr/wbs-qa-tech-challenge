import { test, expect } from '../../src/api/fixtures/api.fixture';
import { DataFactory } from '../../src/utils/data.factory';
import { isBookingResponseShape } from '../../src/api/models/schemas';
import * as allure from 'allure-js-commons';

test.describe('Booking – Negative & Edge Cases', () => {
  test('creating a booking with missing required fields should be rejected', {
    annotation: { type: 'bug', description: 'BUG-008 – returns 500 instead of 400' },
  }, async ({ bookingClient }) => {
    await allure.epic('API');
    await allure.feature('Booking Validation');
    await allure.severity('high');
    await allure.tags('negative', 'validation');

    const incomplete = DataFactory.incompleteBooking();
    const response = await bookingClient.createRaw(incomplete);
    const body = await response.json().catch(() => ({}));

    // An incomplete booking must never be accepted.
    // Currently returns 500 instead of 400 – see BUG-008.
    expect(response.ok(), `Expected rejection, got ${response.status()}`).toBe(false);
    expect(isBookingResponseShape(body)).toBe(false);
  });

  test('updating a booking without authentication should be rejected', async ({
    bookingClient,
  }) => {
    await allure.epic('API');
    await allure.feature('Booking AuthZ');
    await allure.severity('critical');
    await allure.tags('negative', 'auth');

    const created = await bookingClient.create(DataFactory.validBooking());
    const response = await bookingClient.updateRaw(
      created.bookingid,
      DataFactory.validBooking({ firstname: 'Hacker' })
      // no auth cookie
    );

    expect([401, 403]).toContain(response.status());
  });

  test('deleting a booking without authentication should be rejected', async ({
    bookingClient,
  }) => {
    await allure.epic('API');
    await allure.feature('Booking AuthZ');
    await allure.severity('critical');
    await allure.tags('negative', 'auth');

    const created = await bookingClient.create(DataFactory.validBooking());
    const response = await bookingClient.delete(created.bookingid, '');

    expect([401, 403]).toContain(response.status());
  });

  test('getting a booking that does not exist should return 404', async ({
    bookingClient,
  }) => {
    await allure.epic('API');
    await allure.feature('Booking Read');
    await allure.severity('medium');
    await allure.tags('negative');

    const response = await bookingClient.getByIdRaw(99999999);
    expect(response.status()).toBe(404);
  });

  test('health check should confirm the API is up ping should succeed', async ({ bookingClient }) => {
    await allure.epic('API');
    await allure.feature('Health');
    await allure.severity('medium');
    await allure.tags('smoke');

    const response = await bookingClient.ping();
    // Observed: 201 Created (see BUGS.md BUG-003)
    expect(response.status()).toBe(201);
  });

  test('creating a booking with checkout date before checkin date should be rejected', {
    annotation: { type: 'bug', description: 'BUG-004 – API accepts checkout before checkin' },
  }, async ({ bookingClient }) => {
    // Known defect: the API currently returns 200. test.fail() keeps the suite green
    // while the bug exists, and turns red when it is fixed so this line can be removed.
    test.fail();

    await allure.epic('API');
    await allure.feature('Booking Validation');
    await allure.severity('medium');
    await allure.tags('negative', 'dates', 'known-bug');

    const invalid = DataFactory.invalidDateOrderBooking();
    const response = await bookingClient.createRaw(invalid);

    // Correct behaviour: a 4xx validation error
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});