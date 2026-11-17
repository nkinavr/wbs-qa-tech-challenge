import { APIRequestContext, expect } from '@playwright/test';
import { AuthCredentials, AuthToken, DEFAULT_CREDENTIALS } from '../models/Auth';

/**
 * Client for /auth endpoint.
 * Responsible only for authentication concerns.
 */
export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async createToken(
    credentials: AuthCredentials = DEFAULT_CREDENTIALS
  ): Promise<AuthToken> {
    const response = await this.request.post('/auth', {
      data: credentials,
    });

    expect(response.ok(), `Auth failed: ${response.status()}`).toBeTruthy();
    const body = (await response.json()) as AuthToken;
    expect(body.token, 'Token should be present').toBeTruthy();
    return body;
  }

  /** Returns a ready-to-use Cookie header value */
  async getAuthCookie(
    credentials: AuthCredentials = DEFAULT_CREDENTIALS
  ): Promise<string> {
    const { token } = await this.createToken(credentials);
    return `token=${token}`;
  }
}