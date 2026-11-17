/**
 * Lightweight runtime shape checks (no external schema lib required).
 * Keeps the framework dependency-light while still validating critical fields.
 */

export function isBookingShape(body: unknown): body is {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
} {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.firstname === 'string' &&
    typeof b.lastname === 'string' &&
    typeof b.totalprice === 'number' &&
    typeof b.depositpaid === 'boolean' &&
    typeof b.bookingdates === 'object' &&
    b.bookingdates !== null &&
    typeof (b.bookingdates as any).checkin === 'string' &&
    typeof (b.bookingdates as any).checkout === 'string'
  );
}

export function isBookingResponseShape(body: unknown): body is {
  bookingid: number;
  booking: ReturnType<typeof isBookingShape> extends true ? any : never;
} {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return typeof b.bookingid === 'number' && isBookingShape(b.booking);
}

export function isAuthTokenShape(body: unknown): body is { token: string } {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return typeof b.token === 'string' && b.token.length > 0;
}
