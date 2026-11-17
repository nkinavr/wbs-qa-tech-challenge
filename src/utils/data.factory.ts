import { faker } from '@faker-js/faker';
import { Booking, BookingDates } from '../api/models/Booking';

/**
 * Generates realistic test data for bookings.
 * Keeps data deterministic enough for assertions while remaining unique.
 */
export class DataFactory {
  static futureDate(daysFromNow = 7): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  static bookingDates(checkinOffset = 7, stayNights = 3): BookingDates {
    const checkin = this.futureDate(checkinOffset);
    const checkout = this.futureDate(checkinOffset + stayNights);
    return { checkin, checkout };
  }

  static validBooking(overrides: Partial<Booking> = {}): Booking {
    return {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      totalprice: faker.number.int({ min: 50, max: 500 }),
      depositpaid: faker.datatype.boolean(),
      bookingdates: this.bookingDates(),
      additionalneeds: faker.helpers.arrayElement([
        'Breakfast',
        'Late checkout',
        'Extra pillows',
        'Airport transfer',
        undefined,
      ]),
      ...overrides,
    };
  }

  /** Booking with missing required fields – useful for negative tests */
  static incompleteBooking(): Partial<Booking> {
    return {
      firstname: faker.person.firstName(),
      // lastname intentionally omitted
      totalprice: 100,
    };
  }

  /** Booking with invalid date order */
  static invalidDateOrderBooking(): Booking {
    return this.validBooking({
      bookingdates: {
        checkin: this.futureDate(10),
        checkout: this.futureDate(5), // checkout before checkin
      },
    });
  }
}