/**
 * Auth models for Restful Booker API
 */

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
}

export const DEFAULT_CREDENTIALS: AuthCredentials = {
  username: 'admin',
  password: 'password123',
};