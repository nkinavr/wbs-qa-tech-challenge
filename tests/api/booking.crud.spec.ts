import { test, expect } from '../../src/api/fixtures/api.fixture';
import { DataFactory } from '../../src/utils/data.factory';
import { isBookingShape, isBookingResponseShape } from '../../src/api/models/schemas';
import * as allure from 'allure-js-commons';

test.describe('Booking – CRUD (Happy Path)', () => {
  test('should create, read, update and delete a booking', async ({
    bookingClient,
    authCookie,
  }) => {
    await allure.epic('API');
    await allure.feature('Booking CRUD');
    await allure.severity('critical');
    await allure.tags('smoke', 'crud');

    // ── CREATE ────────────────────────────────────────────────────────────
    const payload = DataFactory.validBooking({
      firstname: 'WBS',
      lastname: 'Challenge',
      totalprice: 150,
      depositpaid: true,
      additionalneeds: 'Breakfast',
    });

    const created = await bookingClient.create(payload);
    expect(isBookingResponseShape(created)).toBe(true);
    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking.firstname).toBe(payload.firstname);
    expect(created.booking.lastname).toBe(payload.lastname);
    expect(created.booking.totalprice).toBe(payload.totalprice);

    const bookingId = created.bookingid;

    // ── READ ──────────────────────────────────────────────────────────────
    const fetched = await bookingClient.getById(bookingId);
    expect(isBookingShape(fetched)).toBe(true);
    expect(fetched.firstname).toBe(payload.firstname);
    expect(fetched.lastname).toBe(payload.lastname);
    expect(fetched.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(fetched.bookingdates.checkout).toBe(payload.bookingdates.checkout);

    // ── FULL UPDATE (PUT) ─────────────────────────────────────────────────
    const updatedPayload = DataFactory.validBooking({
      firstname: 'Updated',
      lastname: 'Name',
      totalprice: 299,
      depositpaid: false,
      additionalneeds: 'Late checkout',
    });

    const updated = await bookingClient.update(
      bookingId,
      updatedPayload,
      authCookie
    );
    expect(isBookingShape(updated)).toBe(true);
    expect(updated.firstname).toBe('Updated');
    expect(updated.lastname).toBe('Name');
    expect(updated.totalprice).toBe(299);
    expect(updated.depositpaid).toBe(false);

    // ── PARTIAL UPDATE (PATCH) ────────────────────────────────────────────
    const partial = await bookingClient.partialUpdate(
      bookingId,
      { firstname: 'Patched', additionalneeds: 'Extra towels' },
      authCookie
    );
    expect(partial.firstname).toBe('Patched');
    expect(partial.lastname).toBe('Name'); // unchanged
    expect(partial.additionalneeds).toBe('Extra towels');

    // ── DELETE ────────────────────────────────────────────────────────────
    const deleteResponse = await bookingClient.delete(bookingId, authCookie);
    // Restful Booker returns 201 on successful delete
    expect(deleteResponse.status()).toBe(201);

    // Verify it is gone
    const afterDelete = await bookingClient.getByIdRaw(bookingId);
    expect(afterDelete.status()).toBe(404);
  });

  test('should retrieve booking IDs and support filtering', async ({
    bookingClient,
  }) => {
    await allure.epic('API');
    await allure.feature('Booking Search');
    await allure.severity('high');
    await allure.tags('search');

    const unique = DataFactory.validBooking({
      firstname: 'FilterTest',
      lastname: 'UniqueXYZ',
    });
    const created = await bookingClient.create(unique);

    const allIds = await bookingClient.getAllIds();
    expect(allIds.length).toBeGreaterThan(0);
    expect(allIds.some((b) => b.bookingid === created.bookingid)).toBe(true);

    const filtered = await bookingClient.getAllIds({
      firstname: 'FilterTest',
      lastname: 'UniqueXYZ',
    });
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered.some((b) => b.bookingid === created.bookingid)).toBe(true);
  });
});
