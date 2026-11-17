import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { Booking, BookingId, BookingResponse, BookingUpdate } from '../models/Booking';

export interface BookingSearchParams {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Client for /booking endpoints.
 * Encapsulates all booking-related HTTP interactions.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(booking: Booking): Promise<BookingResponse> {
    const response = await this.request.post('/booking', {
      data: booking,
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok(), `Create booking failed: ${response.status()}`).toBeTruthy();
    return (await response.json()) as BookingResponse;
  }

  async createRaw(booking: unknown): Promise<APIResponse> {
    return this.request.post('/booking', {
      data: booking,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async getById(id: number): Promise<Booking> {
    const response = await this.request.get(`/booking/${id}`);
    expect(response.ok(), `Get booking ${id} failed: ${response.status()}`).toBeTruthy();
    return (await response.json()) as Booking;
  }

  async getByIdRaw(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async getAllIds(params?: BookingSearchParams): Promise<BookingId[]> {
     const response = await this.request.get('/booking', {
      params: params as Record<string, string> | undefined,
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as BookingId[];
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(
    id: number,
    booking: Booking,
    authCookie: string
  ): Promise<Booking> {
    const response = await this.request.put(`/booking/${id}`, {
      data: booking,
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
    });

    expect(response.ok(), `Update booking ${id} failed: ${response.status()}`).toBeTruthy();
    return (await response.json()) as Booking;
  }

  async partialUpdate(
    id: number,
    updates: BookingUpdate,
    authCookie: string
  ): Promise<Booking> {
    const response = await this.request.patch(`/booking/${id}`, {
      data: updates,
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
    });

    expect(response.ok(), `Partial update ${id} failed: ${response.status()}`).toBeTruthy();
    return (await response.json()) as Booking;
  }

  async updateRaw(
    id: number,
    booking: unknown,
    authCookie?: string
  ): Promise<APIResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authCookie) headers['Cookie'] = authCookie;

    return this.request.put(`/booking/${id}`, { data: booking, headers });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async delete(id: number, authCookie: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: { Cookie: authCookie },
    });
  }

  // ─── Health ───────────────────────────────────────────────────────────────

  async ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }
}