import { test as base, expect, APIRequestContext } from '@playwright/test';
import { AuthClient } from '../clients/AuthClient';
import { BookingClient } from '../clients/BookingClient';

type ApiFixtures = {
  authClient: AuthClient;
  bookingClient: BookingClient;
  /** Pre-authenticated cookie ready for update/delete operations */
  authCookie: string;
};

/**
 * Custom fixture that provides ready-to-use API clients
 * and a valid auth cookie for protected endpoints.
 */
export const test = base.extend<ApiFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  authCookie: async ({ authClient }, use) => {
    const cookie = await authClient.getAuthCookie();
    await use(cookie);
  },
});

export { expect };